const env = require("../config/env");
const { sql } = require("../db/neon");
const { signToken } = require("../utils/jwt");
const { randomToken, sha256 } = require("../utils/crypto");
const { HttpError } = require("../utils/httpError");

async function issueAuthTokens({ user, userAgent, ipAddress }) {
  const accessToken = signToken({ userId: user.id, role: user.role, email: user.email });
  const refreshToken = randomToken();
  const refreshTokenHash = sha256(refreshToken);
  const expiresAt = new Date(Date.now() + env.refreshTokenExpiresDays * 24 * 60 * 60 * 1000);

  await sql`
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
    VALUES (${user.id}, ${refreshTokenHash}, ${expiresAt.toISOString()}, ${userAgent || null}, ${ipAddress || null})
  `;

  return { accessToken, refreshToken, expiresAt };
}

async function rotateRefreshToken(refreshToken, meta) {
  const tokenHash = sha256(refreshToken);
  const rows = await sql`
    SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked_at, u.email, u.role, u.name, u.is_active
    FROM refresh_tokens rt
    JOIN users u ON u.id = rt.user_id
    WHERE rt.token_hash = ${tokenHash}
    LIMIT 1
  `;

  if (!rows.length) throw new HttpError(401, "Invalid refresh token");
  const row = rows[0];
  if (row.revoked_at) throw new HttpError(401, "Refresh token revoked");
  if (new Date(row.expires_at).getTime() < Date.now()) throw new HttpError(401, "Refresh token expired");
  if (!row.is_active) throw new HttpError(403, "Account is inactive");

  const user = { id: row.user_id, email: row.email, role: row.role, name: row.name };
  const next = await issueAuthTokens({
    user,
    userAgent: meta.userAgent,
    ipAddress: meta.ipAddress
  });

  const nextHash = sha256(next.refreshToken);
  const newTokenRow = await sql`
    SELECT id FROM refresh_tokens WHERE token_hash = ${nextHash} LIMIT 1
  `;

  await sql`
    UPDATE refresh_tokens
    SET revoked_at = now(),
        replaced_by_token_id = ${newTokenRow[0].id}
    WHERE id = ${row.id}
  `;

  return {
    user,
    accessToken: next.accessToken,
    refreshToken: next.refreshToken,
    refreshExpiresAt: next.expiresAt
  };
}

async function revokeRefreshToken(refreshToken) {
  const tokenHash = sha256(refreshToken);
  await sql`
    UPDATE refresh_tokens
    SET revoked_at = now()
    WHERE token_hash = ${tokenHash} AND revoked_at IS NULL
  `;
}

module.exports = { issueAuthTokens, rotateRefreshToken, revokeRefreshToken };
