import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Security check: Validate Session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Input: { knownVersions, clientGlobalHash }
    const { knownVersions, clientGlobalHash } = await request.json();

    // Trigger Autonomous Batch Mailer (Cyclic Heartbeat)
    import('@/lib/mailer').then(m => m.processPendingMails()).catch(e => console.error('Sync-mail trigger failed', e));
    
    // 2. Fetch Server-Side Global Hash (from Persistent Config)
    const hashConfig = await pool.query("SELECT value FROM system_config WHERE key = 'global_hash'");
    const serverGlobalHash = hashConfig.rows[0]?.value || ''; // Default to empty if not set

    // 3. Fast Exit: If hashes match, nothing changed!
    if (clientGlobalHash && clientGlobalHash === serverGlobalHash) {
      return NextResponse.json({ synced: true }, { status: 200 });
    }

    // 3.5 Check-Only Mode: If client didn't send knownVersions, they just wanted to check the hash
    if (!knownVersions) {
      return NextResponse.json({ mismatch: true }, { status: 200 });
    }

    // 4. If Mismatch AND we have versions, Calculate Deltas (Full Fetch)
    const fullQuery = 'SELECT * FROM appointments WHERE is_deleted = FALSE';
    const fullResult = await pool.query(fullQuery);
    const serverRows = fullResult.rows;

    const updates = [];
    const deletions = [];
    const serverIds = new Set();

    serverRows.forEach(row => {
      serverIds.add(row.id.toString());
      const clientVersion = knownVersions[row.id];

      // If client doesn't have it OR has an older version
      if (!clientVersion || row.version > clientVersion) {
        updates.push(row);
      }
    });

    // Check for deletions (IDs the client has but server doesn't)
    Object.keys(knownVersions).forEach(id => {
      if (!serverIds.has(id)) {
        deletions.push(parseInt(id));
      }
    });

    return NextResponse.json({
      updates,      // Full objects to replace or add
      deletions,    // IDs to remove from local state
      serverTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sync Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
