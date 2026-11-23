import { NextResponse } from 'next/server';
import { requireAdmin, requireDb, logAudit } from '@/app/lib/adminApi';
import { getPool, fmtPgDate } from '@/app/lib/db';
import { safeRevalidate } from '@/app/lib/revalidate';

const CATEGORIES = [
  'grant_donation',
  'earned_merch',
  'earned_art',
  'earned_tour',
  'earned_workshop',
  'earned_guild',
  'earned_lake_ops'
];
const ORIGINS = ['external', 'local'];
const BUCKETS = ['runway', 'pilot_capex', 'reserve'];
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
    `SELECT id, inflow_date, category, origin, bucket, sats_amount,
            kes_equivalent, source_note, payment_reference, recorded_by, created_at
     FROM inflows ORDER BY inflow_date DESC, created_at DESC`
  );
  return NextResponse.json({ inflows: rows });
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
  const inflowDate = String(body.inflow_date || '').trim();
  const category = String(body.category || '').trim();
  const origin = String(body.origin || '').trim();
  const bucket = String(body.bucket || '').trim();
  const sats = Number(body.sats_amount);
  const kes = body.kes_equivalent === undefined || body.kes_equivalent === '' ? 0 : Number(body.kes_equivalent);
  const note = String(body.source_note || '').trim();
  const reference = String(body.payment_reference || '').trim();
  if (inflowDate !== '' && !isDate(inflowDate)) {
    return NextResponse.json({ error: 'inflow_date must be YYYY-MM-DD.' }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
  if (!ORIGINS.includes(origin)) return NextResponse.json({ error: "origin must be 'external' or 'local'." }, { status: 400 });
  if (!BUCKETS.includes(bucket)) return NextResponse.json({ error: 'Invalid bucket.' }, { status: 400 });
  if (!Number.isInteger(sats) || sats < 0) {
    return NextResponse.json({ error: 'sats_amount must be a whole number ≥ 0.' }, { status: 400 });
  }
  if (Number.isNaN(kes) || kes < 0) {
    return NextResponse.json({ error: 'kes_equivalent must be ≥ 0.' }, { status: 400 });
  }
  if (sats === 0 && kes === 0) {
    return NextResponse.json({ error: 'At least one of sats_amount or kes_equivalent must be positive.' }, { status: 400 });
  }
  if (note.length < 2) return NextResponse.json({ error: 'Describe the source (no donor PII).' }, { status: 400 });
  if (note.length > 500) return NextResponse.json({ error: 'Source note too long.' }, { status: 400 });
  if (reference.length > 500) return NextResponse.json({ error: 'Payment reference too long.' }, { status: 400 });
  const pool = getPool();
  const day = inflowDate === '' ? fmtPgDate(new Date()) : inflowDate;
  const { rows } = await pool.query(
    `INSERT INTO inflows (inflow_date, category, origin, bucket, sats_amount,
      kes_equivalent, source_note, payment_reference, recorded_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [day, category, origin, bucket, sats, kes, note, reference === '' ? null : reference, gate.session.login]
  );
  await logAudit(pool, {
    actor: gate.session.login,
    action: 'inflow.record',
    entity: 'inflows',
    entityId: rows[0].id
  });
  await safeRevalidate('/pilot');
  await safeRevalidate('/treasury');
  return NextResponse.json({ inflow: rows[0] }, { status: 201 });
}
