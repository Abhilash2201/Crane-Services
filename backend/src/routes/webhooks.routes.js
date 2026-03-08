const express = require("express");
const Stripe = require("stripe");
const env = require("../config/env");
const { sql } = require("../db/neon");

const router = express.Router();
const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

router.post("/stripe", async (req, res, next) => {
  try {
    if (!stripe || !env.stripeWebhookSecret) {
      return res.status(503).json({ success: false, message: "Stripe webhook is not configured" });
    }

    const signature = req.headers["stripe-signature"];
    const event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);

    const inserted = await sql`
      INSERT INTO payment_webhook_events (provider, event_id, event_type, payload)
      VALUES ('stripe', ${event.id}, ${event.type}, ${JSON.stringify(event)})
      ON CONFLICT (event_id) DO NOTHING
      RETURNING id
    `;

    if (!inserted.length) {
      return res.json({ success: true, message: "Duplicate webhook ignored" });
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      await sql`
        UPDATE payments
        SET status = 'paid',
            paid_at = now()
        WHERE provider = 'stripe' AND provider_payment_intent_id = ${intent.id}
      `;
    }

    if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object;
      await sql`
        UPDATE payments
        SET status = 'failed'
        WHERE provider = 'stripe' AND provider_payment_intent_id = ${intent.id}
      `;
    }

    await sql`
      UPDATE payment_webhook_events
      SET processed_at = now()
      WHERE event_id = ${event.id}
    `;

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
