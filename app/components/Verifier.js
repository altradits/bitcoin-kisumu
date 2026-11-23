'use client';

import { useState } from 'react';
import {
  isHex64,
  decodeBolt11Summary,
  parseBip380MultisigDescriptor
} from '../lib/bitcoinFormat';

const EXAMPLE_PREIMAGE = '00'.repeat(32);
const EXAMPLE_HASH = '66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925';

const EXAMPLE_DESCRIPTOR =
  'wsh(sortedmulti(2,xpub661MyMwAqRbcF3yVrV2KyYetLMYA5mCbv4BhrKwUrFE9LZM6JRR1AEt8Jq4V4C8LwtTke6YEEdCZqgXp85YRk2j74EfJKhe3QybQ9kcUjs4,xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8,xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB))#842ccm2w';

const EXAMPLE_INVOICE =
  'lnbc10u1rpyp9fzx9r9gf8frzrgyxzxyrrgrz8f9qzggypf8pxfrffr89pq9gzqf8yfyy9fzrq8gpxyqxzgxzqgffgxzgqrygz9ryzpp8qx8fgzpygqgx9przgzrqxxy8qfrgyyxqf99q9gzzrp8z9r9yqxzg8f9yr9qzfxqyzf9rqfxff98zz9pq9gzqf8yfyy9fzpxd0jv';

async function sha256Hex(hex) {
  const bytes = new Uint8Array(hex.match(/../g).map((b) => parseInt(b, 16)));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function Verdict({ state }) {
  if (!state) return null;
  if (state.kind === 'ok') return <div role="status" className="form-ok">{state.msg}</div>;
  if (state.kind === 'err') return <div role="status" className="form-err">{state.msg}</div>;
  return <div role="status" className="form-note">{state.msg}</div>;
}

export function PreimageTool() {
  const [hash, setHash] = useState('');
  const [preimage, setPreimage] = useState('');
  const [verdict, setVerdict] = useState(null);

  function loadExample() {
    setHash(EXAMPLE_HASH);
    setPreimage(EXAMPLE_PREIMAGE);
    setVerdict(null);
  }

  async function verify(e) {
    e.preventDefault();
    if (!isHex64(hash.trim()) || !isHex64(preimage.trim())) {
      setVerdict({ kind: 'err', msg: 'Both fields must be 64 hex characters.' });
      return;
    }
    setVerdict({ kind: 'sending', msg: 'Hashing…' });
    const digest = await sha256Hex(preimage.trim());
    if (digest === hash.trim().toLowerCase()) {
      setVerdict({ kind: 'ok', msg: 'Valid proof: SHA256(preimage) matches the payment hash. Settlement proven.' });
    } else {
      setVerdict({ kind: 'err', msg: 'Rejected: the preimage does not hash to this payment hash.' });
    }
  }

  return (
    <form className="stack" onSubmit={verify}>
      <label>Payment hash (64 hex)<input value={hash} onChange={(e) => setHash(e.target.value)} placeholder="Payment hash…" spellCheck={false} /></label>
      <label>Payment preimage (64 hex)<input value={preimage} onChange={(e) => setPreimage(e.target.value)} placeholder="Revealed preimage…" spellCheck={false} /></label>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" type="submit">Verify proof</button>
        <button className="btn btn-dark" type="button" onClick={loadExample}>Load example vector</button>
      </div>
      <Verdict state={verdict} />
    </form>
  );
}

export function DescriptorTool() {
  const [value, setValue] = useState('');
  const [verdict, setVerdict] = useState(null);

  function loadExample() {
    setValue(EXAMPLE_DESCRIPTOR);
    setVerdict(null);
  }

  function loadXprv() {
    setValue(EXAMPLE_DESCRIPTOR.replace(/xpub/g, 'xprv'));
    setVerdict(null);
  }

  function check(e) {
    e.preventDefault();
    const r = parseBip380MultisigDescriptor(value);
    if (!r.valid) {
      const stop = /private/i.test(r.error || '') ? 'STOP: ' : '';
      setVerdict({ kind: 'err', msg: `${stop}${r.error}` });
      return;
    }
    setVerdict({
      kind: 'ok',
      msg: `Valid: ${r.threshold}-of-${r.totalKeys} quorum • ${r.scriptType} • watch-only, no private keys • ${
        r.checksumPresent ? (r.checksumValid ? 'valid BIP-380 checksum' : 'INVALID CHECKSUM') : 'no checksum supplied'
      }.`
    });
  }

  return (
    <form className="stack" onSubmit={check}>
      <label>Output descriptor<textarea rows={4} value={value} onChange={(e) => setValue(e.target.value)} placeholder="wsh(sortedmulti(2,…))" spellCheck={false} /></label>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" type="submit">Check descriptor</button>
        <button className="btn btn-dark" type="button" onClick={loadExample}>Load valid 2-of-3 example</button>
        <button className="btn btn-dark" type="button" onClick={loadXprv}>Test xprv rejection</button>
      </div>
      <Verdict state={verdict} />
    </form>
  );
}

export function Bolt11Tool() {
  const [value, setValue] = useState('');
  const [verdict, setVerdict] = useState(null);

  function loadExample() {
    setValue(EXAMPLE_INVOICE);
    setVerdict(null);
  }

  function check(e) {
    e.preventDefault();
    const r = decodeBolt11Summary(value);
    if (!r.valid) {
      setVerdict({ kind: 'err', msg: r.error });
      return;
    }
    setVerdict({
      kind: 'ok',
      msg: `Valid invoice on ${r.network}. Amount: ${
        r.anyAmount ? 'any amount (0-value invoice)' : `${r.amountSats.toLocaleString('en-US')} sats`
      }. Bech32 checksum OK.`
    });
  }

  return (
    <form className="stack" onSubmit={check}>
      <label>Lightning invoice<textarea rows={4} value={value} onChange={(e) => setValue(e.target.value)} placeholder="lnbc…" spellCheck={false} /></label>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" type="submit">Inspect invoice</button>
        <button className="btn btn-dark" type="button" onClick={loadExample}>Load BOLT11 example</button>
      </div>
      <Verdict state={verdict} />
    </form>
  );
}
