// Verified-only pilot aggregates for public pages. Counts only — earner
// names, phones and addresses never leave this module. Falls back to the
// honest Day-0 baseline whenever the database is missing, empty or erroring,
// so public pages never break and never leak PII.
import { isDbConfigured, getPool } from './db';

export function baselineMetrics() {
  return {
    source: 'baseline',
    generatedAt: new Date().toISOString(),
    activeEarners: 0,
    verifiedResults: 0,
    byRole: {},
    byType: {},
    weekly: [],
    shopsLive: 0,
    shopsActive30d: 0,
    shopRetention30d: null,
    totalSatsPaidOut: 0
  };
}

export async function getPilotMetrics() {
  if (!isDbConfigured()) return baselineMetrics();
  try {
    const pool = getPool();
    const [earners, byRole, byType, weekly, shopsLive, shopsActive, satsPaid] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS n FROM earners WHERE active'),
      pool.query(
        `SELECT e.role, COUNT(*)::int AS n FROM results r
         JOIN earners e ON e.id = r.earner_id
         WHERE r.status = 'verified' GROUP BY e.role`
      ),
      pool.query(
        `SELECT r.result_type AS type, COUNT(*)::int AS n FROM results r
         WHERE r.status = 'verified' GROUP BY r.result_type`
      ),
      pool.query(
        `SELECT to_char(date_trunc('week', r.result_date), 'YYYY-MM-DD') AS week,
                COUNT(*)::int AS n
         FROM results r WHERE r.status = 'verified'
         GROUP BY 1 ORDER BY 1`
      ),
      pool.query(`SELECT COUNT(*)::int AS n FROM merchants WHERE status = 'live'`),
      pool.query(
        `SELECT COUNT(*)::int AS n FROM merchants
         WHERE status = 'live' AND last_verified_payment_date >= CURRENT_DATE - 30`
      ),
      pool.query('SELECT COALESCE(SUM(sats_amount), 0)::bigint AS n FROM payouts')
    ]);
    const verified = byRole.rows.reduce((s, r) => s + r.n, 0);
    const live = shopsLive.rows[0].n;
    const active = shopsActive.rows[0].n;
    if (verified === 0 && earners.rows[0].n === 0 && live === 0) return baselineMetrics();
    const obj = (rows, k) => Object.fromEntries(rows.map((r) => [r[k], r.n]));
    return {
      source: 'live',
      generatedAt: new Date().toISOString(),
      activeEarners: earners.rows[0].n,
      verifiedResults: verified,
      byRole: obj(byRole.rows, 'role'),
      byType: obj(byType.rows, 'type'),
      weekly: weekly.rows.map((r) => ({ week: r.week, verified: r.n })),
      shopsLive: live,
      shopsActive30d: active,
      shopRetention30d: live > 0 ? Math.round((active / live) * 100) / 100 : null,
      totalSatsPaidOut: Number(satsPaid.rows[0].n)
    };
  } catch {
    return baselineMetrics();
  }
}
