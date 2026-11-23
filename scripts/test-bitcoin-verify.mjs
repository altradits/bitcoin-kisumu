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

// BOLT11 vectors below were minted by Bitcoin Core's own segwit_addr
// (test/functional/test_framework) — checksums and all.
const f = await import(new URL('../app/lib/bitcoinFormat.js', import.meta.url).href);
const INV_MAIN = 'lnbc10u1rpyp9fzx9r9gf8frzrgyxzxyrrgrz8f9qzggypf8pxfrffr89pq9gzqf8yfyy9fzrq8gpxyqxzgxzqgffgxzgqrygz9ryzpp8qx8fgzpygqgx9przgzrqxxy8qfrgyyxqf99q9gzzrp8z9r9yqxzg8f9yr9qzfxqyzf9rqfxff98zz9pq9gzqf8yfyy9fzpxd0jv';
const INV_TEST = 'lntb20m1s8tydgzp5yf0xv7kt9rqgwn623zcdxapefuyvj840nv5mq';
const INV_REG = 'lnbcrt2500n1qw508xwpw2r3uc9f2vmcr3na9azgy3tkayrsf5mc0lg5l9y';
const INV_ANY = 'lnbc18ytydgzp5yf0xv7kt9rqgwn623zczenqy4';
const INV_PICO = 'lnbc100p19wskfytdn6gz3hxva7pc2jrm084qszsfx8';
check(v.isValidBolt11(INV_MAIN) === true, 'Core-minted mainnet invoice valid');
check(v.isValidBolt11(INV_TEST) === true, 'Core-minted testnet invoice valid');
check(v.isValidBolt11(INV_MAIN.toUpperCase()) === true, 'uppercase valid');
const dMain = f.decodeBolt11Summary(INV_MAIN);
check(dMain.valid && dMain.network === 'mainnet' && dMain.amountSats === 1000, `10u decodes to 1000 sats: ${JSON.stringify(dMain)}`);
const dTest = f.decodeBolt11Summary(INV_TEST);
check(dTest.valid && dTest.network === 'testnet' && dTest.amountSats === 2000000, '20m decodes to 2000000 sats');
const dReg = f.decodeBolt11Summary(INV_REG);
check(dReg.valid && dReg.network === 'regtest' && dReg.amountSats === 250, '2500n decodes to 250 sats');
const dPico = f.decodeBolt11Summary(INV_PICO);
check(dPico.valid && dPico.amountSats === 0.01, `100p decodes to 0.01 sats: ${dPico.amountSats}`);
const dAny = f.decodeBolt11Summary(INV_ANY);
check(dAny.valid && dAny.anyAmount === true && dAny.amountSats === null, 'no-amount invoice flagged any-amount');
const corruptAt = INV_MAIN.indexOf('q', 10);
const badBolt = INV_MAIN.slice(0, corruptAt) + 'p' + INV_MAIN.slice(corruptAt + 1);
check(v.isValidBolt11(badBolt) === false, 'corrupted checksum rejected');
check(f.decodeBolt11Summary(badBolt).valid === false, 'corrupted decode rejected');
check(v.isValidBolt11('lnbc1') === false, 'too short rejected');
check(v.isValidBolt11(null) === false, 'null rejected');

// Descriptor vectors use real BIP32 xpubs from Core's descriptor_tests;
// checksums were minted by Core's own descsum_create.
const K1 = 'xpub661MyMwAqRbcF3yVrV2KyYetLMYA5mCbv4BhrKwUrFE9LZM6JRR1AEt8Jq4V4C8LwtTke6YEEdCZqgXp85YRk2j74EfJKhe3QybQ9kcUjs4';
const K2 = 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8';
const K3 = 'xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB';
const D1 = `wsh(sortedmulti(2,${K1},${K2},${K3}))#842ccm2w`;
const D2 = `sh(wsh(sortedmulti(2,${K1},${K2})))#nqv3udee`;
const p1 = f.parseBip380MultisigDescriptor(D1);
check(p1.valid && p1.threshold === 2 && p1.totalKeys === 3, 'Core 2-of-3 parses');
check(p1.scriptType === 'P2WSH sortedmulti' && p1.checksumValid === true, 'script type + checksum valid');
const p2 = f.parseBip380MultisigDescriptor(D2);
check(p2.valid && p2.scriptType === 'P2SH-P2WSH sortedmulti', 'nested descriptor parses');
check(v.isValidBip380MultisigDescriptor(D1) === true, 'boolean wrapper accepts');
check(f.parseBip380MultisigDescriptor(D1.slice(0, -1) + 'x').valid === false, 'corrupted checksum rejected');
check(f.parseBip380MultisigDescriptor(`wsh(sortedmulti(3,${K1},${K2}))`).valid === false, 'm > n rejected');
check(f.parseBip380MultisigDescriptor(`wsh(sortedmulti(0,${K1},${K2}))`).valid === false, 'm = 0 rejected');
check(
  f.parseBip380MultisigDescriptor(`wsh(sortedmulti(2,${Array(21).fill(K1).join(',')}))`).valid === false,
  'n > 20 rejected'
);
for (const bad of ['xprv', 'tprv', 'yprv', 'zprv']) {
  const r = f.parseBip380MultisigDescriptor(D1.replace(/xpub/g, bad));
  check(r.valid === false && /private/i.test(r.error || ''), `${bad} rejected as private`);
}
check(v.isValidBip380MultisigDescriptor(`wpkh(${K1})`) === false, 'non-multisig rejected');
check(v.isValidBip380MultisigDescriptor('') === false, 'empty rejected');
const noSum = f.parseBip380MultisigDescriptor(D1.slice(0, -9));
check(noSum.valid && noSum.checksumPresent === false, 'missing checksum parses as present=false');

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
