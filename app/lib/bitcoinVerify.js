// Cryptographic verification for settlements and proof-of-reserve.
// Pure Node (node:crypto only, zero npm dependencies) so any Bitcoin
// circular economy can copy this file into their own stack.
//
// What it proves:
// - Lightning: SHA256(preimage) === payment_hash proves the payee revealed
//   the secret, i.e. the off-chain settlement actually happened.
// - Invoices: BOLT11 shape validation before an address is ever shown.
// - Reserves: watch-only BIP-380 descriptors, with private extended keys
//   explicitly rejected so secrets can never be stored or published here.
import { createHash, timingSafeEqual } from 'node:crypto';

const HEX64_RE = /^[0-9a-fA-F]{64}$/;

export function isHex64(s) {
  return typeof s === 'string' && HEX64_RE.test(s);
}

// Mathematically proves a Lightning settlement: the payment hash commits to
// the preimage, so a matching preimage proves the payee claimed the funds.
export function verifyLightningPreimage(preimageHex, paymentHashHex) {
  if (!isHex64(preimageHex) || !isHex64(paymentHashHex)) return false;
  const digest = createHash('sha256').update(Buffer.from(preimageHex, 'hex')).digest();
  const expected = Buffer.from(paymentHashHex, 'hex');
  return digest.length === expected.length && timingSafeEqual(digest, expected);
}

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

export function isValidBolt11(str) {
  if (typeof str !== 'string') return false;
  const s = str.trim().toLowerCase();
  // Mainnet (lnbc), testnet (lntb) and regtest (lnbcrt) prefixes only.
  if (!/^(lnbcrt|lnbc|lntb)/.test(s)) return false;
  if (s.length < 20 || s.length > 7098) return false;
  // Bech32 payload after the human-readable part separator.
  const sep = s.lastIndexOf('1');
  if (sep < 4) return false;
  const payload = s.slice(sep + 1);
  if (payload.length < 6) return false;
  for (const ch of payload) {
    if (!BECH32_CHARSET.includes(ch)) return false;
  }
  return true;
}

const PRIVATE_XKEY_RE = /[xyzt]prv/i;

// Validates a watch-only output descriptor for proof-of-reserve. Accepts
// wsh(sortedmulti(m, ...)) and sh(wsh(sortedmulti(...))) shapes only, and
// REJECTS anything containing a private extended key (xprv/tprv/yprv/zprv)
// so custody can never sneak into a watch-only slot.
export function isValidBip380MultisigDescriptor(str) {
  if (typeof str !== 'string') return false;
  const s = str.trim();
  if (PRIVATE_XKEY_RE.test(s)) return false;
  if (s.length < 20 || s.length > 4000) return false;
  return /^(sh\(wsh\(sortedmulti\(\d+,[^()]+\)\)\)|wsh\(sortedmulti\(\d+,[^()]+\)\))(#.{8})?$/.test(s);
}
