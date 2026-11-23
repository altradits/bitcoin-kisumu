// Bitcoin Kisumu Originals — "The Catch" Lake Victoria Collection.
// Made to order by local Kisumu artisans. Launch prices below are founder
// approved; future items use priceKes: null until priced. Never fabricate
// stock counts or prices.

export const MADE_TO_ORDER = 'Made to order in Kisumu — paid in sats or KES';

export const originals = [
  {
    name: 'The Catch Tee',
    detail: 'Heavyweight tee with the full Catch lockup, printed in Kisumu.',
    art: '/merch/catch-k-lockup.svg',
    artAlt: 'The Catch lockup: fisherman, rod and bitcoin over BITCOIN KISUMU',
    priceKes: 2500
  },
  {
    name: 'The Catch Cap',
    detail: 'Lakeside cap with the one-colour Catch mark, stitched locally.',
    art: '/merch/catch-k-white.svg',
    artAlt: 'The Catch mark in white, as stitched on caps',
    dark: true,
    priceKes: 1800
  },
  {
    name: 'Woven Lakeside Tote',
    detail: 'Market tote with the Catch mark, woven by lakeside artisans.',
    art: '/merch/catch-k-color.svg',
    artAlt: 'The Catch mark in green and clay',
    priceKes: 1500
  }
];

export function priceLine(item) {
  if (typeof item.priceKes === 'number') {
    return `KES ${item.priceKes.toLocaleString('en-US')} — 10% off when settled in Lightning sats`;
  }
  return 'Target price announced at drop — pre-order to reserve yours.';
}
