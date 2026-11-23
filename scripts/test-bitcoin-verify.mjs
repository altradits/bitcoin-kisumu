// Bitcoin verification tests: pure-crypto unit checks (always run) plus
// Postgres integration for payout proofs (needs DATABASE_URL, else skips).
// Covers: preimage SHA256 verification, BOLT11 shape, watch-only descriptor
// syntax with xprv rejection, payout 400-on-mismatch, migration 004,
// verifiedCryptoProofs aggregate, and the proof CSV column.
//
// Usage: npm run test:verify
import { randomBytes, createHash } from 'node:crypto';
import { register } from 'node:module';

register('./test-shim-loader.mjs', import.meta.url);
const v = await import(new URL('../app/lib/bitcoinVerify.js', import.meta.url).href);

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};

// --- Pure unit checks (no DB) ---
check(v.isHex64('ab'.repeat(32)) === true, 'isHex64 accepts 64 hex');
check(v.isHex64('zz'.repeat(32)) === false, 'isHex64 rejects non-hex');
check(v.isHex64('ab'.repeat(31)) === false, 'isHex64 rejects short');
check(v.isHex64(null) === false, 'isHex64 rejects null');

// Hardcoded vector, cross-checked with Python hashlib: SHA256(32 zero bytes).
const ZERO_PREIMAGE = '00'.repeat(32);
const ZERO_HASH = '66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925';
check(v.verifyLightningPreimage(ZERO_PREIMAGE, ZERO_HASH) === true, 'known preimage vector verifies');
check(
  v.verifyLightningPreimage(ZERO_PREIMAGE, ZERO_HASH.slice(0, -1) + (ZERO_HASH.endsWith('5') ? '6' : '5')) === false,
  'flipped hash bit must fail'
);
const livePre = randomBytes(32).toString('hex');
const liveHash = createHash('sha256').update(Buffer.from(livePre, 'hex')).digest('hex');
check(v.verifyLightningPreimage(livePre, liveHash) === true, 'live round-trip verifies');
check(v.verifyLightningPreimage('zz', liveHash) === false, 'malformed preimage fails');

// BOLT11 shape validation (prefix + bech32 charset + length; no signature check).
check(v.isValidBolt11('lnbc10u1' + 'q'.repeat(60)) === true, 'lnbc shape valid');
check(v.isValidBolt11('lntb500n1' + 'p'.repeat(60)) === true, 'lntb shape valid');
check(v.isValidBolt11(('lnbc10u1' + 'q'.repeat(60)).toUpperCase()) === true, 'uppercase valid');
check(v.isValidBolt11('lnbc10u1' + 'b'.repeat(60)) === false, 'b not in bech32 charset');
check(v.isValidBolt11('lnxx10u1' + 'q'.repeat(60)) === false, 'bad prefix rejected');
check(v.isValidBolt11('lnbc1') === false, 'too short rejected');
check(v.isValidBolt11(null) === false, 'null rejected');

// Watch-only descriptors: shape accepted, private keys rejected.
const K1 = 'xpubSYNTHETICKEYONE0000000000000000000000000000000000000000000000000000000000000000000000';
const K2 = 'xpubSYNTHETICKEYTWO0000000000000000000000000000000000000000000000000000000000000000000000';
const GOOD = `wsh(sortedmulti(2,${K1},${K2}))`;
check(v.isValidBip380MultisigDescriptor(GOOD) === true, 'wsh(sortedmulti) accepted');
check(v.isValidBip380MultisigDescriptor(`sh(${GOOD})#abcd1234`) === true, 'nested + checksum accepted');
for (const bad of ['xprv', 'tprv', 'yprv', 'zprv']) {
  check(
    v.isValidBip380MultisigDescriptor(GOOD.replace(/xpub/g, bad)) === false,
    `${bad} must be rejected`
  );
}
check(v.isValidBip380MultisigDescriptor(`wpkh(${K1})`) === false, 'non-multisig rejected');
check(v.isValidBip380MultisigDescriptor('') === false, 'empty rejected');

