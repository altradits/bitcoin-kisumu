# Architecture

Bitcoin Kisumu is a MIT-licensed Next.js 16 community site: free Bitcoin
education, a merchant directory, a public treasury, and an admin backend for
running a circular-economy pilot. This doc is for developers forking or
auditing it.

## Non-custodial design

The server never holds private keys, seeds, or custodial balances:

- Stipends and payouts go straight to earners' own wallets. A payout row
  records that a human signer moved money from their own wallet — the
  database stores the Lightning hash/preimage or receipt ID, never keys.
- Treasury reserves are committed to a **watch-only** BIP-380 descriptor
  (`wsh(sortedmulti(2, …))`). `isValidBip380MultisigDescriptor()` in
  `app/lib/bitcoinVerify.js` explicitly rejects `xprv`/`tprv`/`yprv`/`zprv`,
  so custody can never sneak into a watch-only slot.
- Proof-of-reserve publishes descriptors + addresses only, verifiable on
  mempool.space or any Bitcoin Core node. See `/treasury`.

This keeps the project on the non-custodial side of Kenya's VASP Act 2025 +
VASP Regulations 2026 boundary: education, self-custody and stipends to
people's own wallets. Commercial payments activity would spin out into its
own licensed entity (see `/guide`).

## Data layers

| Layer | Holds | Backend |
|---|---|---|
| Public pages | Copy, links, team | Static, no PII |
| Forms (contact, newsletter, RSVP, inquiries) | Sign-ups | Upstash Redis lists, or `data/*.json` locally |
| Pilot records (earners, results, merchants, payouts, inflows) | Operations | Postgres (Neon), `db/migrations/*.sql` |
| Public metrics | Counts only | `app/lib/pilotMetrics.js` (aggregates, zero PII), served at `/api/metrics` |
| Browser verifier | User-supplied proofs only | `/verify` (client-side SHA-256/BOLT11/descriptor checks, works offline) |

Redis writes are atomic (`RPUSH`/`LRANGE`, Lua for RSVP capacity). The file
fallback uses serialized locks + atomic renames. On Vercel without Redis,
writes fail loud (`503`) instead of silently losing rows.

## DB-level segregation of duties (EY-style)

- `results.verified_by` must differ from `logged_by`: enforced by a
  PostgreSQL `CHECK` constraint **and** a `403` at the API layer, with the
  UI hiding the action from the logger.
- `payouts.result_id` is `UNIQUE`: a verified result can never be paid
  twice, even under racing requests (API pre-check + constraint).
- `payouts` rows require `status = 'verified'` via trigger + API check.
- `audit_log` is append-only: a trigger rejects every `UPDATE`/`DELETE`.

## Cryptographic verification

`app/lib/bitcoinVerify.js` (pure Node, zero deps):

- `verifyLightningPreimage()` — `SHA256(preimage) === payment_hash` with
  constant-time comparison. Payouts carrying a valid pair are marked
  `proof_verified`; mismatches are rejected with `400`.
- `isValidBolt11()` — `lnbc`/`lntb`/`lnbcrt` prefix + bech32 shape checks.
- `isValidBip380MultisigDescriptor()` — watch-only syntax, xprv rejected.

## Privacy boundaries

- Public pages and metrics expose aggregates only. Tests assert no earner
  names, phones, addresses or contacts appear in any public payload.
- Kenya Data Protection Act 2019: no national IDs anywhere; phone numbers
  only with a recorded `consent_date` (enforced by API validation).
- No PII in logs: routes never `console.log` request bodies; honeypot fills
  are dropped silently.
- Admin surfaces (`/admin`, `/api/admin/*`) require GitHub OAuth + username
  allowlist, verified server-side, failing closed (401/403) when unconfigured.
