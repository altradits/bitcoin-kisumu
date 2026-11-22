// Admin auth: GitHub OAuth + username allowlist, fail-closed by construction.
// Every gate below returns "no" when env vars are missing or invalid — there
// is no configuration in which an unset env grants access. No next/* imports
// so the gates stay unit-testable in plain Node.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'bk_admin';
export const STATE_COOKIE = 'bk_oauth_state';
const SESSION_MAX_AGE = 12 * 60 * 60; // 12h
const STATE_MAX_AGE = 600; // 10 min

export function authConfigured() {
  return Boolean(
    process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_SECRET &&
    process.env.AUTH_SECRET &&
    process.env.ADMIN_GITHUB_LOGINS
  );
}

export function adminLogins() {
  return String(process.env.ADMIN_GITHUB_LOGINS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function b64uEncodeJson(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

export function signSession(login) {
  const payload = b64uEncodeJson({ login, exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE });
  const sig = createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySession(token) {
  try {
    if (!process.env.AUTH_SECRET || !token) return null;
    const [payload, sig] = String(token).split('.');
    if (!payload || !sig) return null;
    const expected = createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest();
    const actual = Buffer.from(sig, 'base64url');
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!data.login || typeof data.exp !== 'number' || data.exp < Date.now() / 1000) return null;
    return data.login;
  } catch {
    return null;
  }
}

// The single gate every /admin surface uses. Returns:
// - { status: 'ok', login } — signed session + allowlisted login
// - { status: 'forbidden', login } — valid session, login not allowlisted
// - { status: 'unauthenticated', login: null } — everything else
export function getAdminSession(cookieHeader) {
  if (!authConfigured()) return { status: 'unauthenticated', login: null };
  const m = String(cookieHeader || '').match(/(?:^|;\s*)bk_admin=([^;]*)/);
  let token = null;
  try {
    token = m ? decodeURIComponent(m[1]) : null;
  } catch {
    token = null;
  }
  const login = verifySession(token);
  if (!login) return { status: 'unauthenticated', login: null };
  if (!adminLogins().includes(String(login).toLowerCase())) return { status: 'forbidden', login };
  return { status: 'ok', login };
}

export function newState() {
  return randomBytes(16).toString('base64url');
}

function cookie(name, value, maxAge) {
  const parts = [
    `${name}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    maxAge === 0 ? 'Max-Age=0' : `Max-Age=${maxAge}`
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

export function sessionCookie(token, { clear = false } = {}) {
  return cookie(SESSION_COOKIE, clear ? '' : token, clear ? 0 : SESSION_MAX_AGE);
}

export function stateCookie(state, { clear = false } = {}) {
  return cookie(STATE_COOKIE, clear ? '' : state, clear ? 0 : STATE_MAX_AGE);
}
