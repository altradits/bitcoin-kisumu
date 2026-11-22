import { NextResponse } from 'next/server';
import { sessionCookie } from '@/app/lib/adminAuth';

export async function GET(req) {
  const home = new URL('/', req.url).toString();
  return NextResponse.redirect(home, {
    headers: { 'Set-Cookie': sessionCookie('', { clear: true }) }
  });
}
