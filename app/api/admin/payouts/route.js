import { NextResponse } from 'next/server';
import { requireAdmin, requireDb, logAudit } from '@/app/lib/adminApi';
import { getPool } from '@/app/lib/db';

const MAX_SATS = 210_000_000_000_000; // 21M BTC in sats: fat-finger ceiling

export async function GET(req) {
  const gate = requireAdmin(req);
  if (gate.error) return gate.error;
  const noDb = requireDb();
  if (noDb) return noDb;
  const { rows } = await getPool().query(
    `SELECT p.id, p.result_id, p.earner_id, p.sats_amount, p.kes_equivalent,
            p.payroll_tier_snapshot, p.lightning_address_snapshot, p.payment_reference,
            p.paid_by, p.paid_at, p.bucket,
            e.name AS earner_name, e.role AS earner_role,
            r.result_type, r.result_date
     FROM payouts p
     JOIN earners e ON e.id = p.earner_id
     JOIN results r ON r.id = p.result_id
     ORDER BY p.paid_at DESC`
  );
  return NextResponse.json({ payouts: rows });
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
  const resultId = String(body.result_id || '').trim();
  const sats = Number(body.sats_amount);
  const kes = body.kes_equivalent === undefined || body.kes_equivalent === '' ? null : Number(body.kes_equivalent);
  const reference = String(body.payment_reference || '').trim();
  const bucket = String(body.bucket || '').trim();
  if (!resultId) return NextResponse.json({ error: 'Missing result.' }, { status: 400 });
  if (!Number.isInteger(sats) || sats <= 0 || sats > MAX_SATS) {
    return NextResponse.json({ error: 'sats_amount must be a positive whole number.' }, { status: 400 });
  }
  if (kes === null || Number.isNaN(kes) || kes < 0) {
    return NextResponse.json({ error: 'kes_equivalent (KRA valuation) is required.' }, { status: 400 });
  }
  if (reference.length < 2) return NextResponse.json({ error: 'payment_reference is required.' }, { status: 400 });
  if (reference.length > 500) return NextResponse.json({ error: 'payment_reference too long.' }, { status: 400 });
  if (bucket !== 'runway' && bucket !== 'pilot_capex') {
    return NextResponse.json({ error: "bucket must be 'runway' or 'pilot_capex'." }, { status: 400 });
  }
  const pool = getPool();
  const found = await pool.query(
    `SELECT r.id, r.status, r.earner_id, e.payroll_tier, e.lightning_address
     FROM results r JOIN earners e ON e.id = r.earner_id WHERE r.id = $1`,
    [resultId]
  );
  if (!found.rows.length) return NextResponse.json({ error: 'Unknown result.' }, { status: 404 });
  if (found.rows[0].status !== 'verified') {
    return NextResponse.json({ error: 'Only verified results can be paid.' }, { status: 409 });
  }
  const done = await pool.query('SELECT id FROM payouts WHERE result_id = $1', [resultId]);
  if (done.rows.length) {
    return NextResponse.json({ error: 'This result was already paid.' }, { status: 409 });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO payouts (result_id, earner_id, sats_amount, kes_equivalent,
        payroll_tier_snapshot, lightning_address_snapshot, payment_reference, paid_by, bucket)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        resultId,
        found.rows[0].earner_id,
        sats,
        kes,
        found.rows[0].payroll_tier,
        found.rows[0].lightning_address,
        reference,
        gate.session.login,
        bucket
      ]
    );
    await logAudit(pool, {
      actor: gate.session.login,
      action: 'payout.record',
      entity: 'payouts',
      entityId: rows[0].id
    });
    return NextResponse.json({ payout: rows[0] }, { status: 201 });
  } catch (err) {
    // Racer lost the UNIQUE race after passing the check above.
    if (err && err.code === '23505') {
      return NextResponse.json({ error: 'This result was already paid.' }, { status: 409 });
    }
    throw err;
  }
}
