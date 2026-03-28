const { sql } = require("../db/neon");

async function getDefaultPricingRule() {
  const rows = await sql`
    SELECT id, base_charge, base_hours, overtime_rate, created_at, updated_at
    FROM pricing_rules
    ORDER BY created_at DESC
    LIMIT 1
  `;
  if (rows.length) return rows[0];

  const created = await sql`
    INSERT INTO pricing_rules (base_charge, base_hours, overtime_rate)
    VALUES (3000, 3, 1000)
    RETURNING id, base_charge, base_hours, overtime_rate, created_at, updated_at
  `;
  return created[0];
}

async function getPricingRule({ variantId, capacityTons } = {}) {
  if (variantId) {
    const rows = await sql`
      SELECT id, base_charge, base_hours, overtime_rate
      FROM crane_variants
      WHERE id = ${variantId} AND is_active = true
      LIMIT 1
    `;
    if (rows.length) {
      const fallback = await getDefaultPricingRule();
      return {
        ...fallback,
        base_charge: rows[0].base_charge ?? fallback.base_charge,
        base_hours: rows[0].base_hours ?? fallback.base_hours,
        overtime_rate: rows[0].overtime_rate ?? fallback.overtime_rate,
      };
    }
  }

  if (capacityTons) {
    const rows = await sql`
      SELECT id, base_charge, base_hours, overtime_rate, capacity_tons
      FROM crane_variants
      WHERE is_active = true
        AND capacity_tons IS NOT NULL
        AND capacity_tons >= ${capacityTons}
      ORDER BY capacity_tons ASC
      LIMIT 1
    `;
    if (rows.length) {
      const fallback = await getDefaultPricingRule();
      return {
        ...fallback,
        base_charge: rows[0].base_charge ?? fallback.base_charge,
        base_hours: rows[0].base_hours ?? fallback.base_hours,
        overtime_rate: rows[0].overtime_rate ?? fallback.overtime_rate,
      };
    }
  }

  return getDefaultPricingRule();
}

function calculatePrice(durationHours, rule) {
  const baseHours = Number(rule.base_hours) || 3;
  const baseCharge = Number(rule.base_charge) || 3000;
  const overtimeRate = Number(rule.overtime_rate) || 1000;
  const hours =
    durationHours && Number(durationHours) > 0
      ? Math.ceil(Number(durationHours))
      : baseHours;
  const billableHours = Math.max(baseHours, hours);
  const overtimeHours = Math.max(0, billableHours - baseHours);
  return baseCharge + overtimeHours * overtimeRate;
}

module.exports = { getPricingRule, calculatePrice };
