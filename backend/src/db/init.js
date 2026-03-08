const { sql } = require("./neon");

async function initDb() {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'customer', 'owner', 'driver')),
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
      pickup_address TEXT NOT NULL,
      drop_address TEXT,
      required_capacity_tons NUMERIC(10,2),
      scheduled_at TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','accepted','in_progress','completed','cancelled')),
      notes TEXT,
      price_quote NUMERIC(12,2),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      request_id UUID UNIQUE NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
      crane_registration TEXT,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'assigned'
        CHECK (status IN ('assigned','en_route','working','completed','cancelled')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tracking_events (
      id BIGSERIAL PRIMARY KEY,
      job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      speed_kmph NUMERIC(6,2),
      heading NUMERIC(6,2),
      captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      request_id UUID UNIQUE NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount NUMERIC(12,2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','paid','failed','refunded')),
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
}

module.exports = { initDb };
