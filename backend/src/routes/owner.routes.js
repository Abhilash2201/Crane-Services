const express = require("express");
const { z } = require("zod");
const bcrypt = require("bcryptjs");
const { sql } = require("../db/neon");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");
const { requireAuth, authorize } = require("../middlewares/auth");

const router = express.Router();

const acceptRequestSchema = z.object({
  requestId: z.string().uuid()
});

const assignDriverSchema = z.object({
  requestId: z.string().uuid(),
  driverId: z.string().uuid(),
  craneRegistration: z.string().min(3)
});

const addDriverSchema = z.object({
  driverId: z.string().uuid()
});

const createDriverSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(6).optional()
});

const driverSearchSchema = z.object({
  query: z.string().min(2)
});

const fleetCreateSchema = z.object({
  name: z.string().min(2),
  type: z.string().optional(),
  variantId: z.string().uuid().optional(),
  capacityTons: z.coerce.number().positive().optional(),
  registration: z.string().min(3).optional(),
  status: z.enum(["active", "inactive", "maintenance"]).optional()
});

const fleetUpdateSchema = fleetCreateSchema.partial();

const variantRequestCreateSchema = z.object({
  requestId: z.string().uuid().optional(),
  suggestedName: z.string().min(2),
  capacityTons: z.coerce.number().positive().optional(),
  description: z.string().max(500).optional(),
  expectedBaseCharge: z.coerce.number().positive().optional(),
  expectedBaseHours: z.coerce.number().positive().optional(),
  expectedOvertimeRate: z.coerce.number().positive().optional()
});

router.use(requireAuth, authorize("owner"));

router.get(
  "/incoming-requests",
  asyncHandler(async (req, res) => {
    const rows = await sql`
      SELECT r.id, r.customer_id, r.pickup_address, r.drop_address, r.required_capacity_tons,
             r.variant_id, v.name AS variant_name, r.scheduled_at, r.status, r.notes, r.created_at,
             u.name AS customer_name
      FROM requests r
      LEFT JOIN crane_variants v ON v.id = r.variant_id
      LEFT JOIN users u ON u.id = r.customer_id
      WHERE r.status = 'pending'
        AND (
          r.variant_id IS NULL
          OR EXISTS (
            SELECT 1
            FROM fleet f
            WHERE f.owner_id = ${req.user.userId}
              AND f.status = 'active'
              AND f.variant_id = r.variant_id
          )
        )
      ORDER BY r.created_at DESC
      LIMIT 50
    `;
    res.json({ success: true, data: rows });
  })
);

