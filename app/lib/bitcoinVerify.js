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
import { isHex64, isValidBolt11, isValidBip380MultisigDescriptor } from './bitcoinFormat.js';

export { isHex64, isValidBolt11, isValidBip380MultisigDescriptor };

// Mathematically proves a Lightning settlement: the payment hash commits to
// the preimage, so a matching preimage proves the payee claimed the funds.
export function verifyLightningPreimage(preimageHex, paymentHashHex) {
  if (!isHex64(preimageHex) || !isHex64(paymentHashHex)) return false;
  const digest = createHash('sha256').update(Buffer.from(preimageHex, 'hex')).digest();
  const expected = Buffer.from(paymentHashHex, 'hex');
  return digest.length === expected.length && timingSafeEqual(digest, expected);
}
