import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Security check: Require admin key in Authorization header
    // Security check: Validate Session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const query = 'SELECT * FROM appointments ORDER BY created_at DESC';
    const result = await pool.query(query);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, contacted, visited, admin_notes, email, message } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Build dynamic query based on what is provided
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (typeof contacted !== 'undefined') {
      fields.push(`contacted = $${paramIndex++}`);
      values.push(contacted);
    }
    if (typeof visited !== 'undefined') {
      fields.push(`visited = $${paramIndex++}`);
      values.push(visited);
    }
    if (typeof admin_notes !== 'undefined') {
      fields.push(`admin_notes = $${paramIndex++}`);
      values.push(admin_notes);
    }
    if (typeof email !== 'undefined') {
      fields.push(`email = $${paramIndex++}`);
      values.push(email);
    }
    if (typeof message !== 'undefined') {
      fields.push(`message = $${paramIndex++}`);
      values.push(message);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(id);
    const query = `UPDATE appointments SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    
    const result = await pool.query(query, values);

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
