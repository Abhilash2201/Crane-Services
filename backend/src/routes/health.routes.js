const express = require("express");
const { sql } = require("../db/neon");
const { asyncHandler } = require("../utils/asyncHandler");

const router = express.Router();

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const ping = await sql`SELECT now() AS db_time`;
    res.json({
      success: true,
      message: "API is healthy",
      data: { dbTime: ping[0].db_time }
    });
  })
);

module.exports = router;
