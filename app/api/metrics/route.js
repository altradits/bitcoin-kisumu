import { NextResponse } from 'next/server';
import { getPilotMetrics } from '@/app/lib/pilotMetrics';

// Machine-readable public audit API. Aggregates only — getPilotMetrics can
// only return counts, so PII leakage is structurally impossible here.
export async function GET() {
  const metrics = await getPilotMetrics();
  return NextResponse.json(
    {
      community: 'Bitcoin Kisumu',
      repo: 'https://github.com/bitcoinkisumu/bitcoin-kisumu',
      license: 'MIT',
      nonCustodial: true,
      specVersion: '1.0',
      metrics
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60'
      }
    }
  );
}
