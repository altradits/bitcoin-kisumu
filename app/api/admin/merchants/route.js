import { NextResponse } from 'next/server';
import { requireAdmin, requireDb, logAudit } from '@/app/lib/adminApi';
import { getPool, fmtPgDate } from '@/app/lib/db';
import { safeRevalidate } from '@/app/lib/revalidate';
import { merchantCategories } from '@/app/lib/merchants';

const ACCEPTS = ['Lightning', 'On-Chain'];
const STATUSES = ['onboarding', 'live', 'inactive'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isDate(s) {
  return DATE_RE.test(s) && !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());
}

function isUrl(s) {
  try {
    const u = new URL(s);
    return u.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateMerchant(body) {
  const errors = [];
  const clean = {};
  const name = String(body.name ?? '').trim();
  if (name.length < 2) errors.push('Name needs at least 2 characters.');
  else if (name.length > 100) errors.push('Name too long (100 chars max).');
  else clean.name = name;
  if (!merchantCategories.includes(body.category)) {
    errors.push(`Category must be one of: ${merchantCategories.join(', ')}.`);
  } else clean.category = body.category;
  const area = String(body.area ?? '').trim();
  if (area.length > 100) errors.push('Area too long (100 chars max).');
  else clean.area = area === '' ? null : area;
  const accepts = Array.isArray(body.accepts) ? body.accepts : [];
  if (!accepts.every((a) => ACCEPTS.includes(a))) {
    errors.push('accepts must only contain Lightning and/or On-Chain.');
  } else clean.accepts = [...new Set(accepts)];
  const b2b = String(body.b2b_supplier_of ?? '').trim();
  if (b2b.length > 200) errors.push('B2B note too long (200 chars max).');
  else clean.b2b_supplier_of = b2b === '' ? null : b2b;
  const map = String(body.btcmap_url ?? '').trim();
  if (map !== '' && (!isUrl(map) || map.length > 500)) errors.push('BTCMap URL must be https (500 chars max).');
  else clean.btcmap_url = map === '' ? null : map;
  if (!STATUSES.includes(body.status || 'onboarding')) errors.push('Invalid status.');
  else clean.status = body.status || 'onboarding';
  const verified = String(body.last_verified_payment_date ?? '').trim();
  if (verified !== '' && !isDate(verified)) errors.push('last_verified_payment_date must be YYYY-MM-DD.');
  else clean.last_verified_payment_date = verified === '' ? null : verified;
  return { ok: errors.length === 0, errors, clean };
}

export async function GET(req) {
  const gate = requireAdmin(req);
  if (gate.error) return gate.error;
  const noDb = requireDb();
  if (noDb) return noDb;
  const { rows } = await getPool().query(
    'SELECT id, name, category, area, accepts, b2b_supplier_of, btcmap_url, status, last_verified_payment_date, created_at FROM merchants ORDER BY status ASC, name ASC'
  );
  return NextResponse.json({ merchants: rows });
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
  const v = validateMerchant(body);
  if (!v.ok) return NextResponse.json({ error: v.errors[0], errors: v.errors }, { status: 400 });
  const pool = getPool();
  const { rows } = await pool.query(
    `INSERT INTO merchants (name, category, area, accepts, b2b_supplier_of, btcmap_url, status, last_verified_payment_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [v.clean.name, v.clean.category, v.clean.area, v.clean.accepts, v.clean.b2b_supplier_of, v.clean.btcmap_url, v.clean.status, v.clean.last_verified_payment_date]
  );
  await logAudit(pool, { actor: gate.session.login, action: 'merchant.create', entity: 'merchants', entityId: rows[0].id });
  await safeRevalidate('/merchants');
  await safeRevalidate('/pilot');
  await safeRevalidate('/treasury');
  return NextResponse.json({ merchant: rows[0] }, { status: 201 });
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
  if (!id) return NextResponse.json({ error: 'Missing merchant id.' }, { status: 400 });
  const pool = getPool();
  const existing = await pool.query('SELECT * FROM merchants WHERE id = $1', [id]);
  if (!existing.rows.length) return NextResponse.json({ error: 'Unknown merchant.' }, { status: 404 });
  const merged = { ...existing.rows[0], ...body };
  merged.last_verified_payment_date = fmtPgDate(merged.last_verified_payment_date);
  const v = validateMerchant(merged);
  if (!v.ok) return NextResponse.json({ error: v.errors[0], errors: v.errors }, { status: 400 });
  const c = v.clean;
  const { rows } = await pool.query(
    `UPDATE merchants SET name = $1, category = $2, area = $3, accepts = $4,
     b2b_supplier_of = $5, btcmap_url = $6, status = $7, last_verified_payment_date = $8
     WHERE id = $9 RETURNING *`,
    [c.name, c.category, c.area, c.accepts, c.b2b_supplier_of, c.btcmap_url, c.status, c.last_verified_payment_date, id]
  );
  await logAudit(pool, { actor: gate.session.login, action: 'merchant.edit', entity: 'merchants', entityId: id });
  await safeRevalidate('/merchants');
  await safeRevalidate('/pilot');
  await safeRevalidate('/treasury');
  return NextResponse.json({ merchant: rows[0] });
}
