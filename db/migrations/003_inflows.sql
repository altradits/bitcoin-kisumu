-- 003: revenue + grants inflow ledger (non-custodial records only).
--
-- Inflows record sats/KES received into the community's 3-bucket multi-sig
-- or Blink/M-Pesa operating rails. Like payouts, these are RECORDS — the
-- server holds zero private keys. source_note must never contain personal
-- donor/buyer PII (names, phones, addresses).

CREATE TABLE IF NOT EXISTS inflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inflow_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL
    CHECK (category IN ('grant_donation', 'earned_merch', 'earned_art', 'earned_tour', 'earned_workshop', 'earned_guild', 'earned_lake_ops')),
  -- The One Rule: external sats in vs local recirculation.
  origin TEXT NOT NULL CHECK (origin IN ('external', 'local')),
  bucket TEXT NOT NULL CHECK (bucket IN ('runway', 'pilot_capex', 'reserve')),
  sats_amount BIGINT NOT NULL CHECK (sats_amount >= 0),
  kes_equivalent NUMERIC(12, 2) NOT NULL CHECK (kes_equivalent >= 0),
  CHECK (sats_amount > 0 OR kes_equivalent > 0),
  source_note TEXT NOT NULL,
  payment_reference TEXT,
  recorded_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inflows_date_idx ON inflows(inflow_date);
CREATE INDEX IF NOT EXISTS inflows_category_idx ON inflows(category);
CREATE INDEX IF NOT EXISTS inflows_bucket_idx ON inflows(bucket);