router.get(
  "/accepted-requests",
  asyncHandler(async (req, res) => {
    const rows = await sql`
      SELECT r.id, r.customer_id, r.pickup_address, r.drop_address, r.required_capacity_tons,
             r.variant_id, r.scheduled_at, r.status, r.notes, r.created_at,
             u.name AS customer_name
      FROM requests r
      LEFT JOIN users u ON u.id = r.customer_id
      WHERE r.status = 'accepted' AND r.owner_id = ${req.user.userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    res.json({ success: true, data: rows });
  })
);

router.get(
  "/drivers",
  asyncHandler(async (req, res) => {
    const rows = await sql`
      SELECT u.id, u.name, u.email, u.phone, u.is_active, d.created_at
      FROM owner_drivers d
      JOIN users u ON u.id = d.driver_id
      WHERE d.owner_id = ${req.user.userId}
      ORDER BY d.created_at DESC
    `;
    res.json({ success: true, data: rows });
  })
);

router.get(
  "/driver-search",
  asyncHandler(async (req, res) => {
    const { query } = driverSearchSchema.parse(req.query);
    const q = `%${query.toLowerCase()}%`;
    const rows = await sql`
      SELECT id, name, email, phone, is_active
      FROM users
      WHERE role = 'driver'
        AND (
          LOWER(name) LIKE ${q}
          OR LOWER(email) LIKE ${q}
          OR phone LIKE ${q}
        )
      ORDER BY name ASC
      LIMIT 20
    `;
    res.json({ success: true, data: rows });
  })
);

router.post(
  "/drivers",
  asyncHandler(async (req, res) => {
    const payload = addDriverSchema.parse(req.body);
    const drivers = await sql`
      SELECT id FROM users WHERE id = ${payload.driverId} AND role = 'driver' LIMIT 1
    `;
    if (!drivers.length) throw new HttpError(404, "Driver not found");
    await sql`
      INSERT INTO owner_drivers (owner_id, driver_id)
      VALUES (${req.user.userId}, ${payload.driverId})
      ON CONFLICT (driver_id) DO NOTHING
    `;
    res.status(201).json({ success: true });
  })
);

router.post(
  "/drivers/create",
  asyncHandler(async (req, res) => {
    const payload = createDriverSchema.parse(req.body);
    const existing =
      await sql`SELECT id FROM users WHERE email = ${payload.email.toLowerCase()} LIMIT 1`;
    if (existing.length) throw new HttpError(409, "Email already in use");

    const rawPassword =
      payload.password ||
      Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const rows = await sql`
      INSERT INTO users (name, email, phone, password_hash, role, email_verified_at)
      VALUES (${payload.name}, ${payload.email.toLowerCase()}, ${payload.phone}, ${passwordHash}, 'driver', null)
      RETURNING id, name, email, phone, role, created_at
    `;
    const driver = rows[0];

    await sql`
      INSERT INTO owner_drivers (owner_id, driver_id)
      VALUES (${req.user.userId}, ${driver.id})
      ON CONFLICT (driver_id) DO NOTHING
    `;

    res.status(201).json({
      success: true,
      data: {
        driver,
        tempPassword: payload.password ? null : rawPassword
      }
    });
  })
);

router.delete(
  "/drivers/:driverId",
  asyncHandler(async (req, res) => {
    const { driverId } = req.params;
    await sql`
      DELETE FROM owner_drivers
      WHERE owner_id = ${req.user.userId} AND driver_id = ${driverId}
    `;
    res.json({ success: true });
  })
);

router.post(
  "/variant-requests",
  asyncHandler(async (req, res) => {
    const payload = variantRequestCreateSchema.parse(req.body);

    if (payload.requestId) {
      const requestRows = await sql`
        SELECT id
        FROM requests
        WHERE id = ${payload.requestId}
          AND (owner_id IS NULL OR owner_id = ${req.user.userId})
        LIMIT 1
      `;
      if (!requestRows.length) throw new HttpError(404, "Request not found");
    }

    const rows = await sql`
      INSERT INTO variant_requests (
        owner_id, request_id, suggested_name, capacity_tons, description,
        expected_base_charge, expected_base_hours, expected_overtime_rate
      )
      VALUES (
        ${req.user.userId},
        ${payload.requestId || null},
        ${payload.suggestedName},
        ${payload.capacityTons || null},
        ${payload.description || null},
        ${payload.expectedBaseCharge || null},
        ${payload.expectedBaseHours || null},
        ${payload.expectedOvertimeRate || null}
      )
      RETURNING *
    `;

    const io = req.app.get("io");
    io?.to("role:admin").emit("variant_request:created", rows[0]);

    res.status(201).json({ success: true, data: rows[0] });
  })
);

router.get(
  "/variant-requests",
  asyncHandler(async (req, res) => {
    const rows = await sql`
      SELECT vr.*, r.pickup_address, r.drop_address
      FROM variant_requests vr
      LEFT JOIN requests r ON r.id = vr.request_id
      WHERE vr.owner_id = ${req.user.userId}
      ORDER BY vr.created_at DESC
      LIMIT 200
    `;
    res.json({ success: true, data: rows });
  })
);

router.post(
  "/accept-request",
  asyncHandler(async (req, res) => {
    const payload = acceptRequestSchema.parse(req.body);

    const candidate = await sql`
      SELECT variant_id
      FROM requests
      WHERE id = ${payload.requestId} AND status = 'pending'
      LIMIT 1
    `;
    if (!candidate.length) throw new HttpError(404, "Pending request not found");

    if (candidate[0].variant_id) {
      const compatible = await sql`
        SELECT 1
        FROM fleet
        WHERE owner_id = ${req.user.userId}
          AND status = 'active'
          AND variant_id = ${candidate[0].variant_id}
        LIMIT 1
      `;
      if (!compatible.length) {
        throw new HttpError(
          400,
          "No active crane in your fleet matches this request variant"
        );
      }
    }

    const requestRow = await sql`
      UPDATE requests
      SET owner_id = ${req.user.userId},
          status = 'accepted',
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
    const driverLink = await sql`
      SELECT 1 FROM owner_drivers
      WHERE owner_id = ${req.user.userId} AND driver_id = ${payload.driverId}
      LIMIT 1
    `;
    if (!driverLink.length) throw new HttpError(400, "Driver not linked to this owner");
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
  "/fleet",
  asyncHandler(async (req, res) => {
    const rows = await sql`
      SELECT f.*, v.name AS variant_name
      FROM fleet f
      LEFT JOIN crane_variants v ON v.id = f.variant_id
      WHERE f.owner_id = ${req.user.userId}
      ORDER BY f.created_at DESC
    `;
    res.json({ success: true, data: rows });
  })
);

router.post(
  "/fleet",
  asyncHandler(async (req, res) => {
    const payload = fleetCreateSchema.parse(req.body);

    if (payload.variantId) {
      const variant = await sql`
        SELECT id FROM crane_variants WHERE id = ${payload.variantId} AND is_active = true LIMIT 1
      `;
      if (!variant.length) throw new HttpError(400, "Selected crane variant is invalid");
    }

    const rows = await sql`
      INSERT INTO fleet (owner_id, name, type, variant_id, capacity_tons, registration, status)
      VALUES (
        ${req.user.userId},
        ${payload.name},
        ${payload.type || null},
        ${payload.variantId || null},
        ${payload.capacityTons || null},
        ${payload.registration || null},
        ${payload.status || "active"}
      )
      RETURNING *
    `;
    res.status(201).json({ success: true, data: rows[0] });
  })
);

router.patch(
  "/fleet/:fleetId",
  asyncHandler(async (req, res) => {
    const payload = fleetUpdateSchema.parse(req.body);
    const { fleetId } = req.params;

    if (payload.variantId) {
      const variant = await sql`
        SELECT id FROM crane_variants WHERE id = ${payload.variantId} AND is_active = true LIMIT 1
      `;
      if (!variant.length) throw new HttpError(400, "Selected crane variant is invalid");
    }

    const rows = await sql`
      UPDATE fleet
      SET
        name = COALESCE(${payload.name}, name),
        type = COALESCE(${payload.type || null}, type),
        variant_id = COALESCE(${payload.variantId || null}, variant_id),
        capacity_tons = COALESCE(${payload.capacityTons || null}, capacity_tons),
        registration = COALESCE(${payload.registration || null}, registration),
        status = COALESCE(${payload.status || null}, status),
        updated_at = now()
      WHERE id = ${fleetId} AND owner_id = ${req.user.userId}
      RETURNING *
    `;
    if (!rows.length) throw new HttpError(404, "Fleet item not found");
    res.json({ success: true, data: rows[0] });
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

router.get(
  "/requests/:id/tracking",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
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
      WHERE r.id = ${id} AND r.owner_id = ${req.user.userId}
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

module.exports = router;
