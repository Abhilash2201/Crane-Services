const express = require("express");
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

module.exports = router;
