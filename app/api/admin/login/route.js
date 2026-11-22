import { NextResponse } from 'next/server';
import { authConfigured, newState, stateCookie } from '@/app/lib/adminAuth';

export async function GET(req) {
  if (!authConfigured()) {
    return NextResponse.json({ error: 'Admin sign-in is not configured.' }, { status: 503 });
  }
  const state = newState();
  const callback = new URL('/api/admin/callback', req.url).toString();
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', process.env.GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', callback);
  url.searchParams.set('scope', 'read:user');
  url.searchParams.set('state', state);
  return NextResponse.redirect(url.toString(), {
    headers: { 'Set-Cookie': stateCookie(state) }
  });
}
