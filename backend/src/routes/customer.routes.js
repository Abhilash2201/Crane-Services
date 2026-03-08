const express = require("express");
const { z } = require("zod");
const { sql } = require("../db/neon");
const { asyncHandler } = require("../utils/asyncHandler");
const { requireAuth, authorize } = require("../middlewares/auth");

const router = express.Router();

const requestSchema = z.object({
  pickupAddress: z.string().min(5),
  dropAddress: z.string().min(5).optional(),
  requiredCapacityTons: z.coerce.number().positive().optional(),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional()
});

router.use(requireAuth, authorize("customer"));

router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const summary = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending')::INT AS pending_requests,
        COUNT(*) FILTER (WHERE status = 'accepted')::INT AS accepted_requests,
        COUNT(*) FILTER (WHERE status = 'completed')::INT AS completed_requests
      FROM requests
      WHERE customer_id = ${req.user.userId}
    `;

    const recent = await sql`
      SELECT id, pickup_address, drop_address, status, scheduled_at, created_at
      FROM requests
      WHERE customer_id = ${req.user.userId}
      ORDER BY created_at DESC
      LIMIT 10
    `;

    res.json({ success: true, data: { summary: summary[0], recentRequests: recent } });
  })
);

router.post(
  "/requests",
  asyncHandler(async (req, res) => {
    const payload = requestSchema.parse(req.body);
    const result = await sql`
      INSERT INTO requests (
        customer_id, pickup_address, drop_address, required_capacity_tons, scheduled_at, notes
      )
      VALUES (
        ${req.user.userId},
        ${payload.pickupAddress},
        ${payload.dropAddress || null},
        ${payload.requiredCapacityTons || null},
        ${payload.scheduledAt || null},
        ${payload.notes || null}
      )
      RETURNING *
    `;

    res.status(201).json({ success: true, data: result[0] });
  })
);

router.get(
  "/requests",
  asyncHandler(async (req, res) => {
    const rows = await sql`
      SELECT r.*, j.id AS job_id, j.driver_id, j.status AS job_status
      FROM requests r
      LEFT JOIN jobs j ON j.request_id = r.id
      WHERE r.customer_id = ${req.user.userId}
      ORDER BY r.created_at DESC
    `;

    res.json({ success: true, data: rows });
  })
);

module.exports = router;
