const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) return null;

  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass
    }
  });
  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const tx = getTransporter();
  if (!tx) {
    console.log(`[MAILER_DISABLED] to=${to} subject="${subject}" text="${text}"`);
    return { accepted: [to], disabled: true };
  }
  return tx.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text,
    html
  });
}

module.exports = { sendMail };
