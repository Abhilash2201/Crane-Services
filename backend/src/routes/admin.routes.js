const express = require("express");
const { z } = require("zod");
const { sql } = require("../db/neon");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");
const { requireAuth, authorize } = require("../middlewares/auth");

const router = express.Router();

const userStatusSchema = z.object({
  isActive: z.boolean()
});

router.use(requireAuth, authorize("admin"));

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const [users] = await sql`
      SELECT
        COUNT(*)::INT AS total_users,
        COUNT(*) FILTER (WHERE role = 'customer')::INT AS customers,
        COUNT(*) FILTER (WHERE role = 'owner')::INT AS owners,
        COUNT(*) FILTER (WHERE role = 'driver')::INT AS drivers
      FROM users
    `;

    const [requests] = await sql`
      SELECT
        COUNT(*)::INT AS total_requests,
        COUNT(*) FILTER (WHERE status = 'pending')::INT AS pending_requests,
        COUNT(*) FILTER (WHERE status = 'in_progress')::INT AS in_progress_requests,
        COUNT(*) FILTER (WHERE status = 'completed')::INT AS completed_requests
      FROM requests
    `;

    const [revenue] = await sql`
      SELECT COALESCE(SUM(amount), 0)::NUMERIC(12,2) AS total_revenue
      FROM payments
      WHERE status = 'paid'
    `;

    res.json({ success: true, data: { users, requests, revenue } });
  })
);

router.get(
  "/users",
  asyncHandler(async (_req, res) => {
    const rows = await sql`
      SELECT id, name, email, phone, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 500
    `;
    res.json({ success: true, data: rows });
  })
);

router.patch(
  "/users/:userId/status",
  asyncHandler(async (req, res) => {
    const { isActive } = userStatusSchema.parse(req.body);
    const { userId } = req.params;

    const rows = await sql`
      UPDATE users
      SET is_active = ${isActive}, updated_at = now()
      WHERE id = ${userId}
      RETURNING id, name, email, role, is_active, updated_at
    `;
    if (!rows.length) throw new HttpError(404, "User not found");

    res.json({ success: true, data: rows[0] });
  })
);

router.get(
  "/requests",
  asyncHandler(async (_req, res) => {
    const rows = await sql`
      SELECT r.*, c.name AS customer_name, o.name AS owner_name
      FROM requests r
      JOIN users c ON c.id = r.customer_id
      LEFT JOIN users o ON o.id = r.owner_id
      ORDER BY r.created_at DESC
      LIMIT 500
    `;
    res.json({ success: true, data: rows });
  })
);

router.get(
  "/payments",
  asyncHandler(async (_req, res) => {
    const rows = await sql`
      SELECT p.*, c.name AS customer_name, o.name AS owner_name
      FROM payments p
      JOIN users c ON c.id = p.customer_id
      JOIN users o ON o.id = p.owner_id
      ORDER BY p.created_at DESC
      LIMIT 500
    `;
    res.json({ success: true, data: rows });
  })
);

router.get(
  "/tracking/:jobId",
  asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    const rows = await sql`
      SELECT id, job_id, driver_id, latitude, longitude, speed_kmph, heading, captured_at
      FROM tracking_events
      WHERE job_id = ${jobId}
      ORDER BY captured_at DESC
      LIMIT 1000
    `;
    res.json({ success: true, data: rows });
  })
);

module.exports = router;
