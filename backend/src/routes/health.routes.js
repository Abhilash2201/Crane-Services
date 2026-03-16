const express = require("express");
const { sql } = require("../db/neon");
const { asyncHandler } = require("../utils/asyncHandler");
const { verifySmtp } = require("../services/mailer");
const { HttpError } = require("../utils/httpError");

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

router.get(
  "/health/mail",
  asyncHandler(async (_req, res) => {
    try {
      const result = await verifySmtp();
      if (result.disabled) {
        return res.status(503).json({ success: false, message: "SMTP not configured" });
      }
      return res.json({ success: true, message: "SMTP is healthy" });
    } catch (err) {
      throw new HttpError(502, "SMTP verification failed");
    }
  })
);

module.exports = router;
