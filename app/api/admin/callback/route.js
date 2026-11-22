import { NextResponse } from 'next/server';
import {
  authConfigured,
  adminLogins,
  signSession,
  sessionCookie,
  stateCookie,
  safeEqual,
  STATE_COOKIE
} from '@/app/lib/adminAuth';

function parseCookies(header) {
  const out = {};
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0) {
      try {
        out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
      } catch {
        out[part.slice(0, i).trim()] = '';
      }
    }
  }
  return out;
}

function fail(msg, clearState) {
  return NextResponse.json(
    { error: msg },
    { status: 403, headers: { 'Set-Cookie': clearState } }
  );
}

export async function GET(req) {
  const url = new URL(req.url);
  const cookies = parseCookies(req.headers.get('cookie'));
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');
  const clearState = stateCookie('', { clear: true });
  if (!authConfigured()) {
    return NextResponse.json(
      { error: 'Admin sign-in is not configured.' },
      { status: 503, headers: { 'Set-Cookie': clearState } }
    );
  }
  if (!state || !code || !cookies[STATE_COOKIE] || !safeEqual(state, cookies[STATE_COOKIE])) {
    return fail('Invalid sign-in attempt.', clearState);
  }
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) return fail('GitHub sign-in failed.', clearState);
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'bitcoin-kisumu'
      }
    });
    const user = await userRes.json();
    const login = user && user.login;
    if (!userRes.ok || !login) return fail('GitHub sign-in failed.', clearState);
    if (!adminLogins().includes(String(login).toLowerCase())) {
      return fail('Not a Bitcoin Kisumu admin.', clearState);
    }
    return NextResponse.redirect(new URL('/admin', req.url).toString(), {
      headers: [
        ['Set-Cookie', sessionCookie(signSession(login))],
        ['Set-Cookie', clearState]
      ]
    });
  } catch {
    return fail('GitHub sign-in failed.', clearState);
  }
}
