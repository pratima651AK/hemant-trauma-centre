import nodemailer from 'nodemailer';

const isMailerEnabled = process.env.MAILER_ENABLED === 'true';

if (isMailerEnabled && !process.env.MAIL_HOST) {
  console.error('MAILER Error: MAILER_ENABLED is true but MAIL_HOST is not defined.');
}

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.MAILER_ENABLED !== 'true') {
    console.log('Mailer is disabled. Email not sent to:', to);
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Hemant Trauma Centre" <${process.env.MAIL_FROM}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}
/**
 * Checks for unmailed appointments and sends them in a batch.
 * Strictly Cyclic: Only sends if at least 15 minutes have passed since last_mailed_at.
 */
export async function processPendingMails() {
  try {
    const pool = (await import('@/lib/db')).default;
    const { EmailTemplate } = await import('@/lib/EmailTemplate');

    // 1. Get throttling context (15-minute cycle)
    const configResult = await pool.query("SELECT value FROM system_config WHERE key = 'last_mailed_at'");
    const lastMailedAt = configResult.rows[0]?.value ? new Date(configResult.rows[0].value) : new Date(0);
    const now = new Date();
    const minutesSinceLastMail = (now.getTime() - lastMailedAt.getTime()) / (1000 * 60);

    // 2. Fetch ALL unmailed records (Step 1 or Step 2)
    const pendingResult = await pool.query(
      "SELECT * FROM appointments WHERE mailed = FALSE"
    );

    if (pendingResult.rows.length === 0) return;

    // Decision Logic: STRICT CYCLIC
    // We only send if the 15-minute window has passed.
    const isWindowOpen = minutesSinceLastMail >= 15;

    if (!isWindowOpen) {
      console.log(`[Batch Mail] ${pendingResult.rows.length} leads waiting. Next cycle in ${Math.round(15 - minutesSinceLastMail)}m.`);
      return;
    }

    // 3. Send the batch
    const count = pendingResult.rows.length;
    await sendEmail(
      process.env.ADMIN_EMAIL || '',
      `New Patient Leads (${count} records)`,
      EmailTemplate(pendingResult.rows)
    );

    // 4. Mark all items in this batch as mailed and update timestamp
    const sentIds = pendingResult.rows.map((r: { id: number }) => r.id);
    await pool.query("UPDATE appointments SET mailed = TRUE WHERE id = ANY($1)", [sentIds]);
    await pool.query("UPDATE system_config SET value = $1 WHERE key = 'last_mailed_at'", [now.toISOString()]);
    
    console.log(`[Batch Mail] Success: Sent batch of ${count} leads.`);
  } catch (error) {
    console.error('[Batch Mail] Error processing pending mails:', error);
  }
}
