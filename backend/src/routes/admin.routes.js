const express = require("express");
const { z } = require("zod");
const { sql } = require("../db/neon");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");
const { requireAuth, authorize } = require("../middlewares/auth");
const { getPricingRule } = require("../services/pricing");

const router = express.Router();

const userStatusSchema = z.object({
  isActive: z.boolean()
});

const pricingSchema = z.object({
  baseCharge: z.coerce.number().positive(),
  baseHours: z.coerce.number().int().positive(),
  overtimeRate: z.coerce.number().positive()
});

const variantCreateSchema = z.object({
  name: z.string().min(2),
  capacityTons: z.coerce.number().positive().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  baseCharge: z.coerce.number().positive().optional(),
  baseHours: z.coerce.number().positive().optional(),
  overtimeRate: z.coerce.number().positive().optional()
});

const variantUpdateSchema = variantCreateSchema.partial();

const variantRequestUpdateSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  adminComment: z.string().max(500).optional(),
  approvedVariant: z
    .object({
      name: z.string().min(2),
      capacityTons: z.coerce.number().positive().optional(),
      description: z.string().max(500).optional(),
      isActive: z.boolean().optional(),
      baseCharge: z.coerce.number().positive().optional(),
      baseHours: z.coerce.number().positive().optional(),
      overtimeRate: z.coerce.number().positive().optional()
    })
    .optional()
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
  "/pricing",
  asyncHandler(async (_req, res) => {
    const rule = await getPricingRule();
    res.json({ success: true, data: rule });
  })
);

router.put(
  "/pricing",
  asyncHandler(async (req, res) => {
    const payload = pricingSchema.parse(req.body);
    const rows = await sql`
      INSERT INTO pricing_rules (base_charge, base_hours, overtime_rate)
      VALUES (${payload.baseCharge}, ${payload.baseHours}, ${payload.overtimeRate})
      RETURNING id, base_charge, base_hours, overtime_rate, created_at, updated_at
    `;
    res.json({ success: true, data: rows[0] });
  })
);

router.get(
  "/variants",
  asyncHandler(async (_req, res) => {
    const rows = await sql`
      SELECT id, name, capacity_tons, description, is_active,
             base_charge, base_hours, overtime_rate,
             created_at, updated_at
      FROM crane_variants
      ORDER BY created_at DESC
      LIMIT 500
    `;
    res.json({ success: true, data: rows });
  })
);

router.post(
  "/variants",
  asyncHandler(async (req, res) => {
    const payload = variantCreateSchema.parse(req.body);
    const rows = await sql`
      INSERT INTO crane_variants (name, capacity_tons, description, is_active, base_charge, base_hours, overtime_rate)
      VALUES (
        ${payload.name},
        ${payload.capacityTons || null},
        ${payload.description || null},
        ${payload.isActive ?? true},
        ${payload.baseCharge || null},
        ${payload.baseHours || null},
        ${payload.overtimeRate || null}
      )
      RETURNING id, name, capacity_tons, description, is_active,
                base_charge, base_hours, overtime_rate,
                created_at, updated_at
    `;
    res.status(201).json({ success: true, data: rows[0] });
  })
);

router.patch(
  "/variants/:variantId",
  asyncHandler(async (req, res) => {
    const payload = variantUpdateSchema.parse(req.body);
    const { variantId } = req.params;
    const rows = await sql`
      UPDATE crane_variants
      SET
        name = COALESCE(${payload.name || null}, name),
        capacity_tons = COALESCE(${payload.capacityTons || null}, capacity_tons),
        description = COALESCE(${payload.description || null}, description),
        is_active = COALESCE(${payload.isActive ?? null}, is_active),
        base_charge = COALESCE(${payload.baseCharge || null}, base_charge),
        base_hours = COALESCE(${payload.baseHours || null}, base_hours),
        overtime_rate = COALESCE(${payload.overtimeRate || null}, overtime_rate),
        updated_at = now()
      WHERE id = ${variantId}
      RETURNING id, name, capacity_tons, description, is_active,
                base_charge, base_hours, overtime_rate,
                created_at, updated_at
    `;
    if (!rows.length) throw new HttpError(404, "Variant not found");
    res.json({ success: true, data: rows[0] });
  })
);

router.delete(
  "/variants/:variantId",
  asyncHandler(async (req, res) => {
    const { variantId } = req.params;
    const rows = await sql`
      DELETE FROM crane_variants
      WHERE id = ${variantId}
      RETURNING id
    `;
    if (!rows.length) throw new HttpError(404, "Variant not found");
    res.json({ success: true });
  })
);

