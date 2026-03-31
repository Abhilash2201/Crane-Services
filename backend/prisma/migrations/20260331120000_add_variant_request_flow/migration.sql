ALTER TABLE requests
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES crane_variants(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS variant_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  suggested_name TEXT NOT NULL,
  capacity_tons NUMERIC(10,2),
  description TEXT,
  expected_base_charge NUMERIC(12,2),
  expected_base_hours NUMERIC(10,2),
  expected_overtime_rate NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  admin_comment TEXT,
  approved_variant_id UUID REFERENCES crane_variants(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

