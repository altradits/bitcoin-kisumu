// Pure format + checksum validators for Bitcoin objects. Zero imports (not
// even node:crypto) so both the server verifier and the client-side /verify
// page share this exact code.

const HEX64_RE = /^[0-9a-fA-F]{64}$/;

export function isHex64(s) {
  return typeof s === 'string' && HEX64_RE.test(s);
}

// --- BIP-173 bech32 checksum (used by BOLT11 invoices) ---

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const BECH32_GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function bech32Polymod(values) {
  let chk = 1;
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) chk ^= BECH32_GEN[i];
    }
  }
  return chk;
}

function bech32HrpExpand(hrp) {
  const out = [];
  for (const c of hrp) out.push(c.charCodeAt(0) >> 5);
  out.push(0);
  for (const c of hrp) out.push(c.charCodeAt(0) & 31);
  return out;
}

// Full bech32 checksum verification over hrp + data (data includes the
// trailing 6 checksum characters). Returns false on any corruption.
function bech32Verify(hrp, dataPart) {
  const data = [];
  for (const ch of dataPart) {
    const v = BECH32_CHARSET.indexOf(ch);
    if (v === -1) return false;
    data.push(v);
  }
  if (data.length < 6) return false;
  return bech32Polymod(bech32HrpExpand(hrp).concat(data)) === 1;
}

// --- BOLT11 ---

const HRP_RE = /^(lnbcrt|lnbc|lntb)(\d*)([munp])?$/;
// Pico-BTC per unit (exact integers; 1 msat = 10 pico).
const PICO_PER_UNIT = { m: 1000000000n, u: 1000000n, n: 1000n, p: 1n, '': 1000000000000n };

function bolt11Parts(str) {
  if (typeof str !== 'string') return null;
  const s = str.trim().toLowerCase();
  if (!/^(lnbcrt|lnbc|lntb)/.test(s)) return null;
  if (s.length < 20 || s.length > 7098) return null;
  const sep = s.lastIndexOf('1');
  if (sep < 4) return null;
  return { hrp: s.slice(0, sep), payload: s.slice(sep + 1) };
}

export function isValidBolt11(str) {
  const parts = bolt11Parts(str);
  if (!parts) return false;
  if (!HRP_RE.test(parts.hrp)) return false;
  return bech32Verify(parts.hrp, parts.payload);
}

// Decodes network + exact amount. amountSats is exact for all realistic
// invoices (integer math in pico-BTC under the hood); sub-satoshi pico
// amounts report their fractional value. Zero-length amount part means
// the invoice lets the payer choose ("any amount").
export function decodeBolt11Summary(str) {
  const fail = (error) => ({
    valid: false, network: null, amountSats: null, amountMsat: null, anyAmount: false, error
  });
  const parts = bolt11Parts(str);
  if (!parts) return fail('Not a BOLT11-shaped invoice.');
  const m = parts.hrp.match(HRP_RE);
  if (!m) return fail('Unrecognized BOLT11 prefix or amount.');
  if (!bech32Verify(parts.hrp, parts.payload)) return fail('Corrupted invoice: bech32 checksum mismatch.');
  const network = parts.hrp.startsWith('lnbcrt') ? 'regtest' : parts.hrp.startsWith('lnbc') ? 'mainnet' : 'testnet';
  const [, , digits, mult] = m;
  if (digits === '') {
    return { valid: true, network, amountSats: null, amountMsat: null, anyAmount: true, error: null };
  }
  const pico = BigInt(digits) * (PICO_PER_UNIT[mult || ''] ?? 1000000000000n);
  const msat = Number(pico) / 10;
  const sats = Number(pico) / 10000;
  return { valid: true, network, amountSats: sats, amountMsat: msat, anyAmount: false, error: null };
}

// --- BIP-380 descriptor checksums ---

const INPUT_CHARSET =
  '0123456789()[],\'/*abcdefgh@:$%{}IJKLMNOPQRSTUVWXYZ&+-.;<=>?!^_|~ijklmnopqrstuvwxyzABCDEFGH`#"\\ ';
const DESC_CHECKSUM_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const DESC_GENERATOR = [0xf5dee51989, 0xa9fdca3312, 0x1bab10e32d, 0x3706b1677a, 0x644d626ffd];

// 40-bit XOR via 32-bit halves: JS bitwise ops truncate to 32 bits, but the
// descriptor checksum state needs the full 40.
function xor40(a, b) {
  const aLo = a % 0x100000000;
  const aHi = Math.floor(a / 0x100000000);
  const bLo = b % 0x100000000;
  const bHi = Math.floor(b / 0x100000000);
  return (aHi ^ bHi) * 0x100000000 + ((aLo ^ bLo) >>> 0);
}

function descsumPolymod(symbols) {
  let chk = 1;
  for (const value of symbols) {
    const top = Math.floor(chk / 0x800000000); // chk >> 35 without 32-bit truncation
    chk = xor40((chk % 0x800000000) * 32 + value, 0);
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) chk = xor40(chk, DESC_GENERATOR[i]);
    }
  }
  return chk;
}

