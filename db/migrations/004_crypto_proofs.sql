-- 004: cryptographic settlement proofs on payouts.
--
-- payment_hash + payment_preimage let anyone verify SHA256(preimage) equals
-- the hash, mathematically proving a Lightning settlement happened. The
-- server verifies on write and stores proof_verified; a preimage is a spent
-- secret, never a private key.

ALTER TABLE payouts ADD COLUMN IF NOT EXISTS payment_hash TEXT;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS payment_preimage TEXT;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS proof_verified BOOLEAN NOT NULL DEFAULT FALSE;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payouts_hash_hex') THEN
    ALTER TABLE payouts ADD CONSTRAINT payouts_hash_hex
      CHECK (payment_hash IS NULL OR payment_hash ~ '^[0-9a-fA-F]{64}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payouts_preimage_hex') THEN
    ALTER TABLE payouts ADD CONSTRAINT payouts_preimage_hex
      CHECK (payment_preimage IS NULL OR payment_preimage ~ '^[0-9a-fA-F]{64}$');
  END IF;
END $$;
