// Shared pilot constants: single source for earner roles and payroll tiers
// (API validation, forms and CSV exports all read from here).

export const EARNER_ROLES = [
  'shop_ambassador',
  'peer_teacher',
  'storyteller',
  'translator',
  'community_day',
  'lake_enterprise'
];

export const ROLE_LABELS = {
  shop_ambassador: 'Shop ambassador',
  peer_teacher: 'Peer teacher',
  storyteller: 'Storyteller',
  translator: 'Translator',
  community_day: 'Community day',
  lake_enterprise: 'Lake enterprise'
};

export const PAYROLL_TIERS = {
  1: 'Tier 1 — 85/15 starter',
  2: 'Tier 2 — 70/30 steady',
  3: 'Tier 3 — Merchant B2B retention'
};
