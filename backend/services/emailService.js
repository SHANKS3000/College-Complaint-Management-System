const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER && process.env.SMTP_PASS
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined
});

async function sendComplaintStatusEmail({ to, studentName, complaintTitle, complaintId, oldStatus, newStatus }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!process.env.SMTP_HOST || !from) {
    throw new Error('SMTP_HOST and EMAIL_FROM (or SMTP_USER) must be configured to send email.');
  }

  const portalUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
  await transporter.sendMail({
    from,
    to,
    subject: `Complaint status updated: ${complaintTitle}`,
    text: [
      `Hello ${studentName},`,
      '',
      `The status of your complaint "${complaintTitle}" has changed.`,
      `Previous status: ${oldStatus}`,
      `New status: ${newStatus}`,
      '',
      `Sign in to the portal to view complaint #${complaintId}:`,
      `${portalUrl}/student-dashboard.html`
    ].join('\n')
  });
}

module.exports = { sendComplaintStatusEmail };