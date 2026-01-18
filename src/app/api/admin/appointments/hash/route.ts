import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import CryptoJS from 'crypto-js';
import { EmailTemplate } from '@/lib/EmailTemplate';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (authHeader !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch minimal state for hashing
    const query = 'SELECT id, contacted, visited, admin_notes, email, message FROM appointments ORDER BY id ASC';
    const result = await pool.query(query);
    
    // Autonomous Batch Mailer Trigger (Heartbeat)
    try {
      const { processPendingMails } = await import('@/lib/mailer');
      await processPendingMails();
    } catch (mailError) {
      console.error('Batch mail failed:', mailError);
    }

    // Generate Fingerprint
    const fingerprint = CryptoJS.MD5(JSON.stringify(result.rows)).toString();

    return NextResponse.json({ fingerprint });
  } catch (error) {
    console.error('Hash error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
