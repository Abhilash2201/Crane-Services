const { sql } = require("../db/neon");

async function getPricingRule() {
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
