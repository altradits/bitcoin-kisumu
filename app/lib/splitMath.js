// Pure payroll/discount math for the offline field calculator.
// Integer KES in, integer KES + integer sats out. No network, no prices
// fetched anywhere — the user types their own reference BTC/KES rate.

export function clampKes(v) {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function toSats(kes, rate) {
  if (!(Number.isFinite(rate) && rate > 0)) return null;
  return Math.floor((kes * 100000000) / rate);
}

// Graduated payroll: Tier 1 = 85% KES / 15% sats, Tier 2 = 70/30.
// The sats side takes the remainder so KES + sats parts always sum exactly.
export function payrollSplit(stipendKes, rateKesPerBtc) {
  const stipend = clampKes(stipendKes);
  const rate = Number(rateKesPerBtc);
  const tier = (kesPct) => {
    const kes = Math.floor((stipend * kesPct) / 100);
    const satsKes = stipend - kes;
    return { kes, satsKes, sats: toSats(satsKes, rate) };
  };
  return {
    stipend,
    rate: Number.isFinite(rate) && rate > 0 ? rate : null,
    tier1: tier(85),
    tier2: tier(70)
  };
}

// Merchant counter: flat 10% off for Lightning settlement.
export function merchantDiscount(shelfKes) {
  const price = clampKes(shelfKes);
  const discounted = Math.floor((price * 90) / 100);
  return { price, discounted, savings: price - discounted };
}
