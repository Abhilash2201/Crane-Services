const express = require("express");
const Stripe = require("stripe");
const { z } = require("zod");
const env = require("../config/env");
const { sql } = require("../db/neon");
const { requireAuth, authorize } = require("../middlewares/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const { HttpError } = require("../utils/httpError");

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;
const router = express.Router();

const createIntentSchema = z.object({
  requestId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  currency: z.string().default("inr")
});

router.use(requireAuth, authorize("customer", "admin"));

router.post(
  "/intent",
  asyncHandler(async (req, res) => {
    if (!stripe) throw new HttpError(503, "Stripe is not configured");
    const payload = createIntentSchema.parse(req.body);

    const requestRows = await sql`
      SELECT id, customer_id, owner_id
      FROM requests
      WHERE id = ${payload.requestId}
      LIMIT 1
    `;
    if (!requestRows.length) throw new HttpError(404, "Request not found");
    const requestRow = requestRows[0];

    if (req.user.role === "customer" && requestRow.customer_id !== req.user.userId) {
      throw new HttpError(403, "Not your request");
    }

    const idempotencyKey = `req:${payload.requestId}:cust:${requestRow.customer_id}:amt:${payload.amount}`;
    const existing = await sql`
      SELECT id, provider_payment_intent_id, status
      FROM payments
      WHERE idempotency_key = ${idempotencyKey}
      LIMIT 1
    `;

    let intentId;
    let clientSecret;
    if (existing.length) {
      const intent = await stripe.paymentIntents.retrieve(existing[0].provider_payment_intent_id);
      intentId = intent.id;
      clientSecret = intent.client_secret;
    } else {
      const intent = await stripe.paymentIntents.create(
        {
          amount: Math.round(payload.amount * 100),
          currency: payload.currency.toLowerCase(),
          metadata: {
            requestId: payload.requestId,
            customerId: requestRow.customer_id,
            ownerId: requestRow.owner_id || ""
          }
        },
        { idempotencyKey }
      );
      intentId = intent.id;
      clientSecret = intent.client_secret;

      await sql`
        INSERT INTO payments (
          request_id, customer_id, owner_id, amount, currency, status,
          provider, provider_payment_intent_id, idempotency_key
        )
        VALUES (
          ${payload.requestId},
          ${requestRow.customer_id},
          ${requestRow.owner_id || requestRow.customer_id},
          ${payload.amount},
          ${payload.currency.toUpperCase()},
          'pending',
          'stripe',
          ${intentId},
          ${idempotencyKey}
        )
      `;
    }

    res.json({
      success: true,
      data: {
        paymentIntentId: intentId,
        clientSecret,
        idempotencyKey
      }
    });
  })
);

module.exports = router;
