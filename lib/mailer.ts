import nodemailer from 'nodemailer';

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
