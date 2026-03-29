const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
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

const jobIdSchema = z.object({
  jobId: z.coerce.string().uuid()
});

const uploadDir = path.join(process.cwd(), "uploads", "job-proofs");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext.length <= 10 ? ext : "";
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image uploads are allowed"));
    }
  }
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
    const io = req.app.get("io");
    io?.to(`job:${payload.jobId}`).emit("tracking:updated", event[0]);
    io?.to("role:admin").emit("tracking:updated", event[0]);

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

    const io = req.app.get("io");
    io?.to(`job:${jobId}`).emit("job:status_changed", {
      jobId,
      requestId: job[0].request_id,
      status
    });
    io?.to("role:admin").emit("job:status_changed", {
      jobId,
      requestId: job[0].request_id,
      status
    });

    res.json({ success: true, data: job[0] });
  })
);

router.post(
  "/jobs/:jobId/proofs",
  upload.array("photos", 6),
  asyncHandler(async (req, res) => {
    const { jobId } = jobIdSchema.parse(req.params);
    const files = Array.isArray(req.files) ? req.files : [];

    if (!files.length) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const job = await sql`
      SELECT id FROM jobs WHERE id = ${jobId} AND driver_id = ${req.user.userId} LIMIT 1
    `;
    if (!job.length) throw new HttpError(404, "Job not found for this driver");

    const inserted = [];
    for (const file of files) {
      const url = `/uploads/job-proofs/${file.filename}`;
      const result = await sql`
        INSERT INTO job_proofs (job_id, driver_id, url, filename, mime_type, size_bytes)
        VALUES (${jobId}, ${req.user.userId}, ${url}, ${file.filename}, ${file.mimetype}, ${file.size})
        RETURNING *
      `;
      inserted.push(result[0]);
    }

    res.status(201).json({ success: true, data: inserted });
  })
);

module.exports = router;
