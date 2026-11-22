// Minimal next/server stand-in for the RSVP concurrency test only.
// Mirrors the small surface the route uses: NextResponse.json(body, init).
export class NextResponse {
  static json(body, init = {}) {
    return {
      status: init.status ?? 200,
      headers: new Headers(init.headers || {}),
      async json() {
        return body;
      }
    };
  }
  static redirect(url, init = {}) {
    const headers = new Headers(init.headers || {});
    headers.set('location', String(url));
    return { status: init.status ?? 307, headers };
  }
}
