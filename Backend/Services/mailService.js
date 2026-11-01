import nodemailer from 'nodemailer';

let transporter;
const getTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) return null;
  transporter ||= nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_APP_PASSWORD },
  });
  return transporter;
};

/** Best-effort e-mail. Returns true when sent. */
export async function sendMail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    console.warn('Email not configured (EMAIL_USER / EMAIL_APP_PASSWORD); skipped:', subject);
    return false;
  }
  try {
    await t.sendMail({ from: `"Vitalis Healthcare" <${process.env.EMAIL_USER}>`, to, subject, text, html });
    return true;
  } catch (err) {
    console.error('sendMail failed:', err.message);
    return false;
  }
}
