import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Ensure Archive Table Exists (Lazy Setup)
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS archived_appointments (
        original_id INTEGER,
        name VARCHAR(255),
        mobile VARCHAR(20),
        email VARCHAR(255),
        message TEXT,
        contacted BOOLEAN,
        visited BOOLEAN,
        admin_notes TEXT,
        appointment_created_at TIMESTAMP,
        version INTEGER,
        archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);

    // 2. Transaction: Move & Delete
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Move to Archive
      const moveQuery = `
        INSERT INTO archived_appointments (original_id, name, mobile, email, message, contacted, visited, admin_notes, appointment_created_at, version)
        SELECT id, name, mobile, email, message, contacted, visited, admin_notes, created_at, version
        FROM appointments 
        WHERE is_deleted = TRUE
      `;
      const moveResult = await client.query(moveQuery);
      const rowCount = moveResult.rowCount;

      // Hard Delete from Main Table
      if (rowCount > 0) {
        const deleteQuery = `DELETE FROM appointments WHERE is_deleted = TRUE`;
        await client.query(deleteQuery);
      }

      await client.query('COMMIT');

      return NextResponse.json({ 
        message: 'Archived successfully', 
        count: rowCount 
      });

    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Archive error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
