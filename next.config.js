/** @type {import('next').NextConfig} */

// Content-Security-Policy notes:
// - script/style 'unsafe-inline' is required by Next.js hydration without a
//   nonce setup (documented Next.js limitation).
// - Blink donate widget (public/vendor/blink/blink-pay-button.js, pinned v1.5.3):
//   - connect https://api.blink.sv — Blink GraphQL API
//   - connect https://blink.sv — LNURL-pay lookup for our @blink.sv address
//   - connect wss://ws.blink.sv — real-time payment status
//   - img/connect https://get.blink.sv — widget analytics beacon
//   - img https://blinkbitcoin.github.io — widget art (checkmark, logos)
//   - style https://fonts.googleapis.com + font https://fonts.gstatic.com — widget font
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // img data: — Blink renders its live invoice QR as <img src="data:image/..."> (buildQrDataUrl).
  'img-src \'self\' data: https://blinkbitcoin.github.io https://get.blink.sv',
  'connect-src \'self\' https://api.blink.sv https://blink.sv https://get.blink.sv https://ws.blink.sv wss://ws.blink.sv',
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests'
].join('; ');

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [{ source: '/transparency', destination: '/treasury', permanent: true }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: CSP }
        ]
      },
      {
        // NIP-05 verification must be fetchable cross-origin by any client.
        source: '/.well-known/nostr.json',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }]
      }
    ];
  }
};

module.exports = nextConfig;
