import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, mobile, email, message } = body;

    const nameToSave = name?.trim().toLowerCase();
    const emailToSave = email?.trim().toLowerCase() || null;
    const mobileToSave = mobile?.replace(/\D/g, '').slice(-10);
    
    // Normalize and limit message
    let messageToSave = message?.replace(/[ \t]+/g, ' ').replace(/\n+/g, '\n').trim() || null;
    if (messageToSave && messageToSave.length > 2000) {
      return NextResponse.json({ error: 'Message exceeds 2000 characters' }, { status: 400 });
    }

    if (!nameToSave || !mobileToSave) {
      return NextResponse.json(
        { error: 'Name and mobile are required' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO appointments (name, mobile, email, message)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const values = [nameToSave, mobileToSave, emailToSave, messageToSave];

    const result = await pool.query(query, values);

    // Trigger Autonomous Batch Mailer (Cyclic Check)
    import('@/lib/mailer').then(m => m.processPendingMails()).catch(e => console.error('Auto-mail trigger failed', e));

    return NextResponse.json(
      { message: 'Appointment created successfully', id: result.rows[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, email, message } = body;

    const emailToSave = email?.trim().toLowerCase() || null;
    
    // Normalize and limit message
    let messageToSave = message?.replace(/[ \t]+/g, ' ').replace(/\n+/g, '\n').trim() || null;
    if (messageToSave && messageToSave.length > 2000) {
       return NextResponse.json({ error: 'Message exceeds 2000 characters' }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required for update' }, { status: 400 });
    }

    const query = `
      UPDATE appointments 
      SET email = COALESCE($1, email), 
          message = COALESCE($2, message)
      WHERE id = $3
      RETURNING *
    `;
    const values = [emailToSave, messageToSave, id];

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Trigger Autonomous Batch Mailer (Cyclic Check)
    import('@/lib/mailer').then(m => m.processPendingMails()).catch(e => console.error('Auto-mail trigger failed', e));

    return NextResponse.json({ message: 'Lead updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
