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

async function payoutsCsv(pool, { from, to, role }) {
  const conds = [];
  const params = [];
  if (from) {
    params.push(from);
    conds.push(`p.paid_at::date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conds.push(`p.paid_at::date <= $${params.length}`);
  }
  if (role) {
    params.push(role);
    conds.push(`e.role = $${params.length}`);
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const headers = [
    'date', 'earner_name', 'role', 'payroll_tier', 'lightning_address',
    'sats_amount', 'kes_equivalent', 'bucket', 'payment_reference', 'verified_by', 'paid_by'
  ];
  const res = await pool.query(
    `SELECT p.paid_at::date AS date, e.name AS earner_name, e.role,
            p.payroll_tier_snapshot, p.lightning_address_snapshot,
            p.sats_amount, p.kes_equivalent, p.bucket, p.payment_reference,
            r.verified_by, p.paid_by
     FROM payouts p
     JOIN earners e ON e.id = p.earner_id
     JOIN results r ON r.id = p.result_id
     ${where} ORDER BY p.paid_at ASC`,
    params
  );
  const rows = res.rows.map((x) => [
    fmtDate(x.date), x.earner_name, x.role, x.payroll_tier_snapshot, x.lightning_address_snapshot,
    x.sats_amount, x.kes_equivalent, x.bucket, x.payment_reference, x.verified_by, x.paid_by
  ]);
  const today = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv(headers, rows), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bitcoin-kisumu-payouts-${today}.csv"`
    }
  });
}

async function inflowsCsv(pool, { from, to }) {
  const conds = [];
  const params = [];
  if (from) {
    params.push(from);
    conds.push(`inflow_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conds.push(`inflow_date <= $${params.length}`);
  }
  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const headers = [
    'date', 'category', 'origin', 'bucket', 'sats_amount',
    'kes_equivalent', 'source_note', 'payment_reference', 'recorded_by'
  ];
  const res = await pool.query(
    `SELECT inflow_date, category, origin, bucket, sats_amount,
            kes_equivalent, source_note, payment_reference, recorded_by
     FROM inflows ${where} ORDER BY inflow_date ASC`,
    params
  );
  const rows = res.rows.map((x) => [
    fmtDate(x.inflow_date), x.category, x.origin, x.bucket, x.sats_amount,
    x.kes_equivalent, x.source_note, x.payment_reference, x.recorded_by
  ]);
  return csvResponse(`bitcoin-kisumu-inflows-${todayStamp()}`, headers, rows);
}

async function quarterlyCsv(pool, { from, to }) {
  const buildRange = (col) => {
    const conds = [];
    const params = [];
    if (from) {
      params.push(from);
      conds.push(`${col} >= $${params.length}`);
    }
    if (to) {
      params.push(to);
      conds.push(`${col} <= $${params.length}`);
    }
    return { where: conds.length ? `WHERE ${conds.join(' AND ')}` : '', params };
  };
  const inf = buildRange('inflow_date');
  const out = buildRange('paid_at::date');
  const [i, o] = await Promise.all([
    pool.query(
      `SELECT COALESCE(SUM(sats_amount), 0)::bigint AS total,
              COALESCE(SUM(sats_amount) FILTER (WHERE category = 'grant_donation'), 0)::bigint AS grants,
              COALESCE(SUM(sats_amount) FILTER (WHERE category <> 'grant_donation'), 0)::bigint AS earned,
              COALESCE(SUM(sats_amount) FILTER (WHERE origin = 'external'), 0)::bigint AS external,
              COALESCE(SUM(sats_amount) FILTER (WHERE origin = 'local'), 0)::bigint AS local,
              COALESCE(SUM(sats_amount) FILTER (WHERE bucket = 'runway'), 0)::bigint AS b_runway,
              COALESCE(SUM(sats_amount) FILTER (WHERE bucket = 'pilot_capex'), 0)::bigint AS b_capex,
              COALESCE(SUM(sats_amount) FILTER (WHERE bucket = 'reserve'), 0)::bigint AS b_reserve
       FROM inflows ${inf.where}`,
      inf.params
    ),
    pool.query(
      `SELECT COALESCE(SUM(sats_amount), 0)::bigint AS total,
              COALESCE(SUM(sats_amount) FILTER (WHERE bucket = 'runway'), 0)::bigint AS b_runway,
              COALESCE(SUM(sats_amount) FILTER (WHERE bucket = 'pilot_capex'), 0)::bigint AS b_capex
       FROM payouts ${out.where}`,
      out.params
    )
  ]);
  const a = i.rows[0];
  const b = o.rows[0];
  const outTotal = Number(b.total);
  const ratio = (n) => (outTotal > 0 ? Math.round((Number(n) / outTotal) * 10000) / 10000 : '');
  const rows = [
    ['total_grants_sats', a.grants],
    ['total_earned_sats', a.earned],
    ['external_sats_in', a.external],
    ['local_sats_in', a.local],
    ['bucket_runway_in', a.b_runway],
    ['bucket_pilot_capex_in', a.b_capex],
    ['bucket_reserve_in', a.b_reserve],
    ['total_sats_paid_out', b.total],
    ['bucket_runway_out', b.b_runway],
    ['bucket_pilot_capex_out', b.b_capex],
    ['earned_revenue_ratio', ratio(a.earned)],
    ['net_sats_inflow_ratio', ratio(a.external)]
  ];
  return csvResponse(`bitcoin-kisumu-quarterly-${todayStamp()}`, ['metric', 'value'], rows);
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function csvResponse(filename, headers, rows) {
  return new NextResponse(toCsv(headers, rows), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.csv"`
    }
  });
}

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
  if (!['results', 'weekly', 'payouts', 'inflows', 'quarterly'].includes(type)) {
    return NextResponse.json({ error: 'type must be results, weekly, payouts, inflows or quarterly.' }, { status: 400 });
  }
  if ((from && !isDate(from)) || (to && !isDate(to))) {
    return NextResponse.json({ error: 'from/to must be YYYY-MM-DD.' }, { status: 400 });
  }
  if (role && !EARNER_ROLES.includes(role)) {
    return NextResponse.json({ error: `role must be one of: ${EARNER_ROLES.join(', ')}.` }, { status: 400 });
  }

  const pool = getPool();
  if (type === 'payouts') return payoutsCsv(pool, { from, to, role });
  if (type === 'inflows') return inflowsCsv(pool, { from, to });
  if (type === 'quarterly') return quarterlyCsv(pool, { from, to });
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
    // Weekly aggregates. Shop counts are live point-in-time snapshots,
    // repeated per row (shops are not week-scoped like results).
    headers = ['week', 'role', 'verified_results', 'active_earners', 'shops_live', 'shops_active_30d'];
    const [res, shops] = await Promise.all([
      pool.query(
        `SELECT to_char(date_trunc('week', r.result_date), 'YYYY-MM-DD') AS week,
                e.role, COUNT(*)::int AS verified_results,
                COUNT(DISTINCT r.earner_id)::int AS active_earners
         FROM results r JOIN earners e ON e.id = r.earner_id
         ${where}
         GROUP BY 1, 2 ORDER BY 1, 2`,
        params
      ),
      pool.query(
        `SELECT COUNT(*) FILTER (WHERE status = 'live')::int AS live,
                COUNT(*) FILTER (WHERE status = 'live' AND last_verified_payment_date >= CURRENT_DATE - 30)::int AS active
         FROM merchants`
      )
    ]);
    const live = shops.rows[0]?.live ?? 0;
    const active = shops.rows[0]?.active ?? 0;
    rows = res.rows.map((x) => [x.week, x.role, x.verified_results, x.active_earners, live, active]);
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
