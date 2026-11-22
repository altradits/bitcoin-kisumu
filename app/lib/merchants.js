// Merchant directory data for /merchants. Add entries as shops go live —
// no page edits needed.
//
// Entry schema:
//   { name, category, area, accepts: ['Lightning'] and/or ['On-Chain'],
//     note, status: 'live' | 'onboarding' }
// Only list real, verified merchants. Aspirational entries stay out.

export const merchantCategories = [
  'Fish & Cold Chain',
  'Eateries & Lakeside Food',
  'Boda & Transport',
  'Tours & Stays',
  'Shops & Markets',
  'B2B Suppliers'
];

export const merchants = [];

export const joinSteps = [
  'Talk to us — a shop ambassador visits, free, with zero sales pitch.',
  'Set up a Lightning POS on your own phone. You hold your own keys; we never touch your money.',
  'Price in shillings, receive in sats, cash out to M-Pesa whenever you want.',
  'Get matched with B2B suppliers in the directory so sats recirculate locally.',
  'Go live on this directory and on BTCMap once your first real customer payment clears.'
];

export const btcmapUrl = 'https://btcmap.org/';
