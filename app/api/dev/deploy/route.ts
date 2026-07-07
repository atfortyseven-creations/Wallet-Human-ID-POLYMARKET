import { NextResponse } from 'next/server';
// removed node client imports
// Dynamic import only — @aztec/aztec.js does not export its root path in v4.3.1

export const dynamic = 'force-dynamic';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Calls the Sandbox PXE JSON-RPC directly so we can test connectivity. */
async function callPXE(pxeUrl: string, method: string, params: unknown[] = []) {
  const res = await fetch(pxeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`PXE HTTP error ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(`PXE error: ${JSON.stringify(json.error)}`);
  return json.result;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET() {
  const PXE_URL    = process.env.AZTEC_PXE_URL  || 'https://v5.testnet.rpc.aztec-labs.com';
  const NODE_URL   = process.env.AZTEC_NODE_URL || 'https://v5.testnet.rpc.aztec-labs.com';
  const SECRET_KEY = process.env.RELAYER_SECRET_KEY
    || '0x0b2cda0c07982cced5c5bbbc01dc76a5b2ef4e8111926bb4d8a14f15104d8e36';

  try {
    // 1. Ping the PXE to check it's alive ────────────────────────────────────
    let pxeInfo: any;
    try {
      pxeInfo = await callPXE(PXE_URL, 'pxe_getNodeInfo');
    } catch (e: any) {
      console.error(`❌ PXE unreachable at ${PXE_URL}:`, e.message);
      return NextResponse.json(
        { success: false, error: `Aztec Sandbox unreachable at ${PXE_URL}. Make sure Docker is running.` },
        { status: 503 }
      );
    }

    console.log(`✅ PXE connected. Sandbox version: ${pxeInfo?.nodeVersion ?? 'unknown'}`);

    // (Removed Node client connection as it causes infinite loops if devnet is down or missing env vars)

    // 3. Return success with sandbox status ───────────────────────────────────
    //    Full AccountManager.create() + TokenContract.deploy() requires a Wallet
    //    object that wraps the PXE; that integration is done in the frontend
    //    client-side using @aztec/aztec.js/account once the user connects.
    const result = {
      success: true,
      sandboxStatus: 'online',
      pxeUrl: PXE_URL,
      nodeVersion: pxeInfo?.nodeVersion ?? pxeInfo?.rollupVersion ?? 'sandbox',
      chainId: pxeInfo?.l1ChainId ?? 31337,
      message: 'Aztec Sandbox is running and ready for frontend wallet connection.',
    };

    console.log('🎉 Deploy check complete:', result);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error(`❌ Deploy Error:`, error.message);
    return NextResponse.json(
      { success: false, error: `Deploy Error: ${error.message}` },
      { status: 500 }
    );
  }
}
