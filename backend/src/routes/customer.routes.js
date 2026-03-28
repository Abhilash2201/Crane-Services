const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { z } = require("zod");
const { sql } = require("../db/neon");
const { asyncHandler } = require("../utils/asyncHandler");
const { requireAuth, authorize } = require("../middlewares/auth");
const { getPricingRule, calculatePrice } = require("../services/pricing");

const router = express.Router();

const requestSchema = z.object({
  pickupAddress: z.string().min(5),
  dropAddress: z.string().min(5).optional(),
  requiredCapacityTons: z.coerce.number().positive().optional(),
  durationHours: z.coerce.number().positive().optional(),
  scheduledAt: z.string().datetime().optional(),
  notes: z.string().max(500).optional()
});

const cancelSchema = z.object({
  id: z.coerce.string().uuid()
});

const photoParamsSchema = z.object({
  id: z.coerce.string().uuid()
});

const requestIdSchema = z.object({
  id: z.coerce.string().uuid()
});

const uploadDir = path.join(process.cwd(), "uploads", "requests");
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
    const pricing = await getPricingRule({
      capacityTons: payload.requiredCapacityTons
    });
    const estimatedPrice = calculatePrice(payload.durationHours, pricing);
    const result = await sql`
      INSERT INTO requests (
        customer_id, pickup_address, drop_address, required_capacity_tons, duration_hours, scheduled_at, notes, estimated_price
      )
      VALUES (
        ${req.user.userId},
        ${payload.pickupAddress},
        ${payload.dropAddress || null},
        ${payload.requiredCapacityTons || null},
        ${payload.durationHours || null},
        ${payload.scheduledAt || null},
        ${payload.notes || null},
        ${estimatedPrice}
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

router.get(
  "/requests/:id/tracking",
  asyncHandler(async (req, res) => {
    const { id } = requestIdSchema.parse(req.params);
    const rows = await sql`
      SELECT
        r.*,
        j.id AS job_id,
        j.status AS job_status,
        j.driver_id,
        j.crane_registration,
        j.started_at,
        j.completed_at,
        owner.name AS owner_name,
        owner.phone AS owner_phone,
        driver.name AS driver_name,
        driver.phone AS driver_phone
      FROM requests r
      LEFT JOIN jobs j ON j.request_id = r.id
      LEFT JOIN users owner ON owner.id = r.owner_id
      LEFT JOIN users driver ON driver.id = j.driver_id
      WHERE r.id = ${id} AND r.customer_id = ${req.user.userId}
      LIMIT 1
    `;
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    const request = rows[0];
    let lastEvent = null;
    if (request.job_id) {
      const events = await sql`
        SELECT *
        FROM tracking_events
        WHERE job_id = ${request.job_id}
        ORDER BY captured_at DESC
        LIMIT 1
      `;
      lastEvent = events[0] || null;
    }

    res.json({
      success: true,
      data: {
        request,
        driver: request.driver_id
          ? {
              id: request.driver_id,
              name: request.driver_name,
              phone: request.driver_phone
            }
          : null,
        owner: request.owner_id
          ? {
              id: request.owner_id,
              name: request.owner_name,
              phone: request.owner_phone
            }
          : null,
        job: request.job_id
          ? {
              id: request.job_id,
              status: request.job_status,
              craneRegistration: request.crane_registration,
              startedAt: request.started_at,
              completedAt: request.completed_at
            }
          : null,
        lastEvent
      }
    });
  })
);

router.patch(
  "/requests/:id/cancel",
  asyncHandler(async (req, res) => {
    const { id } = cancelSchema.parse(req.params);
    const rows = await sql`
      SELECT id, status
      FROM requests
      WHERE id = ${id} AND customer_id = ${req.user.userId}
      LIMIT 1
    `;
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    const current = rows[0].status;
    if (current === "completed" || current === "cancelled") {
      return res.status(400).json({ success: false, message: "Request cannot be cancelled" });
    }

    const updated = await sql`
      UPDATE requests
      SET status = 'cancelled', updated_at = now()
      WHERE id = ${id} AND customer_id = ${req.user.userId}
      RETURNING *
    `;

    res.json({ success: true, data: updated[0] });
  })
);

router.post(
  "/requests/:id/photos",
  upload.array("photos", 6),
  asyncHandler(async (req, res) => {
    const { id } = photoParamsSchema.parse(req.params);
    const files = Array.isArray(req.files) ? req.files : [];

    if (!files.length) {
      return res.status(400).json({ success: false, message: "No files uploaded" });
    }

    const rows = await sql`
      SELECT id
      FROM requests
      WHERE id = ${id} AND customer_id = ${req.user.userId}
      LIMIT 1
    `;
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    const inserted = [];
    for (const file of files) {
      const url = `/uploads/requests/${file.filename}`;
      const result = await sql`
        INSERT INTO request_photos (request_id, url, filename, mime_type, size_bytes)
        VALUES (${id}, ${url}, ${file.filename}, ${file.mimetype}, ${file.size})
        RETURNING *
      `;
      inserted.push(result[0]);
    }

    res.status(201).json({ success: true, data: inserted });
  })
);

module.exports = router;
