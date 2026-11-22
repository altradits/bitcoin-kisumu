// Public treasury data for /treasury. Update this file for weekly numbers and
// quarterly reports — no page edits needed.
//
// Status policy: anything not yet measured or ratified says so explicitly.
// Never put a guessed number here; placeholders are themselves the audit trail.

export const treasuryBuckets = [
  {
    name: 'Bucket 1 — Education & Operations',
    purpose:
      'Venue, printouts, educator transport, phones and data subsidies. Keeps every class free.',
    allocation: 'To be ratified at Day 0',
    custody: 'Community multi-sig (see policy below)'
  },
  {
    name: 'Bucket 2 — Circular Economy Pilot',
    purpose:
      'Stipends for verified results (shop ambassadors, peer teachers, storytellers), paid only after delivery.',
    allocation: 'To be ratified at Day 0',
    custody: 'Community multi-sig (see policy below)'
  },
  {
    name: 'Bucket 3 — Reserve & Compliance',
    purpose:
      'Buffer for volatility and audit costs. Never spent on day-to-day activity without a published note.',
    allocation: 'To be ratified at Day 0',
    custody: 'Community multi-sig (see policy below)'
  }
];

export const multisigPolicy = [
  '2-of-3 hardware custody for all community funds. No single key can move money.',
  'Zero single-key control: every spend needs two independent signers.',
  'Non-custodial guarantee: we never hold members\u2019, earners\u2019 or students\u2019 money. Stipends go straight to their own wallets.',
  'Signer identities and quorum verification publish at Day 0 (pending founder confirmation).'
];

export const kpis = [
  {
    name: 'Earned Revenue Ratio',
    definition: 'Earned sats \u00F7 total OpEx. Measures independence from donations.',
    baseline: 'Day-0 baseline: 0% (pre-pilot)',
    target: '\u226525% at Day 90 \u00B7 \u226580\u2013100% at Month 12'
  },
  {
    name: 'Net Sats Inflow Ratio',
    definition: 'External sats in \u00F7 sats out. Above 1.0 means Kisumu gains.',
    baseline: 'Day-0 baseline: unmeasured',
    target: '> 1.0 every quarter (the one rule)'
  },
  {
    name: 'Circular Velocity',
    definition: 'Average local hops a sat makes before fiat exit.',
    baseline: 'Day-0 baseline: unmeasured',
    target: 'Target set at Day 30 with first readings'
  },
  {
    name: '30-Day Active Merchant Retention',
    definition: 'Share of onboarded merchants with \u22651 payment in the last 30 days.',
    baseline: 'Day-0 baseline: 0 merchants onboarded',
    target: 'Target set at Day 30 with first readings'
  },
  {
    name: 'Active Local Bitcoin Earners',
    definition: 'People earning livelihood sats through pilot roles and pillars.',
    baseline: 'Day-0 baseline: 0 (roster opens with the pilot)',
    target: 'Set at Day 0 with the pilot roster'
  },
  {
    name: 'Quarterly Audit & Compliance Status',
    definition: 'Published audit + KRA records + VASP boundary review.',
    baseline: 'Day-0: records process defined, first audit due Day 90',
    target: 'Full public audit every 90 days from Day 0'
  }
];

export const reports = [
  {
    quarter: 'Day-0 baseline',
    status: 'Template — numbers land with the pilot',
    contains: [
      'Ratified bucket allocations and opening balances',
      'Signer identities and quorum verification',
      'Pilot roster: earners, merchants, B2B suppliers',
      'First KPI readings and Day-30 targets'
    ]
  }
];
