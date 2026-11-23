// Public treasury data for /treasury. Update this file for weekly numbers and
// quarterly reports — no page edits needed.
//
// Status policy: anything not yet measured or ratified says so explicitly.
// Never put a guessed number here; placeholders are themselves the audit trail.

export const treasuryBuckets = [
  {
    name: 'Bucket 1 — Operating Runway & Free Education',
    purpose:
      'Held in KES / USD-pegged Stablesats to guarantee 90 days of classes, venues, educator transport, and predictable starter stipends.',
    allocation: 'Ratified: 35% — KES 525,000 target',
    custody: 'Mobile-money + Stablesats rails under published controls (ratified Day 0)'
  },
  {
    name: 'Bucket 2 — Productive Lake CapEx & Circular Pilot',
    purpose:
      'Earmarked for revenue-generating Lake Victoria assets (solar cold-chain partnership, hyacinth-to-biogas hardware, merch inventory, merchant POS kits) plus verified results-based pilot bounties — so grant capital builds assets that earn after grants end.',
    allocation: 'Ratified: 45% — KES 675,000 target',
    custody: 'Community multi-sig (see policy below)'
  },
  {
    name: 'Bucket 3 — Sovereign BTC Reserve & Compliance',
    purpose:
      'Cold-storage 2-of-3 multi-sig BTC endowment + audit/legal compliance reserve; never spent on routine OpEx without a published note.',
    allocation: 'Ratified: 20% — KES 300,000 target',
    custody: 'Cold-storage 2-of-3 multi-sig (see policy below)'
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

// Ratified Year-One Target Budget: KES 1,500,000 total. Targets, not
// spending — actual received/spent balances stay at Day-0 readings (0).
export const budgetTargets = {
  totalKes: 1500000,
  buckets: [
    {
      name: 'Bucket 1 — Operating Runway & Free Education',
      share: 35,
      totalKes: 525000,
      items: [
        ['Venue hire (12 meetups, 6 workshops, 3 cohorts)', 150000],
        ['Printouts (workbooks, safety sheets, certificates)', 75000],
        ['Educator transport & facilitation (4 educators)', 120000],
        ['Student phones / data subsidies', 80000],
        ['Starter stipends (Tier 1, 85/15)', 100000]
      ]
    },
    {
      name: 'Bucket 2 — Productive Lake CapEx & Circular Pilot',
      share: 45,
      totalKes: 675000,
      items: [
        ['Solar cold-chain / ice partnership (Dunga BMU)', 220000],
        ['Hyacinth-to-biogas starter unit', 150000],
        ['Merch & local art starter inventory', 90000],
        ['Dunga cluster POS kits (10–15 shops)', 65000],
        ['Results-based pilot bounties', 150000]
      ]
    },
    {
      name: 'Bucket 3 — Sovereign BTC Reserve & Compliance',
      share: 20,
      totalKes: 300000,
      items: [
        ['Cold-storage 2-of-3 multi-sig BTC endowment', 180000],
        ['Quarterly public audit & bookkeeping', 50000],
        ['Legal / VASP 2026 review, registration & KRA', 70000]
      ]
    }
  ]
};

export const forecastQuarters = [
  {
    quarter: 'Q1 (Days 0–90)',
    grantsKes: 450000,
    earnedKes: 75000,
    note: 'Swahili/Dholuo bounties + 1st paid workshop + merch/art & visitor spend. Target: ≥25% of OpEx earned.'
  },
  {
    quarter: 'Q2',
    grantsKes: null,
    earnedKes: 160000,
    note: 'Originals + ecosystem merch + local art + tours + workshops + guild.'
  },
  {
    quarter: 'Q3',
    grantsKes: null,
    earnedKes: 260000,
    note: 'Plus cold-chain fee share and biogas sales.'
  },
  {
    quarter: 'Q4 (Month 12)',
    grantsKes: null,
    earnedKes: 350000,
    note: '350,000+. Target: ≥80–100% of quarterly costs without new grants.'
  }
];

export const actualsDayZero = {
  satsReceived: 0,
  satsSpent: 0,
  note: 'Day-0 real readings. Updates here only when money actually moves.'
};
