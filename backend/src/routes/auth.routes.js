const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const { sql } = require("../db/neon");
const {
  issueAuthTokens,
  rotateRefreshToken,
  revokeRefreshToken,
} = require("../services/authTokens");
const { createAndSendOtp, verifyOtp } = require("../services/otp");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");
const { requireAuth } = require("../middlewares/auth");

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  password: z.string().min(6),
  role: z.enum(["admin", "customer", "owner", "driver"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(32),
});

const emailSchema = z.object({
  email: z.string().email(),
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6),
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const existing =
      await sql`SELECT id FROM users WHERE email = ${payload.email} LIMIT 1`;
    if (existing.length) throw new HttpError(409, "Email already in use");

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const result = await sql`
      INSERT INTO users (name, email, phone, password_hash, role, email_verified_at)
      VALUES (${payload.name}, ${payload.email}, ${payload.phone || null}, ${passwordHash}, ${payload.role}, null)
      RETURNING id, name, email, role, created_at, email_verified_at
    `;

    const user = result[0];
    await createAndSendOtp({
      email: user.email,
      purpose: "email_verification",
      userId: user.id,
    });
    const tokens = await issueAuthTokens({
      user,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          emailVerified: Boolean(user.email_verified_at),
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        refreshExpiresAt: tokens.expiresAt,
      },
    });
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const result = await sql`
      SELECT id, name, email, role, password_hash, is_active
      FROM users
      WHERE email = ${payload.email}
      LIMIT 1
    `;

    const user = result[0];
    if (!user) throw new HttpError(401, "Invalid credentials");
    if (!user.is_active) throw new HttpError(403, "Account is inactive");

    const isValid = await bcrypt.compare(payload.password, user.password_hash);
    if (!isValid) throw new HttpError(401, "Invalid credentials");

    const tokens = await issueAuthTokens({
      user,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        refreshExpiresAt: tokens.expiresAt,
      },
    });
  }),
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const payload = refreshSchema.parse(req.body);
    const next = await rotateRefreshToken(payload.refreshToken, {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });
    res.json({
      success: true,
      data: {
        user: {
          id: next.user.id,
          name: next.user.name,
          email: next.user.email,
          role: next.user.role,
        },
        accessToken: next.accessToken,
        refreshToken: next.refreshToken,
        refreshExpiresAt: next.refreshExpiresAt,
      },
    });
  }),
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const payload = refreshSchema.parse(req.body);
    await revokeRefreshToken(payload.refreshToken);
    res.json({ success: true });
  }),
);

router.post(
  "/email/request-otp",
  asyncHandler(async (req, res) => {
    const payload = emailSchema.parse(req.body);
    const users =
      await sql`SELECT id FROM users WHERE email = ${payload.email.toLowerCase()} LIMIT 1`;
    if (users.length) {
      const info = await createAndSendOtp({
        email: payload.email,
        purpose: "email_verification",
        userId: users[0].id,
      });
      if (info?.disabled || (info?.rejected && info.rejected.length)) {
        throw new HttpError(502, "Email delivery failed");
      }
    }
    res.json({ success: true });
  }),
);

router.post(
  "/email/verify-otp",
  asyncHandler(async (req, res) => {
    const payload = verifyEmailSchema.parse(req.body);
    await verifyOtp({
      email: payload.email,
      purpose: "email_verification",
      otp: payload.otp,
    });
    const rows = await sql`
      UPDATE users
      SET email_verified_at = now(), updated_at = now()
      WHERE email = ${payload.email.toLowerCase()}
      RETURNING id, email, email_verified_at
    `;
    res.json({ success: true, data: rows[0] || null });
  }),
);

router.post(
  "/password/request-reset",
  asyncHandler(async (req, res) => {
    const payload = emailSchema.parse(req.body);
    const users =
      await sql`SELECT id FROM users WHERE email = ${payload.email.toLowerCase()} LIMIT 1`;
    if (users.length) {
      await createAndSendOtp({
        email: payload.email,
        purpose: "password_reset",
        userId: users[0].id,
      });
    }
    res.json({ success: true });
  }),
);

router.post(
  "/password/reset",
  asyncHandler(async (req, res) => {
    const payload = resetPasswordSchema.parse(req.body);
    await verifyOtp({
      email: payload.email,
      purpose: "password_reset",
      otp: payload.otp,
    });
    const passwordHash = await bcrypt.hash(payload.newPassword, 10);
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, updated_at = now()
      WHERE email = ${payload.email.toLowerCase()}
    `;
    res.json({ success: true });
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await sql`
      SELECT id, name, email, phone, role, is_active, email_verified_at, created_at, updated_at
      FROM users
      WHERE id = ${req.user.userId}
      LIMIT 1
    `;
    if (!result.length) throw new HttpError(404, "User not found");

    res.json({ success: true, data: result[0] });
  }),
);

module.exports = router;