function descsumExpand(s) {
  const groups = [];
  const symbols = [];
  for (const c of s) {
    const v = INPUT_CHARSET.indexOf(c);
    if (v === -1) return null;
    symbols.push(v & 31);
    groups.push(v >> 5);
    if (groups.length === 3) {
      symbols.push(groups[0] * 9 + groups[1] * 3 + groups[2]);
      groups.length = 0;
    }
  }
  if (groups.length === 1) symbols.push(groups[0]);
  else if (groups.length === 2) symbols.push(groups[0] * 3 + groups[1]);
  return symbols;
}

function descsumCheck(s) {
  if (s.length < 9 || s[s.length - 9] !== '#') return false;
  const sum = s.slice(-8);
  for (const ch of sum) {
    if (!DESC_CHECKSUM_CHARSET.includes(ch)) return false;
  }
  const body = descsumExpand(s.slice(0, -9));
  if (!body) return false;
  const symbols = body.concat([...sum].map((ch) => DESC_CHECKSUM_CHARSET.indexOf(ch)));
  return descsumPolymod(symbols) === 1;
}

export function descsumCreate(s) {
  const body = descsumExpand(s);
  if (!body) throw new Error('Descriptor contains characters outside the BIP-380 set.');
  const checksum = xor40(descsumPolymod(body.concat([0, 0, 0, 0, 0, 0, 0, 0])), 1);
  let sum = '';
  for (let i = 0; i < 8; i++) {
    sum += DESC_CHECKSUM_CHARSET[Math.floor(checksum / 32 ** (7 - i)) % 32];
  }
  return `${s}#${sum}`;
}

// Private keys only count at key boundaries (after `(`, `,` or `]`):
// a base58 xpub can coincidentally contain those four letters inside.
const PRIVATE_XKEY_RE = /[(,\]][xyzt]prv/i;
const XPUB_MARKERS = ['xpub', 'tpub', 'ypub', 'zpub', 'Ypub', 'Zpub'];

function isPublicKeyExpr(k) {
  const t = k.trim().replace(/^\[[^\]]*\]/, '');
  const base = t.split('/')[0];
  if (XPUB_MARKERS.some((m) => base.startsWith(m))) return true;
  return /^[0-9a-fA-F]{66}$/.test(base) || /^[0-9a-fA-F]{130}$/.test(base);
}

// Parses wsh(sortedmulti(m, ...)) and sh(wsh(sortedmulti(m, ...))) with full
// BIP-380 checksum enforcement: a present-but-wrong checksum is rejected,
// as is any private extended key anywhere in the string.
export function parseBip380MultisigDescriptor(str) {
  const fail = (error) => ({
    valid: false, scriptType: null, threshold: null, totalKeys: null,
    checksumPresent: false, checksumValid: null, error
  });
  if (typeof str !== 'string') return fail('Not a string.');
  const s = str.trim();
  if (PRIVATE_XKEY_RE.test(s)) {
    return fail('Contains a private extended key — watch-only descriptors must never include xprv/tprv/yprv/zprv.');
  }
  if (s.length < 20 || s.length > 4000) return fail('Implausible descriptor length.');
  let body = s;
  let checksumPresent = false;
  let checksumValid = null;
  const hashAt = s.lastIndexOf('#');
  if (hashAt !== -1) {
    checksumPresent = true;
    if (hashAt !== s.length - 9) return { ...fail('Malformed checksum (want # + 8 chars).'), checksumPresent };
    if (!descsumCheck(s)) return { ...fail('Invalid BIP-380 checksum.'), checksumPresent, checksumValid: false };
    checksumValid = true;
    body = s.slice(0, -9);
  }
  let scriptType = null;
  let inner = null;
  const nested = body.match(/^sh\(wsh\(sortedmulti\((\d+),([^()]+)\)\)\)$/);
  const plain = body.match(/^wsh\(sortedmulti\((\d+),([^()]+)\)\)$/);
  const hit = nested || plain;
  if (!hit) return { ...fail('Not a wsh(sortedmulti(m, …)) or sh(wsh(sortedmulti(m, …))) descriptor.'), checksumPresent, checksumValid };
  scriptType = nested ? 'P2SH-P2WSH sortedmulti' : 'P2WSH sortedmulti';
  inner = hit[2];
  const threshold = Number(hit[1]);
  const keys = inner.split(',').map((k) => k.trim()).filter(Boolean);
  const totalKeys = keys.length;
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > totalKeys || totalKeys > 20) {
    return { ...fail(`Invalid quorum: need 1 <= m <= n <= 20, got ${threshold}-of-${totalKeys}.`), checksumPresent, checksumValid };
  }
  for (const k of keys) {
    if (!isPublicKeyExpr(k)) {
      return { ...fail(`Key is not a public key or extended public key: ${k.slice(0, 24)}…`), checksumPresent, checksumValid };
    }
  }
  return { valid: true, scriptType, threshold, totalKeys, checksumPresent, checksumValid, error: null };
}

export function isValidBip380MultisigDescriptor(str) {
  return parseBip380MultisigDescriptor(str).valid;
}
