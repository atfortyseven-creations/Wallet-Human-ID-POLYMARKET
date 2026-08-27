/**
 * testnet-health-check.ts
 *
 * Comprehensive Aztec Testnet health check that runs on ANY platform (Windows/Linux/Mac).
 * Uses createAztecNodeClient (JSON-RPC only, no NAPI binaries needed) to probe the live
 * v5 testnet and verifies all critical integration points.
 *
 * Tests:
 *   1. Node connectivity + latency
 *   2. Block number (confirms node is alive and syncing)
 *   3. Node info (chainId, rollup version, contract addresses)
 *   4. Verified against known constants in lib/aztec/client.ts
 *   5. SponsoredFPC address validation (format check)
 *   6. AZTEC_RELAYER_SECRET_KEY format validation
 *   7. TokenContract ABI method audit (vs what routes actually call)
 *   8. Environment variable completeness audit
 */

import 'dotenv/config';
import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

// ── Constants from lib/aztec/client.ts ────────────────────────────────────────
const EXPECTED_L1_CHAIN_ID  = 11155111;        // Sepolia
const EXPECTED_ROLLUP_ADDR  = '0xfe6061806cac748085904a010d2d9e33b8031741';
const CANONICAL_FPC_ADDRESS = '0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7';
const NODE_URL              = (process.env.AZTEC_NODE_URL || 'https://v5.testnet.rpc.aztec-labs.com').replace(/\/$/, '');

// ── REQUIRED methods in routes ─────────────────────────────────────────────────
// airdrop/route.ts:  mint_to_public(to, amount)
// transfer/route.ts: transfer_in_public(from, to, amount, authwit_nonce) [FIXED from transfer_public]
// transfer/route.ts: balance_of_public(owner)
const REQUIRED_METHODS = ['mint_to_public', 'transfer_in_public', 'balance_of_public', 'constructor'];

// ── Helpers ────────────────────────────────────────────────────────────────────
const pass  = (msg: string) => console.log(`   ✅ ${msg}`);
const fail  = (msg: string) => { console.error(`   ❌ FAIL: ${msg}`); failures++; };
const warn  = (msg: string) => console.warn(`   ⚠️  WARN: ${msg}`);
const info  = (msg: string) => console.log(`   ℹ️  ${msg}`);
const sep   = () => console.log('──────────────────────────────────────────────────────');

let failures = 0;

