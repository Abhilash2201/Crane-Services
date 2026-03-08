const express = require("express");
const { z } = require("zod");
const { sql } = require("../db/neon");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");
const { requireAuth, authorize } = require("../middlewares/auth");

const router = express.Router();

const trackingSchema = z.object({
  jobId: z.string().uuid(),
  latitude: z.coerce.number().gte(-90).lte(90),
  longitude: z.coerce.number().gte(-180).lte(180),
  speedKmph: z.coerce.number().min(0).optional(),
  heading: z.coerce.number().gte(0).lte(360).optional()
});

const jobStatusSchema = z.object({
  status: z.enum(["assigned", "en_route", "working", "completed", "cancelled"])
});

router.use(requireAuth, authorize("driver"));

router.get(
  "/jobs",
  asyncHandler(async (req, res) => {
    const rows = await sql`
      SELECT j.*, r.pickup_address, r.drop_address, r.customer_id
      FROM jobs j
      JOIN requests r ON r.id = j.request_id
      WHERE j.driver_id = ${req.user.userId}
      ORDER BY j.created_at DESC
    `;
    res.json({ success: true, data: rows });
  })
);

router.post(
  "/tracking",
  asyncHandler(async (req, res) => {
    const payload = trackingSchema.parse(req.body);

    const job = await sql`
      SELECT id FROM jobs WHERE id = ${payload.jobId} AND driver_id = ${req.user.userId} LIMIT 1
    `;
    if (!job.length) throw new HttpError(404, "Job not found for this driver");

    const event = await sql`
      INSERT INTO tracking_events (job_id, driver_id, latitude, longitude, speed_kmph, heading)
      VALUES (
        ${payload.jobId},
        ${req.user.userId},
        ${payload.latitude},
        ${payload.longitude},
        ${payload.speedKmph || null},
        ${payload.heading || null}
      )
      RETURNING *
    `;

    res.status(201).json({ success: true, data: event[0] });
  })
);

router.patch(
  "/jobs/:jobId/status",
  asyncHandler(async (req, res) => {
    const { status } = jobStatusSchema.parse(req.body);
    const { jobId } = req.params;

    const job = await sql`
      UPDATE jobs
      SET status = ${status},
          started_at = CASE WHEN ${status} = 'working' AND started_at IS NULL THEN now() ELSE started_at END,
          completed_at = CASE WHEN ${status} = 'completed' THEN now() ELSE completed_at END,
          updated_at = now()
      WHERE id = ${jobId} AND driver_id = ${req.user.userId}
      RETURNING *
    `;
    if (!job.length) throw new HttpError(404, "Job not found");

    if (status === "completed") {
      await sql`
        UPDATE requests
        SET status = 'completed', updated_at = now()
        WHERE id = ${job[0].request_id}
      `;
    } else if (status === "working" || status === "en_route") {
      await sql`
        UPDATE requests
        SET status = 'in_progress', updated_at = now()
        WHERE id = ${job[0].request_id}
      `;
    }

    res.json({ success: true, data: job[0] });
  })
);

module.exports = router;
