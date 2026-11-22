import { NextResponse } from 'next/server';
import { requireAdmin, requireDb } from '@/app/lib/adminApi';
import { getPool } from '@/app/lib/db';
import { EARNER_ROLES } from '@/app/lib/pilot';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Formula-injection safe: a leading = + - @ (or tab/CR) would execute as a
// formula in Excel/Sheets, so prefix it with a single quote, then quote
// cells containing delimiters. BOM prefix keeps Excel UTF-8 safe.
export function csvCell(v) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(headers, rows) {
  const lines = [headers.map(csvCell).join(',')];
  for (const r of rows) lines.push(r.map(csvCell).join(','));
  return '\uFEFF' + lines.join('\r\n') + '\r\n'; // BOM keeps Excel UTF-8 safe
}

function isDate(s) {
  return DATE_RE.test(s) && !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());
}

// pg returns DATE as local-midnight; toISOString() would shift the calendar
// day on UTC+ servers, so format local components. Timestamps stay ISO.
const pad2 = (n) => String(n).padStart(2, '0');
const fmtDate = (v) =>
  v instanceof Date ? `${v.getFullYear()}-${pad2(v.getMonth() + 1)}-${pad2(v.getDate())}` : v || '';
const fmtTs = (v) => (v instanceof Date ? v.toISOString() : v || '');

export async function GET(req) {
  const gate = requireAdmin(req);
  if (gate.error) return gate.error;
  const noDb = requireDb();
  if (noDb) return noDb;

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const role = searchParams.get('role') || '';
  if (type !== 'results' && type !== 'weekly') {
    return NextResponse.json({ error: 'type must be results or weekly.' }, { status: 400 });
  }
  if ((from && !isDate(from)) || (to && !isDate(to))) {
    return NextResponse.json({ error: 'from/to must be YYYY-MM-DD.' }, { status: 400 });
  }
  if (role && !EARNER_ROLES.includes(role)) {
    return NextResponse.json({ error: `role must be one of: ${EARNER_ROLES.join(', ')}.` }, { status: 400 });
  }

  const pool = getPool();
  const conds = ["r.status = 'verified'"];
  const params = [];
  if (from) {
    params.push(from);
    conds.push(`r.result_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conds.push(`r.result_date <= $${params.length}`);
  }
  if (role) {
    params.push(role);
    conds.push(`e.role = $${params.length}`);
  }
  const where = `WHERE ${conds.join(' AND ')}`;

  let headers;
  let rows;
  if (type === 'results') {
    headers = [
      'date', 'earner_name', 'role', 'payroll_tier', 'lightning_address',
      'result_type', 'evidence', 'logged_by', 'verified_by', 'verified_at'
    ];
    const res = await pool.query(
      `SELECT r.result_date, e.name AS earner_name, e.role, e.payroll_tier,
              e.lightning_address, r.result_type, r.evidence, r.logged_by,
              r.verified_by, r.verified_at
       FROM results r JOIN earners e ON e.id = r.earner_id
       ${where}
       ORDER BY r.result_date ASC, r.created_at ASC`,
      params
    );
    rows = res.rows.map((x) => [
      fmtDate(x.result_date), x.earner_name, x.role, x.payroll_tier, x.lightning_address,
      x.result_type, x.evidence, x.logged_by, x.verified_by, fmtTs(x.verified_at)
    ]);
  } else {
    // Weekly aggregates. Onboarded-shops counts are deliberately absent: no
    // merchant store exists yet, so there is nothing honest to aggregate.
    headers = ['week', 'role', 'verified_results', 'active_earners'];
    const res = await pool.query(
      `SELECT to_char(date_trunc('week', r.result_date), 'YYYY-MM-DD') AS week,
              e.role, COUNT(*)::int AS verified_results,
              COUNT(DISTINCT r.earner_id)::int AS active_earners
       FROM results r JOIN earners e ON e.id = r.earner_id
       ${where}
       GROUP BY 1, 2 ORDER BY 1, 2`,
      params
    );
    rows = res.rows.map((x) => [x.week, x.role, x.verified_results, x.active_earners]);
  }

  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv(headers, rows), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bitcoin-kisumu-${type}-${today}.csv"`
    }
  });
}
