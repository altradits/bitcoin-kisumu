-- 002: merchant cluster registry + non-custodial payout ledger.
--
-- Payouts record money a human signer moved from their OWN wallet. This
-- database never holds private keys, seeds or custodial balances:
-- payment_reference is a Lightning payment hash/preimage or receipt ID.

CREATE TABLE IF NOT EXISTS merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  area TEXT,
  accepts TEXT[] NOT NULL DEFAULT '{}',
  b2b_supplier_of TEXT,
  btcmap_url TEXT,
  status TEXT NOT NULL DEFAULT 'onboarding'
    CHECK (status IN ('onboarding', 'live', 'inactive')),
  last_verified_payment_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS merchants_status_idx ON merchants(status);

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- UNIQUE: a verified result can never be paid twice.
  result_id UUID NOT NULL UNIQUE REFERENCES results(id),
  earner_id UUID NOT NULL REFERENCES earners(id),
  sats_amount BIGINT NOT NULL CHECK (sats_amount > 0),
  kes_equivalent NUMERIC(12, 2) NOT NULL CHECK (kes_equivalent >= 0),
  payroll_tier_snapshot SMALLINT NOT NULL CHECK (payroll_tier_snapshot BETWEEN 1 AND 3),
  lightning_address_snapshot TEXT,
  payment_reference TEXT NOT NULL,
  paid_by TEXT NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  bucket TEXT NOT NULL CHECK (bucket IN ('runway', 'pilot_capex'))
);
CREATE INDEX IF NOT EXISTS payouts_earner_idx ON payouts(earner_id);
CREATE INDEX IF NOT EXISTS payouts_paid_at_idx ON payouts(paid_at);

-- Only verified results can be paid, enforced at the database level
-- (the API returns a friendly 409 before this trigger ever fires).
CREATE OR REPLACE FUNCTION require_verified_result() RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM results WHERE id = NEW.result_id AND status = 'verified') THEN
    RAISE EXCEPTION 'payouts require a verified result';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payouts_require_verified ON payouts;
CREATE TRIGGER payouts_require_verified
  BEFORE INSERT ON payouts
  FOR EACH ROW EXECUTE FUNCTION require_verified_result();
