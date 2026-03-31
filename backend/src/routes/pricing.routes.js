const express = require("express");
const { sql } = require("../db/neon");
const { asyncHandler } = require("../utils/asyncHandler");
const { getPricingRule } = require("../services/pricing");

const router = express.Router();

router.get(
  "/pricing",
  asyncHandler(async (req, res) => {
    const variantId = typeof req.query.variantId === "string" ? req.query.variantId : undefined;
    const capacityTonsRaw =
      typeof req.query.capacityTons === "string" ? req.query.capacityTons : undefined;
    const capacityTons = capacityTonsRaw ? Number(capacityTonsRaw) : undefined;
    const rule = await getPricingRule({ variantId, capacityTons });
    res.json({ success: true, data: rule });
  })
);

router.get(
  "/variants",
  asyncHandler(async (req, res) => {
    const activeOnly = req.query.active === "true";
    const rows = activeOnly
      ? await sql`
          SELECT id, name, capacity_tons, description, is_active,
                 base_charge, base_hours, overtime_rate,
                 created_at, updated_at
          FROM crane_variants
          WHERE is_active = true
          ORDER BY capacity_tons ASC NULLS LAST, created_at DESC
          LIMIT 500
        `
      : await sql`
          SELECT id, name, capacity_tons, description, is_active,
                 base_charge, base_hours, overtime_rate,
                 created_at, updated_at
          FROM crane_variants
          ORDER BY capacity_tons ASC NULLS LAST, created_at DESC
          LIMIT 500
        `;

    res.json({ success: true, data: rows });
  })
);

module.exports = router;
