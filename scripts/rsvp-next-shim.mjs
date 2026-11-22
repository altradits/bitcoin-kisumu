// Minimal next/server stand-in for tests only. Extends the real Response so
// `new NextResponse(body, init)` behaves exactly like production, alongside
// the `.json()` and `.redirect()` helpers the routes use.
export class NextResponse extends Response {
  static json(body, init = {}) {
    return new NextResponse(JSON.stringify(body), {
      ...init,
      headers: { 'content-type': 'application/json', ...(init.headers || {}) }
    });
  }
  static redirect(url, init = {}) {
    const headers = new Headers(init.headers || {});
    headers.set('location', String(url));
    return new NextResponse(null, { ...init, status: init.status ?? 307, headers });
  }
}
