# UX Research Protocol: East African Self-Custody & Lightning

An open-source field-study protocol for documenting how Kisumu learners
actually experience self-custody and Lightning — so wallet builders stop
guessing about emerging-market users. Findings publish upstream to the
Bitcoin Design Community and My First Bitcoin, anonymized, zero PII.

## Principles

1. **Beginners first:** participants are first-time wallet users, not Bitcoiners.
2. **Consent + anonymity:** verbal consent on record; no names, photos, phone
   numbers, wallet addresses or transaction IDs in any published material.
   Participant codes only (`P01`, `P02`, …).
3. **Small cohorts, deep notes:** 5–8 participants per round; one facilitator
   + one note-taker; sessions in Kiswahili, Dholuo or English.
4. **Publish everything:** protocol, anonymized transcripts and the raw
   friction log go in this repo; summaries go upstream.

## Study tracks

### T1 — Seed backup comprehension

- Can the participant write down 12 words, verify them, and explain in
  their own words what happens if someone else sees them?
- Metrics: backup completion rate, verification errors, dangerous
  misconceptions quoted verbatim (anonymized).

### T2 — Receive ergonomics: BOLT11 vs. Lightning Address vs. BOLT12

- Time-to-first-receive for each format; error rate (wrong field, expired
  invoice, amount confusion); stated preference with reason.
- Record wallet used (Blink, Phoenix, Machankura USSD) per attempt.

### T3 — Budget-Android & USSD friction

- Device class, Android version, storage/RAM pressure, data cost per
  session in KES; USSD session drops and recovery paths on feature phones.
- Friction log: every stall, crash, confusing screen and workaround.

## Session script (30 min)

1. Consent + anonymized code assignment (3 min).
2. Task: install, back up, receive 100 sats, send 50 back (20 min,
   facilitator observes silently, note-taker timestamps friction).
3. Debrief: what was scary, confusing, or surprisingly easy? (7 min).

## Publishing checklist

- [ ] Friction log + anonymized quotes committed under `content/research/`
- [ ] No PII sweep passed (grep for names, numbers, addresses)
- [ ] Summary posted to Bitcoin Design Community + My First Bitcoin
- [ ] Findings linked from `/resources` for the next cohort
