const { sql } = require("../db/neon");
const { sha256, randomOtp } = require("../utils/crypto");
const { sendMail } = require("./mailer");
const { HttpError } = require("../utils/httpError");

async function createAndSendOtp({ email, purpose, userId }) {
  const code = randomOtp();
  const codeHash = sha256(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await sql`
    INSERT INTO otp_verifications (user_id, target_email, purpose, code_hash, expires_at)
    VALUES (${userId || null}, ${email.toLowerCase()}, ${purpose}, ${codeHash}, ${expiresAt.toISOString()})
  `;

  await sendMail({
    to: email,
    subject: `Crane Services OTP for ${purpose}`,
    text: `Your OTP is ${code}. It expires in 10 minutes.`,
    html: `<p>Your OTP is <b>${code}</b>. It expires in 10 minutes.</p>`
  });
}

async function verifyOtp({ email, purpose, otp }) {
  const codeHash = sha256(otp);
  const rows = await sql`
    SELECT id, user_id, target_email, purpose, expires_at, consumed_at, attempts
    FROM otp_verifications
    WHERE target_email = ${email.toLowerCase()}
      AND purpose = ${purpose}
      AND consumed_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (!rows.length) throw new HttpError(400, "OTP not found");
  const record = rows[0];
  if (new Date(record.expires_at).getTime() < Date.now()) throw new HttpError(400, "OTP expired");
  if (record.attempts >= 5) throw new HttpError(429, "Too many invalid attempts");

  if (codeHash !== (await getOtpHash(record.id))) {
    await sql`UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ${record.id}`;
    throw new HttpError(400, "Invalid OTP");
  }

  await sql`UPDATE otp_verifications SET consumed_at = now() WHERE id = ${record.id}`;
  return record;
}

async function getOtpHash(id) {
  const rows = await sql`SELECT code_hash FROM otp_verifications WHERE id = ${id} LIMIT 1`;
  return rows[0]?.code_hash;
}

module.exports = { createAndSendOtp, verifyOtp };
