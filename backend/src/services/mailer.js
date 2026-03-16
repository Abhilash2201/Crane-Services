const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) return null;

  // transporter = nodemailer.createTransport({
  //   host: env.smtpHost,
  //   port: env.smtpPort,
  //   secure: env.smtpPort === 465,
  //   auth: {
  //     user: env.smtpUser,
  //     pass: env.smtpPass
  //   },
  //   connectionTimeout: 10000,
  //   greetingTimeout: 10000,
  //   socketTimeout: 20000,
  //   logger: env.nodeEnv !== "test",
  //   debug: env.nodeEnv !== "test"
  // });

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    requireTLS: true,
    tls: {
      rejectUnauthorized: false,
    },
  });
  return transporter;
}

async function sendMail({ to, subject, text, html }) {
  const tx = getTransporter();
  if (!tx) {
    console.log(
      `[MAILER_DISABLED] to=${to} subject="${subject}" text="${text}"`,
    );
    return { accepted: [to], disabled: true };
  }
  const info = await tx.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text,
    html,
  });
  console.log(
    `[MAILER_RESULT] to=${to} accepted=${(info.accepted || []).join(",")} rejected=${(info.rejected || []).join(",")} response="${info.response || ""}"`,
  );
  return info;
}

async function verifySmtp() {
  const tx = getTransporter();
  if (!tx) return { disabled: true };
  const verified = await tx.verify();
  return { verified };
}

module.exports = { sendMail, verifySmtp };
