const express = require("express");
const { asyncHandler } = require("../utils/asyncHandler");
const { getPricingRule } = require("../services/pricing");

const router = express.Router();

router.get(
  "/pricing",
  asyncHandler(async (_req, res) => {
    const rule = await getPricingRule();
    res.json({ success: true, data: rule });
  })
);

module.exports = router;
