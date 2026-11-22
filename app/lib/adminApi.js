// Shared helpers for /api/admin/* routes: server-side gates + audit writes.
import { NextResponse } from 'next/server';
import { getAdminSession } from './adminAuth';
import { isDbConfigured } from './db';

export function requireAdmin(req) {
  const session = getAdminSession(req.headers.get('cookie'));
  if (session.status === 'forbidden') {
    return {
      session,
      error: NextResponse.json({ error: 'Not a Bitcoin Kisumu admin.' }, { status: 403 })
    };
  }
  if (session.status !== 'ok') {
    return {
      session,
      error: NextResponse.json({ error: 'Sign-in required.' }, { status: 401 })
    };
  }
  return { session, error: null };
}

export function requireDb() {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: 'DATABASE_URL is not configured.' }, { status: 503 });
  }
  return null;
}

export async function logAudit(pool, { actor, action, entity, entityId = null, metadata = null }) {
  await pool.query(
    'INSERT INTO audit_log (actor, action, entity, entity_id, metadata) VALUES ($1, $2, $3, $4, $5)',
    [actor, action, entity, entityId, metadata]
  );
}
