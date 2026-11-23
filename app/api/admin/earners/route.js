import { NextResponse } from 'next/server';
import { requireAdmin, requireDb, logAudit } from '@/app/lib/adminApi';
import { getPool, fmtPgDate } from '@/app/lib/db';
import { safeRevalidate } from '@/app/lib/revalidate';
import { EARNER_ROLES } from '@/app/lib/pilot';

const LN_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isDate(s) {
  return DATE_RE.test(s) && !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());
}

// Returns { ok, errors[], clean } — partial=true accepts a subset for PATCH.
function validateEarner(body, { partial = false } = {}) {
  const errors = [];
  const clean = {};
  const has = (k) => body[k] !== undefined;

  if (has('name') || !partial) {
    const v = String(body.name ?? '').trim();
    if (v.length < 2) errors.push('Name needs at least 2 characters.');
    else if (v.length > 100) errors.push('Name too long (100 chars max).');
    else clean.name = v;
  }
  if (has('role') || !partial) {
    if (!EARNER_ROLES.includes(body.role)) errors.push(`Role must be one of: ${EARNER_ROLES.join(', ')}.`);
    else clean.role = body.role;
  }
  if (has('lightning_address')) {
    const v = String(body.lightning_address ?? '').trim();
    if (v === '') clean.lightning_address = null;
    else if (v.length > 254 || !LN_RE.test(v)) errors.push('Lightning address must look like name@domain.');
    else clean.lightning_address = v;
  }
  if (has('payroll_tier') || !partial) {
    const t = body.payroll_tier === undefined ? 1 : Number(body.payroll_tier);
    if (![1, 2, 3].includes(t)) errors.push('payroll_tier must be 1, 2 or 3.');
    else clean.payroll_tier = t;
  }
  if (has('ward_area')) {
    const v = String(body.ward_area ?? '').trim();
    if (v.length > 100) errors.push('Ward/area too long (100 chars max).');
    else clean.ward_area = v === '' ? null : v;
  }
  if (has('start_date')) {
    const v = String(body.start_date ?? '').trim();
    if (v !== '' && !isDate(v)) errors.push('start_date must be YYYY-MM-DD.');
    else clean.start_date = v === '' ? null : v;
  }
  if (has('consent_date')) {
    const v = String(body.consent_date ?? '').trim();
    if (v !== '' && !isDate(v)) errors.push('consent_date must be YYYY-MM-DD.');
    else clean.consent_date = v === '' ? null : v;
  }
  if (has('phone')) {
    const v = String(body.phone ?? '').trim();
    if (v.length > 30) errors.push('Phone too long (30 chars max).');
    else clean.phone = v === '' ? null : v;
  }
  // Data Protection Act 2019: phone only with recorded consent.
  const phone = clean.phone !== undefined ? clean.phone : undefined;
  const consent = clean.consent_date !== undefined ? clean.consent_date : undefined;
  if (phone && !consent) errors.push('Phone requires a consent_date (Data Protection Act 2019).');
  if (has('active')) clean.active = Boolean(body.active);

  return { ok: errors.length === 0, errors, clean };
}

export async function GET(req) {
  const gate = requireAdmin(req);
  if (gate.error) return gate.error;
  const noDb = requireDb();
  if (noDb) return noDb;
  const { rows } = await getPool().query(
    'SELECT id, name, role, lightning_address, payroll_tier, ward_area, start_date, active, consent_date, phone, created_at FROM earners ORDER BY active DESC, name ASC'
  );
  return NextResponse.json({ earners: rows });
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
  const v = validateEarner(body);
  if (!v.ok) return NextResponse.json({ error: v.errors[0], errors: v.errors }, { status: 400 });
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO earners (name, role, lightning_address, payroll_tier, ward_area, start_date, consent_date, phone)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      v.clean.name,
      v.clean.role,
      v.clean.lightning_address ?? null,
      v.clean.payroll_tier,
      v.clean.ward_area ?? null,
      v.clean.start_date ?? null,
      v.clean.consent_date ?? null,
      v.clean.phone ?? null
    ]
  );
  await logAudit(pool, {
    actor: gate.session.login,
    action: 'earner.create',
    entity: 'earners',
    entityId: rows[0].id
  });
  await safeRevalidate('/pilot');
  await safeRevalidate('/treasury');
  return NextResponse.json({ earner: rows[0] }, { status: 201 });
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
  if (!id) return NextResponse.json({ error: 'Missing earner id.' }, { status: 400 });
  const pool = getPool();
  const existing = await pool.query('SELECT * FROM earners WHERE id = $1', [id]);
  if (!existing.rows.length) return NextResponse.json({ error: 'Unknown earner.' }, { status: 404 });
  // Merge with the stored row so cross-field rules (phone+consent) check out.
  const merged = { ...existing.rows[0], ...body };
  for (const k of ['start_date', 'consent_date']) {
    merged[k] = fmtPgDate(merged[k]);
  }
  const v = validateEarner(merged, { partial: true });
  if (!v.ok) return NextResponse.json({ error: v.errors[0], errors: v.errors }, { status: 400 });
  const c = v.clean;
  const { rows } = await pool.query(
    `UPDATE earners SET name = $1, role = $2, lightning_address = $3, payroll_tier = $4,
     ward_area = $5, start_date = $6, consent_date = $7, phone = $8, active = $9
     WHERE id = $10 RETURNING *`,
    [c.name, c.role, c.lightning_address, c.payroll_tier, c.ward_area, c.start_date, c.consent_date, c.phone, c.active, id]
  );
  const deactivated = existing.rows[0].active && !rows[0].active;
  await logAudit(pool, {
    actor: gate.session.login,
    action: deactivated ? 'earner.deactivate' : 'earner.edit',
    entity: 'earners',
    entityId: id
  });
  await safeRevalidate('/pilot');
  await safeRevalidate('/treasury');
  return NextResponse.json({ earner: rows[0] });
}
