// Split-calculator math tests: exact integer KES/sat arithmetic and clean
// clamping of negative, zero and garbage inputs. Pure unit test, no DB.
//
// Usage: npm run test:math
const { clampKes, payrollSplit, merchantDiscount } = await import(
  new URL('../app/lib/splitMath.js', import.meta.url).href
);

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};

check(clampKes(4000) === 4000, 'clamp keeps positives');
check(clampKes(99.9) === 99, 'clamp floors floats');
check(clampKes(0) === 0 && clampKes(-5) === 0, 'clamp zeroes non-positive');
check(clampKes('abc') === 0 && clampKes('2500') === 2500, 'clamp handles strings');

const pay = payrollSplit(4000, 15000000);
check(pay.tier1.kes === 3400 && pay.tier1.satsKes === 600, 'tier1 KES split exact');
check(pay.tier1.sats === 4000, `tier1 sats exact, got ${pay.tier1.sats}`);
check(pay.tier2.kes === 2800 && pay.tier2.sats === 8000, 'tier2 split exact');
check(pay.tier1.kes + pay.tier1.satsKes === 4000, 'tier1 parts sum exactly');
check(pay.tier2.kes + pay.tier2.satsKes === 4000, 'tier2 parts sum exactly');

const noRate = payrollSplit(4000, '');
check(noRate.rate === null && noRate.tier1.sats === null, 'missing rate yields null sats, KES intact');
check(noRate.tier1.kes === 3400, 'KES math needs no rate');
const zero = payrollSplit(0, 15000000);
check(zero.tier1.kes === 0 && zero.tier1.sats === 0, 'zero stipend zeroes out');
const badRate = payrollSplit(4000, -3);
check(badRate.rate === null, 'negative rate rejected');

const deal = merchantDiscount(2500);
check(deal.discounted === 2250 && deal.savings === 250, '10% discount exact');
check(merchantDiscount(99).discounted === 89, 'discount floors cleanly');
const free = merchantDiscount(-10);
check(free.price === 0 && free.discounted === 0 && free.savings === 0, 'negative price zeroes out');

if (failures.length) {
  console.error(`MATH TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('Math test passed: exact splits, discounts, clamping.');