// --- Postgres integration (real DB or skip) ---
if (!process.env.DATABASE_URL) {
  console.log('SKIP test:verify DB phase: DATABASE_URL unset (no local Postgres).');
} else {
  const { execFileSync } = await import('node:child_process');
  execFileSync(process.execPath, ['scripts/db-migrate.mjs'], { encoding: 'utf8' });
  const lib = await import(new URL('../app/lib/adminAuth.js', import.meta.url).href);
  const payouts = await import(new URL('../app/api/admin/payouts/route.js', import.meta.url).href);
  const exp = await import(new URL('../app/api/admin/export/route.js', import.meta.url).href);
  const { getPilotMetrics } = await import(new URL('../app/lib/pilotMetrics.js', import.meta.url).href);
  const { Pool } = await import('pg');

  process.env.GITHUB_CLIENT_ID = 'test-client';
  process.env.GITHUB_CLIENT_SECRET = 'test-secret';
  process.env.AUTH_SECRET = 'test-auth-secret-that-is-long-enough';
  process.env.ADMIN_GITHUB_LOGINS = 'alice,bob';
  const alice = `bk_admin=${lib.signSession('alice')}`;
  const req = (url, body, cookie) => ({
    url,
    headers: { get: (k) => (String(k).toLowerCase() === 'cookie' ? cookie || null : null) },
    json: async () => body
  });

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const created = { earners: [], results: [], payouts: [] };
  try {
    const migrated = await pool.query("SELECT filename FROM schema_migrations WHERE filename = '004_crypto_proofs.sql'");
    check(migrated.rows.length === 1, '004_crypto_proofs.sql must be applied');
    const cols = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'payouts' AND column_name IN ('payment_hash','payment_preimage','proof_verified')"
    );
    check(cols.rows.length === 3, 'payout proof columns must exist');

    const e = await pool.query("INSERT INTO earners (name, role) VALUES ('TestHarbor Prover', 'peer_teacher') RETURNING id");
    const eid = e.rows[0].id;
    created.earners.push(eid);
    const mkRes = async () => {
      const r = await pool.query(
        "INSERT INTO results (earner_id, result_type, logged_by, status, verified_by) VALUES ($1, 'Shop signed up', 'alice', 'verified', 'bob') RETURNING id",
        [eid]
      );
      created.results.push(r.rows[0].id);
      return r.rows[0].id;
    };
    const rid = await mkRes();

    // Solo hash without preimage → 400.
    let r = await payouts.POST(
      req('http://t/x', { result_id: rid, sats_amount: 5000, kes_equivalent: 750, payment_reference: 'verify-soloref', bucket: 'runway', payment_hash: ZERO_HASH }, alice)
    );
    check(r.status === 400, `solo hash must 400, got ${r.status}`);
    // Mismatched preimage → 400.
    r = await payouts.POST(
      req('http://t/x', { result_id: rid, sats_amount: 5000, kes_equivalent: 750, payment_reference: 'verify-badref', bucket: 'runway', payment_hash: ZERO_HASH, payment_preimage: 'ff'.repeat(32) }, alice)
    );
    check(r.status === 400, `mismatched preimage must 400, got ${r.status}`);
    // Valid pair → 201 with proof_verified.
    r = await payouts.POST(
      req('http://t/x', { result_id: rid, sats_amount: 5000, kes_equivalent: 750, payment_reference: 'verify-test-ref', bucket: 'runway', payment_hash: ZERO_HASH, payment_preimage: ZERO_PREIMAGE }, alice)
    );
    let b = await r.json();
    check(r.status === 201 && b.payout?.proof_verified === true, `valid proof must 201 verified, got ${r.status}`);
    created.payouts.push(b.payout.id);

    // KRA CSV carries the proof column.
    r = await exp.GET(req('http://t/api/admin/export?type=payouts', null, alice));
    const csv = await r.text();
    check(csv.includes('proof_verified'), 'payouts CSV must include proof_verified');
    const row = csv.split('\r\n').find((l) => l.includes('verify-test-ref'));
    check(Boolean(row) && row.endsWith(',true'), `payout row must show proof true: ${row}`);

    // Aggregate counts it, with zero PII.
    const m = await getPilotMetrics();
    check(typeof m.verifiedCryptoProofs === 'number' && m.verifiedCryptoProofs >= 1, 'verifiedCryptoProofs must count it');
    const blob = JSON.stringify(m);
    check(!blob.includes(ZERO_PREIMAGE), 'preimage must never appear in public metrics');
  } finally {
    if (created.payouts.length) {
      await pool.query('DELETE FROM payouts WHERE id = ANY($1)', [created.payouts]).catch(() => {});
    }
    if (created.results.length) {
      await pool.query('DELETE FROM results WHERE id = ANY($1)', [created.results]).catch(() => {});
    }
    if (created.earners.length) {
      await pool.query('DELETE FROM earners WHERE id = ANY($1)', [created.earners]).catch(() => {});
    }
    await pool.end();
  }
}

if (failures.length) {
  console.error(`BITCOIN VERIFY TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('Bitcoin verify test passed: preimage proofs, BOLT11, descriptors, payout proofs, aggregate.');
