const express = require("express");
const { z } = require("zod");
const { sql } = require("../db/neon");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");
const { requireAuth, authorize } = require("../middlewares/auth");

const router = express.Router();

const acceptRequestSchema = z.object({
  requestId: z.string().uuid(),
  priceQuote: z.coerce.number().positive()
});

const assignDriverSchema = z.object({
  requestId: z.string().uuid(),
  driverId: z.string().uuid(),
  craneRegistration: z.string().min(3)
});

router.use(requireAuth, authorize("owner"));

router.get(
  "/incoming-requests",
  asyncHandler(async (_req, res) => {
    const rows = await sql`
      SELECT id, customer_id, pickup_address, drop_address, required_capacity_tons,
             scheduled_at, status, notes, created_at
      FROM requests
      WHERE status = 'pending'
      ORDER BY created_at DESC
      LIMIT 50
    `;
    res.json({ success: true, data: rows });
  })
);

router.post(
  "/accept-request",
  asyncHandler(async (req, res) => {
    const payload = acceptRequestSchema.parse(req.body);
    const requestRow = await sql`
      UPDATE requests
      SET owner_id = ${req.user.userId},
          status = 'accepted',
          price_quote = ${payload.priceQuote},
          updated_at = now()
      WHERE id = ${payload.requestId} AND status = 'pending'
      RETURNING *
    `;

    if (!requestRow.length) throw new HttpError(404, "Pending request not found");
    const io = req.app.get("io");
    io?.to("role:admin").emit("request:accepted", requestRow[0]);
    res.json({ success: true, data: requestRow[0] });
  })
);

router.post(
  "/assign-driver",
  asyncHandler(async (req, res) => {
    const payload = assignDriverSchema.parse(req.body);
    const request = await sql`
      SELECT id, owner_id, status
      FROM requests
      WHERE id = ${payload.requestId}
      LIMIT 1
    `;
    if (!request.length) throw new HttpError(404, "Request not found");
    if (request[0].owner_id !== req.user.userId) throw new HttpError(403, "Not your request");
    if (request[0].status === "pending") throw new HttpError(400, "Request must be accepted first");

    const job = await sql`
      INSERT INTO jobs (request_id, owner_id, driver_id, crane_registration)
      VALUES (${payload.requestId}, ${req.user.userId}, ${payload.driverId}, ${payload.craneRegistration})
      ON CONFLICT (request_id) DO UPDATE
      SET driver_id = EXCLUDED.driver_id,
          crane_registration = EXCLUDED.crane_registration,
          updated_at = now()
      RETURNING *
    `;
    const io = req.app.get("io");
    io?.to(`user:${payload.driverId}`).emit("dispatch:job_assigned", job[0]);
    io?.to("role:admin").emit("dispatch:job_assigned", job[0]);
    io?.to(`job:${job[0].id}`).emit("dispatch:job_assigned", job[0]);
    res.json({ success: true, data: job[0] });
  })
);

router.get(
  "/jobs",
  asyncHandler(async (req, res) => {
    const rows = await sql`
      SELECT j.*, r.pickup_address, r.drop_address, r.status AS request_status
      FROM jobs j
      JOIN requests r ON r.id = j.request_id
      WHERE j.owner_id = ${req.user.userId}
      ORDER BY j.created_at DESC
    `;
    res.json({ success: true, data: rows });
  })
);

module.exports = router;