router.get(
  "/variant-requests",
  asyncHandler(async (_req, res) => {
    const rows = await sql`
      SELECT vr.*, o.name AS owner_name, o.email AS owner_email,
             r.pickup_address, r.drop_address
      FROM variant_requests vr
      JOIN users o ON o.id = vr.owner_id
      LEFT JOIN requests r ON r.id = vr.request_id
      ORDER BY
        CASE WHEN vr.status = 'pending' THEN 0 ELSE 1 END,
        vr.created_at DESC
      LIMIT 500
    `;
    res.json({ success: true, data: rows });
  })
);

router.patch(
  "/variant-requests/:variantRequestId",
  asyncHandler(async (req, res) => {
    const payload = variantRequestUpdateSchema.parse(req.body);
    const { variantRequestId } = req.params;

    const existing = await sql`
      SELECT *
      FROM variant_requests
      WHERE id = ${variantRequestId}
      LIMIT 1
    `;
    if (!existing.length) throw new HttpError(404, "Variant request not found");

    const current = existing[0];
    if (current.status !== "pending") {
      throw new HttpError(400, "Variant request already processed");
    }

    let createdVariantId = null;
    if (payload.status === "approved") {
      const source = payload.approvedVariant || {
        name: current.suggested_name,
        capacityTons: current.capacity_tons ? Number(current.capacity_tons) : undefined,
        description: current.description || undefined,
        baseCharge: current.expected_base_charge
          ? Number(current.expected_base_charge)
          : undefined,
        baseHours: current.expected_base_hours ? Number(current.expected_base_hours) : undefined,
        overtimeRate: current.expected_overtime_rate
          ? Number(current.expected_overtime_rate)
          : undefined
      };

      const created = await sql`
        INSERT INTO crane_variants (name, capacity_tons, description, is_active, base_charge, base_hours, overtime_rate)
        VALUES (
          ${source.name},
          ${source.capacityTons || null},
          ${source.description || null},
          ${source.isActive ?? true},
          ${source.baseCharge || null},
          ${source.baseHours || null},
          ${source.overtimeRate || null}
        )
        ON CONFLICT (name) DO UPDATE
        SET
          capacity_tons = COALESCE(EXCLUDED.capacity_tons, crane_variants.capacity_tons),
          description = COALESCE(EXCLUDED.description, crane_variants.description),
          is_active = COALESCE(EXCLUDED.is_active, crane_variants.is_active),
          base_charge = COALESCE(EXCLUDED.base_charge, crane_variants.base_charge),
          base_hours = COALESCE(EXCLUDED.base_hours, crane_variants.base_hours),
          overtime_rate = COALESCE(EXCLUDED.overtime_rate, crane_variants.overtime_rate),
          updated_at = now()
        RETURNING id
      `;

      createdVariantId = created[0].id;

      if (current.request_id) {
        await sql`
          UPDATE requests
          SET variant_id = ${createdVariantId}, updated_at = now()
          WHERE id = ${current.request_id}
        `;
      }
    }

    const rows = await sql`
      UPDATE variant_requests
      SET
        status = ${payload.status},
        admin_comment = ${payload.adminComment || null},
        approved_variant_id = ${createdVariantId || null},
        reviewed_at = now()
      WHERE id = ${variantRequestId}
      RETURNING *
    `;

    const io = req.app.get("io");
    io?.to(`user:${current.owner_id}`).emit("variant_request:updated", rows[0]);

    res.json({ success: true, data: rows[0] });
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

router.get(
  "/analytics",
  asyncHandler(async (_req, res) => {
    const last7Days = await sql`
      SELECT
        to_char(date_trunc('day', r.created_at), 'YYYY-MM-DD') AS day,
        COUNT(*)::INT AS requests
      FROM requests r
      WHERE r.created_at >= now() - interval '7 days'
      GROUP BY day
      ORDER BY day ASC
    `;

    const revenue7Days = await sql`
      SELECT
        to_char(date_trunc('day', p.created_at), 'YYYY-MM-DD') AS day,
        COALESCE(SUM(p.amount), 0)::NUMERIC(12,2) AS revenue
      FROM payments p
      WHERE p.status = 'paid'
        AND p.created_at >= now() - interval '7 days'
      GROUP BY day
      ORDER BY day ASC
    `;

    const statusBreakdown = await sql`
      SELECT status, COUNT(*)::INT AS count
      FROM requests
      GROUP BY status
      ORDER BY count DESC
    `;

    const topOwners = await sql`
      SELECT o.id, o.name, COUNT(*)::INT AS total_jobs
      FROM jobs j
      JOIN users o ON o.id = j.owner_id
      GROUP BY o.id, o.name
      ORDER BY total_jobs DESC
      LIMIT 5
    `;

    res.json({
      success: true,
      data: {
        requestsLast7Days: last7Days,
        revenueLast7Days: revenue7Days,
        requestsByStatus: statusBreakdown,
        topOwners
      }
    });
  })
);

module.exports = router;