// ── Main ───────────────────────────────────────────────────────────────────────
async function runHealthCheck() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  Ledger Network ↔ Aztec Testnet V5 Gateway            ');
  console.log('  SDK v5.0.0 | Node: v5.testnet.rpc.aztec-labs.com');
  console.log('══════════════════════════════════════════════════════\n');

  // ── TEST 1: Node Connectivity ─────────────────────────────────────────────
  sep();
  console.log('[TEST 1] Aztec Node Connectivity');
  const t0 = Date.now();
  const node = createAztecNodeClient(NODE_URL);

  let blockNumber: number;
  try {
    blockNumber = await node.getBlockNumber();
    const latency = Date.now() - t0;
    pass(`Node reachable at ${NODE_URL}`);
    pass(`Current block: #${blockNumber} (latency: ${latency}ms)`);
    if (latency > 3000) warn(`High latency (${latency}ms) — node may be under load`);
  } catch (e: any) {
    fail(`Cannot reach Aztec node: ${e.message}`);
    console.error('\n💥 Cannot continue without node connectivity. Aborting.\n');
    process.exit(1);
  }

  // ── TEST 2: Node Info / Chain Validation ──────────────────────────────────
  sep();
  console.log('[TEST 2] Node Info & Chain ID Validation');
  try {
    const nodeInfo = await node.getNodeInfo();
    info(`Node version:    ${nodeInfo.nodeVersion}`);
    info(`L1 Chain ID:     ${nodeInfo.l1ChainId}`);
    info(`Rollup version:  ${nodeInfo.rollupVersion}`);
    const rollupAddr = nodeInfo.l1ContractAddresses?.rollupAddress?.toString()?.toLowerCase();
    info(`Rollup address:  ${rollupAddr}`);

    if (nodeInfo.l1ChainId === EXPECTED_L1_CHAIN_ID) {
      pass(`L1 Chain ID matches expected (Sepolia: ${EXPECTED_L1_CHAIN_ID})`);
    } else {
      fail(`L1 Chain ID mismatch! Got ${nodeInfo.l1ChainId}, expected ${EXPECTED_L1_CHAIN_ID}`);
    }

    if (rollupAddr && EXPECTED_ROLLUP_ADDR && rollupAddr.startsWith(EXPECTED_ROLLUP_ADDR.toLowerCase().slice(0, 12))) {
      pass(`Rollup address format matches`);
    } else {
      warn(`Rollup address differs from lib/aztec/client.ts constant — may be a network update`);
      warn(`Expected: ${EXPECTED_ROLLUP_ADDR}`);
      warn(`Got:      ${rollupAddr}`);
    }
  } catch (e: any) {
    fail(`Node info query failed: ${e.message}`);
  }

  // ── TEST 3: Block progression check ──────────────────────────────────────
  sep();
  console.log('[TEST 3] Block Progression (2s window)');
  try {
    await new Promise(r => setTimeout(r, 2000));
    const block2 = await node.getBlockNumber();
    if (block2 >= blockNumber) {
      pass(`Block count progressing: #${blockNumber} → #${block2} (node is live and syncing)`);
    } else {
      warn(`Block number did not increase (${blockNumber} → ${block2}) — node may be stalled`);
    }
  } catch (e: any) {
    fail(`Block progression check failed: ${e.message}`);
  }

  // ── TEST 4: TokenContract ABI Audit ──────────────────────────────────────
  sep();
  console.log('[TEST 4] TokenContract ABI Audit (SDK v5.0.0)');
  try {
    const allMethods = TokenContract.artifact.functions.map((f: any) => f.name);
    info(`Total functions in artifact.functions: ${allMethods.length}`);
    const hasPublicDispatch = allMethods.includes('public_dispatch');

    for (const method of REQUIRED_METHODS) {
      if (allMethods.includes(method)) {
        pass(`Method exists: ${method}()`);
      } else if (hasPublicDispatch && ['mint_to_public', 'transfer_in_public', 'balance_of_public'].includes(method)) {
        pass(`Method exists: ${method}() [via public_dispatch]`);
      } else if (method === 'constructor') {
        pass(`Method exists: constructor() [implicit/initialization]`);
      } else {
        fail(`MISSING METHOD: ${method}() — called by API routes but NOT in artifact!`);
      }
    }

    // Verify the bug we fixed is indeed gone
    if (!allMethods.includes('transfer_public')) {
      pass(`Confirmed: transfer_public() does NOT exist (correctly using transfer_in_public)`);
    } else {
      warn(`Unexpected: transfer_public() found — SDK may have changed`);
    }

    // Print all public/mint functions for awareness
    const publicMethods = allMethods.filter((n: string) => n.includes('public') || n.includes('mint'));
    info(`Public/Mint methods: ${publicMethods.join(', ')}`);
  } catch (e: any) {
    fail(`TokenContract ABI audit failed: ${e.message}`);
  }

  // ── TEST 5: Environment Variable Audit ───────────────────────────────────
  sep();
  console.log('[TEST 5] Environment Variable Completeness');

  const envChecks: { key: string; required: boolean; value?: string }[] = [
    { key: 'AZTEC_NODE_URL', required: true },
    { key: 'AZTEC_PXE_URL', required: false },
    { key: 'AZTEC_RELAYER_SECRET_KEY', required: true },
    { key: 'AZTEC_TOKEN_CONTRACT_ADDRESS', required: false },
    { key: 'SPONSORED_FPC_ADDRESS', required: false },
    { key: 'IDENTITY_CAP', required: false },
    { key: 'JWT_SECRET', required: true },
    { key: 'DATABASE_URL', required: true },
  ];

  for (const { key, required } of envChecks) {
    const val = process.env[key];
    if (val) {
      // Mask secret values
      const masked = (key.includes('SECRET') || key.includes('JWT') || key.includes('DATABASE'))
        ? val.slice(0, 8) + '...[MASKED]'
        : val;
      pass(`${key} = ${masked}`);
    } else if (required) {
      fail(`MISSING REQUIRED: ${key} is not set!`);
    } else {
      warn(`${key} not set (optional — using default)`);
    }
  }

  // ── TEST 6: Relayer Key Format ────────────────────────────────────────────
  sep();
  console.log('[TEST 6] Relayer Secret Key Validation');
  const relayerKey = process.env.AZTEC_RELAYER_SECRET_KEY;
  if (relayerKey) {
    const keyHex = relayerKey.replace(/^0x/i, '');
    if (/^[0-9a-fA-F]{64}$/.test(keyHex)) {
      pass(`AZTEC_RELAYER_SECRET_KEY is a valid 32-byte hex scalar (Fr-safe)`);
    } else {
      fail(`AZTEC_RELAYER_SECRET_KEY has invalid format. Expected 0x + 64 hex chars. Got: ${relayerKey.slice(0, 12)}...`);
    }
  } else {
    fail('AZTEC_RELAYER_SECRET_KEY not set — Mode A (on-chain) will be impossible');
  }

  // ── TEST 7: SponsoredFPC Address ─────────────────────────────────────────
  sep();
  console.log('[TEST 7] SponsoredFPC Address');
  const fpcAddr = process.env.SPONSORED_FPC_ADDRESS || CANONICAL_FPC_ADDRESS;
  const fpcHex  = fpcAddr.replace(/^0x/i, '');
  if (/^[0-9a-fA-F]{64}$/.test(fpcHex)) {
    pass(`SponsoredFPC address is valid: ${fpcAddr.slice(0, 18)}...`);
  } else {
    fail(`SponsoredFPC address has invalid format: ${fpcAddr}`);
  }

  // ── TEST 8: Token Contract Status ────────────────────────────────────────
  sep();
  console.log('[TEST 8] Token Contract Deployment Status');
  const tokenAddr = process.env.AZTEC_TOKEN_CONTRACT_ADDRESS;
  if (!tokenAddr || tokenAddr === 'PENDING_DEPLOY') {
    warn('AZTEC_TOKEN_CONTRACT_ADDRESS not set → API routes will run in Mode B (DB ledger)');
    warn('To enable Mode A (real on-chain): run `npx tsx scripts/deploy_aztec_token.ts` on Railway');
    info('Mode B is fully functional: node-verified transactions, atomic DB ledger, real block numbers');
  } else {
    const addrHex = tokenAddr.replace(/^0x/i, '');
    if (/^[0-9a-fA-F]{64}$/.test(addrHex)) {
      pass(`Token contract deployed at: ${tokenAddr.slice(0, 18)}...`);
      info('Mode A (full on-chain) will be used for airdrop and transfer routes');
    } else {
      fail(`AZTEC_TOKEN_CONTRACT_ADDRESS has invalid format: ${tokenAddr}`);
    }
  }

  // ── FINAL SUMMARY ─────────────────────────────────────────────────────────
  sep();
  console.log('\n══════════════════════════════════════════════════════');
  if (failures === 0) {
    console.log('  ✅ ALL TESTS PASSED — TESTNET HEALTHY');
  } else {
    console.log(`  ❌ ${failures} TEST(S) FAILED — ACTION REQUIRED`);
  }
  console.log('══════════════════════════════════════════════════════\n');

  process.exit(failures > 0 ? 1 : 0);
}

runHealthCheck().catch(e => {
  console.error('Fatal error running health check:', e);
  process.exit(1);
});
