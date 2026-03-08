const express = require("express");
const bcrypt = require("bcryptjs");
const { z } = require("zod");
const { sql } = require("../db/neon");
const { signToken } = require("../utils/jwt");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");
const { requireAuth } = require("../middlewares/auth");

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional(),
  password: z.string().min(6),
  role: z.enum(["admin", "customer", "owner", "driver"])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const existing = await sql`SELECT id FROM users WHERE email = ${payload.email} LIMIT 1`;
    if (existing.length) throw new HttpError(409, "Email already in use");

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const result = await sql`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (${payload.name}, ${payload.email}, ${payload.phone || null}, ${passwordHash}, ${payload.role})
      RETURNING id, name, email, role, created_at
    `;

    const user = result[0];
    const token = signToken({ userId: user.id, role: user.role, email: user.email });

    res.status(201).json({ success: true, data: { user, token } });
  })
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

    const token = signToken({ userId: user.id, role: user.role, email: user.email });
    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
        token
      }
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await sql`
      SELECT id, name, email, phone, role, is_active, created_at, updated_at
      FROM users
      WHERE id = ${req.user.userId}
      LIMIT 1
    `;
    if (!result.length) throw new HttpError(404, "User not found");

    res.json({ success: true, data: result[0] });
  })
);

module.exports = router;
