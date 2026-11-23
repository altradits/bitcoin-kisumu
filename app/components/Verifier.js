'use client';

import { useState } from 'react';
import { isHex64, isValidBolt11, isValidBip380MultisigDescriptor } from '../lib/bitcoinFormat';

const EXAMPLE_PREIMAGE = '00'.repeat(32);
const EXAMPLE_HASH = '66687aadf862bd776c8fc18b8e9f8e20089714856ee233b3902a591d0d5f2925';

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

  function check(e) {
    e.preventDefault();
    const s = value.trim();
    if (/[xyzt]prv/i.test(s)) {
      setVerdict({ kind: 'err', msg: 'STOP: this contains a PRIVATE extended key. Never paste private keys anywhere — this tool only accepts watch-only descriptors.' });
      return;
    }
    if (isValidBip380MultisigDescriptor(s)) {
      setVerdict({ kind: 'ok', msg: 'Valid watch-only descriptor: wsh(sortedmulti(…)) shape confirmed, no private keys present.' });
    } else {
      setVerdict({ kind: 'err', msg: 'Not a recognized wsh(sortedmulti(m, …)) or sh(wsh(…)) descriptor.' });
    }
  }

  return (
    <form className="stack" onSubmit={check}>
      <label>Output descriptor<textarea rows={4} value={value} onChange={(e) => setValue(e.target.value)} placeholder="wsh(sortedmulti(2,…))" spellCheck={false} /></label>
      <div><button className="btn btn-primary" type="submit">Check descriptor</button></div>
      <Verdict state={verdict} />
    </form>
  );
}

export function Bolt11Tool() {
  const [value, setValue] = useState('');
  const [verdict, setVerdict] = useState(null);

  function check(e) {
    e.preventDefault();
    const s = value.trim().toLowerCase();
    if (!isValidBolt11(s)) {
      setVerdict({ kind: 'err', msg: 'Not a valid BOLT11 shape: need an lnbc/lntb/lnbcrt prefix and bech32 payload.' });
      return;
    }
    const net = s.startsWith('lnbcrt') ? 'regtest' : s.startsWith('lnbc') ? 'Bitcoin mainnet' : 'testnet';
    setVerdict({ kind: 'ok', msg: `Valid BOLT11 shape on ${net}. Note: shape only — this tool does not check the signature.` });
  }

  return (
    <form className="stack" onSubmit={check}>
      <label>Lightning invoice<textarea rows={4} value={value} onChange={(e) => setValue(e.target.value)} placeholder="lnbc…" spellCheck={false} /></label>
      <div><button className="btn btn-primary" type="submit">Inspect invoice</button></div>
      <Verdict state={verdict} />
    </form>
  );
}
