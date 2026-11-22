import { NextResponse } from 'next/server';
import { getAdminSession } from '@/app/lib/adminAuth';

export async function GET(req) {
  const session = getAdminSession(req.headers.get('cookie'));
  if (session.status === 'ok') return NextResponse.json({ login: session.login, admin: true });
  if (session.status === 'forbidden') {
    return NextResponse.json({ error: 'Not a Bitcoin Kisumu admin.' }, { status: 403 });
  }
  return NextResponse.json({ error: 'Sign-in required.' }, { status: 401 });
}
