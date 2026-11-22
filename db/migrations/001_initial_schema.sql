-- 001: pilot audit-trail schema (earners, results, audit log).
--
-- Data minimization per Kenya Data Protection Act 2019: no national ID
-- numbers or identity documents are stored anywhere in this schema.

CREATE TABLE IF NOT EXISTS earners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  lightning_address TEXT,
  payroll_tier SMALLINT NOT NULL DEFAULT 1 CHECK (payroll_tier BETWEEN 1 AND 3),
  ward_area TEXT,
  start_date DATE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  consent_date DATE,
  -- Optional, only with recorded consent (see consent_date).
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  earner_id UUID NOT NULL REFERENCES earners(id),
  result_type TEXT NOT NULL,
  result_date DATE NOT NULL DEFAULT CURRENT_DATE,
  evidence TEXT,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'verified', 'rejected')),
  logged_by TEXT NOT NULL,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Two-person segregation of duties: the verifier must differ from the logger.
  CHECK (verified_by IS NULL OR verified_by <> logged_by)
);
CREATE INDEX IF NOT EXISTS results_earner_idx ON results(earner_id);
CREATE INDEX IF NOT EXISTS results_status_idx ON results(status);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Append-only: forbid updates and deletes at the database level.
CREATE OR REPLACE FUNCTION forbid_audit_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS audit_log_no_mutation ON audit_log;
CREATE TRIGGER audit_log_no_mutation
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION forbid_audit_mutation();
