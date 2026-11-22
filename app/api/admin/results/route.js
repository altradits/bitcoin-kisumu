import { NextResponse } from 'next/server';
import { requireAdmin, requireDb, logAudit } from '@/app/lib/adminApi';
import { getPool } from '@/app/lib/db';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isDate(s) {
  return DATE_RE.test(s) && !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());
}

export async function GET(req) {
  const gate = requireAdmin(req);
  if (gate.error) return gate.error;
  const noDb = requireDb();
  if (noDb) return noDb;
  const { rows } = await getPool().query(
    `SELECT r.id, r.earner_id, r.result_type, r.result_date, r.evidence, r.status,
            r.logged_by, r.verified_by, r.verified_at, r.rejection_reason, r.created_at,
            e.name AS earner_name, e.role AS earner_role
     FROM results r JOIN earners e ON e.id = r.earner_id
     ORDER BY r.result_date DESC, r.created_at DESC`
  );
  return NextResponse.json({ results: rows });
}

export async function POST(req) {
  const gate = requireAdmin(req);
  if (gate.error) return gate.error;
  const noDb = requireDb();
  if (noDb) return noDb;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  const earnerId = String(body.earner_id || '').trim();
  const resultType = String(body.result_type || '').trim();
  const resultDate = String(body.result_date || '').trim();
  const evidence = String(body.evidence || '').trim();
  if (!earnerId) return NextResponse.json({ error: 'Missing earner.' }, { status: 400 });
  if (resultType.length < 2) return NextResponse.json({ error: 'Describe the result.' }, { status: 400 });
  if (resultType.length > 100) return NextResponse.json({ error: 'Result type too long (100 chars max).' }, { status: 400 });
  if (resultDate !== '' && !isDate(resultDate)) {
    return NextResponse.json({ error: 'result_date must be YYYY-MM-DD.' }, { status: 400 });
  }
  if (evidence.length > 2000) return NextResponse.json({ error: 'Evidence too long (2000 chars max).' }, { status: 400 });
  const pool = getPool();
  const earner = await pool.query('SELECT id, active FROM earners WHERE id = $1', [earnerId]);
  if (!earner.rows.length) return NextResponse.json({ error: 'Unknown earner.' }, { status: 400 });
  if (!earner.rows[0].active) {
    return NextResponse.json({ error: 'Earner is deactivated.' }, { status: 400 });
  }
  // logged_by always comes from the session — a client value is ignored.
  const day = resultDate === '' ? new Date().toISOString().slice(0, 10) : resultDate;
  const { rows } = await pool.query(
    `INSERT INTO results (earner_id, result_type, result_date, evidence, logged_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [earnerId, resultType, day, evidence === '' ? null : evidence, gate.session.login]
  );
  await logAudit(pool, {
    actor: gate.session.login,
    action: 'result.log',
    entity: 'results',
    entityId: rows[0].id
  });
  return NextResponse.json({ result: rows[0] }, { status: 201 });
}

export async function PATCH(req) {
  const gate = requireAdmin(req);
  if (gate.error) return gate.error;
  const noDb = requireDb();
  if (noDb) return noDb;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  const id = String(body.id || '').trim();
  const action = String(body.action || '').trim();
  if (!id) return NextResponse.json({ error: 'Missing result id.' }, { status: 400 });
  if (action !== 'verify' && action !== 'reject') {
    return NextResponse.json({ error: "Action must be 'verify' or 'reject'." }, { status: 400 });
  }
  const pool = getPool();
  const existing = await pool.query('SELECT * FROM results WHERE id = $1', [id]);
  if (!existing.rows.length) return NextResponse.json({ error: 'Unknown result.' }, { status: 404 });
  const row = existing.rows[0];
  if (row.status !== 'submitted') {
    return NextResponse.json({ error: `Already ${row.status}.` }, { status: 409 });
  }
  // Two-person rule at the API layer (the DB CHECK enforces it too):
  // the admin who logged a result can never decide it.
  if (String(row.logged_by).toLowerCase() === String(gate.session.login).toLowerCase()) {
    return NextResponse.json({ error: 'You cannot decide a result you logged yourself.' }, { status: 403 });
  }
  if (action === 'reject') {
    const reason = String(body.rejection_reason || '').trim();
    if (!reason) return NextResponse.json({ error: 'A rejection reason is required.' }, { status: 400 });
    if (reason.length > 500) return NextResponse.json({ error: 'Reason too long (500 chars max).' }, { status: 400 });
    const { rows } = await pool.query(
      `UPDATE results SET status = 'rejected', verified_by = $1, verified_at = now(), rejection_reason = $2
       WHERE id = $3 RETURNING *`,
      [gate.session.login, reason, id]
    );
    await logAudit(pool, { actor: gate.session.login, action: 'result.reject', entity: 'results', entityId: id });
    return NextResponse.json({ result: rows[0] });
  }
  const { rows } = await pool.query(
    `UPDATE results SET status = 'verified', verified_by = $1, verified_at = now()
     WHERE id = $2 RETURNING *`,
    [gate.session.login, id]
  );
  await logAudit(pool, { actor: gate.session.login, action: 'result.verify', entity: 'results', entityId: id });
  return NextResponse.json({ result: rows[0] });
}
