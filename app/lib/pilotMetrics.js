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
    weekly: []
  };
}

export async function getPilotMetrics() {
  if (!isDbConfigured()) return baselineMetrics();
  try {
    const pool = getPool();
    const [earners, byRole, byType, weekly] = await Promise.all([
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
      )
    ]);
    const verified = byRole.rows.reduce((s, r) => s + r.n, 0);
    if (verified === 0 && earners.rows[0].n === 0) return baselineMetrics();
    const obj = (rows, k) => Object.fromEntries(rows.map((r) => [r[k], r.n]));
    return {
      source: 'live',
      generatedAt: new Date().toISOString(),
      activeEarners: earners.rows[0].n,
      verifiedResults: verified,
      byRole: obj(byRole.rows, 'role'),
      byType: obj(byType.rows, 'type'),
      weekly: weekly.rows.map((r) => ({ week: r.week, verified: r.n }))
    };
  } catch {
    return baselineMetrics();
  }
}
