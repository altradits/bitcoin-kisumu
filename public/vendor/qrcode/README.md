# Vendored QR generator

`qrcode.js` is qrcode-generator 1.4.4 by Kazuhiko Arase (MIT), fetched from:

https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js

Used by the admin payout console to render scannable `lightning:` QR codes
fully client-side (zero third-party APIs, zero PII leaving the browser).
The donate page QR is pre-generated instead (see `scripts/generate-assets.py`).

Upgrade: replace this file with a newer pinned release and update this note.
Verify with: `node -e "const q=require('./qrcode.js');const r=q(0,'M');r.addData('lightning:test@blink.sv');r.make();console.log(r.createSvgTag().length)"`
