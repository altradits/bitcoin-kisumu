// Minimal next/server stand-in for the RSVP concurrency test only.
// Mirrors the small surface the route uses: NextResponse.json(body, init).
export class NextResponse {
  static json(body, init = {}) {
    return {
      status: init.status ?? 200,
      async json() {
        return body;
      }
    };
  }
}
