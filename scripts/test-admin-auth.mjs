// Admin auth test: fail-closed gates without touching GitHub's network.
// Covers: unconfigured env, signed-out, tampered/expired sessions,
// non-allowlisted logins, allowlist revocation, login redirect + state,
// callback state mismatch, logout clearing.
//
// Usage: npm run test:admin
import { createHmac } from 'node:crypto';
import { register } from 'node:module';

register('./test-shim-loader.mjs', import.meta.url);
const libUrl = new URL('../app/lib/adminAuth.js', import.meta.url).href;
const lib = await import(libUrl);
const meUrl = new URL('../app/api/admin/me/route.js', import.meta.url).href;
const loginUrl = new URL('../app/api/admin/login/route.js', import.meta.url).href;
const callbackUrl = new URL('../app/api/admin/callback/route.js', import.meta.url).href;
const logoutUrl = new URL('../app/api/admin/logout/route.js', import.meta.url).href;
const { GET: me } = await import(meUrl);
const { GET: login } = await import(loginUrl);
const { GET: callback } = await import(callbackUrl);
const { POST: logout } = await import(logoutUrl);

const failures = [];
const check = (cond, msg) => {
  if (!cond) failures.push(msg);
};
const req = (url, cookie) => ({
  url,
  headers: { get: (k) => (String(k).toLowerCase() === 'cookie' ? cookie || null : null) }
});
const setEnv = (obj) => {
  for (const k of ['GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'AUTH_SECRET', 'ADMIN_GITHUB_LOGINS']) {
    if (obj[k] === undefined) delete process.env[k];
    else process.env[k] = obj[k];
  }
};
const FULL_ENV = {
  GITHUB_CLIENT_ID: 'test-client-id',
  GITHUB_CLIENT_SECRET: 'test-client-secret',
  AUTH_SECRET: 'test-auth-secret-that-is-long-enough',
  ADMIN_GITHUB_LOGINS: 'Stanley, ivy'
};

// (a) Unconfigured: everything fails closed.
setEnv({});
check((await me(req('http://t/api/admin/me', null))).status === 401, 'me with no env must 401');
check((await login(req('http://t/api/admin/login', null))).status === 503, 'login with no env must 503');
check(
  lib.getAdminSession('bk_admin=forged').status === 'unauthenticated',
  'forged cookie with no env must be unauthenticated'
);

// Signed cookie minted, then env removed: still blocked.
setEnv(FULL_ENV);
const minted = lib.signSession('stanley');
setEnv({});
check(
  lib.getAdminSession(`bk_admin=${minted}`).status === 'unauthenticated',
  'valid cookie with env removed must be unauthenticated'
);

// (b) Tampered, garbage and expired sessions → 401.
setEnv(FULL_ENV);
const good = lib.signSession('stanley');
const tampered = good.slice(0, -2) + (good.endsWith('AA') ? 'BB' : 'AA');
let r = await me(req('http://t/api/admin/me', `bk_admin=${tampered}`));
check(r.status === 401, `tampered cookie must 401, got ${r.status}`);
r = await me(req('http://t/api/admin/me', 'bk_admin=garbage'));
check(r.status === 401, `garbage cookie must 401, got ${r.status}`);
const stalePayload = Buffer.from(JSON.stringify({ login: 'stanley', exp: 1 })).toString('base64url');
const staleSig = createHmac('sha256', process.env.AUTH_SECRET).update(stalePayload).digest('base64url');
r = await me(req('http://t/api/admin/me', `bk_admin=${stalePayload}.${staleSig}`));
check(r.status === 401, `expired session must 401, got ${r.status}`);

// (c) Valid signature, non-allowlisted login → 403; revocation works.
const mallory = lib.signSession('mallory');
r = await me(req('http://t/api/admin/me', `bk_admin=${mallory}`));
check(r.status === 403, `non-admin must 403, got ${r.status}`);
process.env.ADMIN_GITHUB_LOGINS = 'ivy';
r = await me(req('http://t/api/admin/me', `bk_admin=${good}`));
check(r.status === 403, `revoked admin must 403, got ${r.status}`);

// (d) Allowlisted admin (case-insensitive) → 200.
process.env.ADMIN_GITHUB_LOGINS = 'Stanley, ivy';
r = await me(req('http://t/api/admin/me', `bk_admin=${good}`));
const body = await r.json();
check(r.status === 200 && body.admin === true && body.login === 'stanley', `admin must 200, got ${r.status} ${JSON.stringify(body)}`);

// (e) Login redirect carries client_id + state and sets the state cookie.
r = await login(req('http://t/api/admin/login', null));
const location = r.headers.get('location') || '';
const setCookies = typeof r.headers.getSetCookie === 'function' ? r.headers.getSetCookie() : [r.headers.get('set-cookie')];
check(r.status === 302 || r.status === 307, `login must redirect, got ${r.status}`);
check(location.startsWith('https://github.com/login/oauth/authorize'), `login must target github, got ${location}`);
check(location.includes('client_id=test-client-id'), 'login must include client_id');
const stateParam = new URL(location).searchParams.get('state');
check(
  Boolean(stateParam) && setCookies.some((c) => String(c).includes(`bk_oauth_state=${stateParam}`)),
  'login must set state cookie matching the state param'
);
check(
  setCookies.some((c) => /httponly/i.test(String(c)) && /samesite=lax/i.test(String(c))),
  'state cookie must be HttpOnly + SameSite=Lax'
);

// (f) Callback with mismatched/missing state → 403 without network.
r = await callback(req('http://t/api/admin/callback?code=x&state=y', 'bk_oauth_state=z'));
check(r.status === 403, `callback state mismatch must 403, got ${r.status}`);
r = await callback(req('http://t/api/admin/callback', null));
check(r.status === 403, `callback without state must 403, got ${r.status}`);

// (g) Logout clears the session cookie and redirects home.
r = await logout(req('http://t/api/admin/logout', `bk_admin=${good}`));
const outCookies = typeof r.headers.getSetCookie === 'function' ? r.headers.getSetCookie() : [r.headers.get('set-cookie')];
check([302, 307].includes(r.status), `logout must redirect, got ${r.status}`);
check(
  outCookies.some((c) => String(c).startsWith('bk_admin=;') && /max-age=0/i.test(String(c))),
  `logout must clear cookie, got ${outCookies}`
);

// (h) Constant-time state comparison.
check(lib.safeEqual('abc123', 'abc123') === true, 'safeEqual identical');
check(lib.safeEqual('abc123', 'abc124') === false, 'safeEqual differs');
check(lib.safeEqual('abc', 'abcdef') === false, 'safeEqual length differs');

if (failures.length) {
  console.error(`ADMIN AUTH TEST FAILED (${failures.length}):`);
  for (const f of failures) console.error(' -', f);
  process.exit(1);
}
console.log('Admin auth test passed: fail-closed gates, allowlist, expiry, state, logout all hold.');
