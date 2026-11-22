import { NextResponse } from 'next/server';
import { sessionCookie } from '@/app/lib/adminAuth';

// POST only: with SameSite=Lax cookies, cross-site GETs (images, links)
// send cookies but cross-site form POSTs do not, so logout-by-POST cannot
// be forged from another site. GETs to this route 405 by default.
export async function POST(req) {
  const home = new URL('/', req.url).toString();
  return NextResponse.redirect(home, {
    headers: { 'Set-Cookie': sessionCookie('', { clear: true }) }
  });
}
