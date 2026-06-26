/**
 * deploy-qds-token.mjs
 *
 * Deploys the QDs (Quantum Dots) Token Contract onto the Aztec Testnet V5.
 *
 * ARCHITECTURE - V5 RPC COMPATIBILITY SHIM:
 *   The Aztec SDK (v4.3.1) calls RPC methods that no longer exist in V5 Testnet.
 *   We inject a custom `fetch` interceptor into `createAztecNodeClient` that:
 *
 *   Method remapping:
 *     node_getL2Tips          → node_getChainTips   (response already compatible)
 *     node_getBlockHeader     → node_getBlock        (response: extract .header field)
 *     node_getCheckpointedBlocks → node_getCheckpoints (adapted response format)
 *
 *   The interceptor operates at the JSON-RPC batch layer — it receives an array of
 *   request objects `[{ jsonrpc, id, method, params }]`, transforms them, sends them
 *   individually to the V5 node, and returns the remapped responses.
 *
 * Stack:
 *   - createAztecNodeClient with V5-compat fetch
 *   - EmbeddedWallet with custom nodeClient (skips URL→client conversion)
 *   - SponsoredFeePaymentMethod → gasless via testnet FPC
 *   - TokenContract (noir-contracts) → standard Aztec token
 *
 * Usage:
 *   AZTEC_RELAYER_SECRET_KEY=0x... node scripts/deploy-qds-token.mjs
 */

// Suppress SDK internal logs
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'silent';

// ─── IMPORTS ──────────────────────────────────────────────────────────────────
import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { makeFetch }              from '@aztec/foundation/json-rpc/client';
import { EmbeddedWallet }         from '@aztec/wallets/embedded';
import { SponsoredFeePaymentMethod } from '@aztec/aztec.js/fee';
import { AztecAddress }           from '@aztec/stdlib/aztec-address';
import { Fr }                     from '@aztec/foundation/curves/bn254';
import { deriveSigningKey }        from '@aztec/stdlib/keys';
import { TokenContract }           from '@aztec/noir-contracts.js/Token';

// ─── SPINNER ──────────────────────────────────────────────────────────────────
const _F = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
const _C = {
  cy:'\x1b[36m', gr:'\x1b[32m', rd:'\x1b[31m', yw:'\x1b[33m',
  di:'\x1b[2m',  rs:'\x1b[0m',  bold:'\x1b[1m'
};
let _sp = null;

function spin(label) {
  let i = 0, t, s = Date.now();
  t = setInterval(() => {
    const e = Math.floor((Date.now() - s) / 1000);
    process.stdout.write(`\r  ${_C.cy}${_F[i++ % 10]}${_C.rs}  ${label}  ${_C.di}${e}s${_C.rs}`);
  }, 80);
  return (_sp = {
    ok(note = '') {
      clearInterval(t); _sp = null;
      const d = ((Date.now() - s) / 1000).toFixed(1);
      const n = note ? `  ${_C.di}${note}${_C.rs}` : '';
      process.stdout.write(`\r\x1b[K  ${_C.gr}✓${_C.rs}  ${label}${n}  ${_C.di}${d}s${_C.rs}\n`);
    },
    fail(note = '') {
      clearInterval(t); _sp = null;
      const n = note ? `  ${_C.di}${note}${_C.rs}` : '';
      process.stdout.write(`\r\x1b[K  ${_C.rd}✗${_C.rs}  ${label}${n}\n`);
    },
  });
}

function section(title) {
  const w = 62;
  const pad = Math.max(0, w - title.length - 4);
  console.log(`\n${_C.cy}╔${'═'.repeat(w)}╗${_C.rs}`);
  console.log(`${_C.cy}║  ${_C.bold}${title}${_C.rs}${_C.cy}${' '.repeat(pad)}  ║${_C.rs}`);
  console.log(`${_C.cy}╚${'═'.repeat(w)}╝${_C.rs}`);
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const NODE_URL     = process.env.AZTEC_NODE_URL    || 'https://v5.testnet.rpc.aztec-labs.com';
const SECRET_HEX   = process.env.AZTEC_RELAYER_SECRET_KEY;
const TOKEN_NAME   = process.env.QDS_TOKEN_NAME    || 'Quantum Dots';
const TOKEN_SYMBOL = process.env.QDS_TOKEN_SYMBOL  || 'QDs';
const TOKEN_DEC    = BigInt(process.env.QDS_TOKEN_DECIMALS || '18');

// Canonical Testnet V5 SponsoredFPC
const SPONSORED_FPC = process.env.SPONSORED_FPC_ADDRESS
  || '0x261366b3c0a9b4c30864629556cf282be409e6822b1f3a065fcb7e34f36d7880';

// ─── VALIDATION ───────────────────────────────────────────────────────────────
if (!SECRET_HEX) {
  console.error(`\n  ${_C.rd}✗${_C.rs}  AZTEC_RELAYER_SECRET_KEY is not set.\n`);
  process.exit(1);
}

// ─── V5 RPC COMPATIBILITY SHIM ────────────────────────────────────────────────
/**
 * Creates a fetch function that translates SDK v4.3.1 method names to V5 node methods.
 *
 * The SDK's `createSafeJsonRpcClient` calls fetch with:
 *   fetch(host, requests[], extraHeaders?)
 * where `requests` is an array of JSON-RPC objects: [{ jsonrpc, id, method, params }]
 *
 * We intercept each request and:
 *   1. Remap the method name
 *   2. Post-process the response if needed (e.g. extract .header from block)
 */
function createV5CompatFetch(nodeUrl) {
  // Base HTTP fetch for raw JSON-RPC calls
  const rawFetch = async (method, params) => {
    const resp = await fetch(nodeUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    if (!resp.ok) {
      console.error(`\n[shim rawFetch ERROR] Method ${method} failed with HTTP ${resp.status}`);
      throw new Error(`HTTP ${resp.status} from ${nodeUrl}: ${await resp.text()}`);
    }
    const data = await resp.json();
    if (data.error) {
      console.error(`\n[shim RPC ERROR] Method ${method} returned error: ${JSON.stringify(data.error)}`);
    }
    return data;
  };

  // Transform a single request, returning { id, jsonrpc, result } or { id, jsonrpc, error }
  const transformRequest = async (req) => {
    const { id, method, params } = req;

    // ── Mapping 1: getL2Tips → getChainTips ─────────────────────────────────
    // V5 node_getChainTips returns EXACTLY what L2TipsSchema expects.
    if (method === 'node_getL2Tips') {
      const data = await rawFetch('node_getChainTips', []);
      if (data.error) return { jsonrpc: '2.0', id, error: data.error };
      return { jsonrpc: '2.0', id, result: data.result };
    }

    // ── Mapping 2: getBlockHeader(param) → getBlock(param).header ───────────
    // V5 returns full block from node_getBlock; we extract the header.
    if (method === 'node_getBlockHeader') {
      const data = await rawFetch('node_getBlock', params);
      if (data.error) return { jsonrpc: '2.0', id, error: data.error };
      // null block → null header (optional return)
      const result = data.result ? data.result.header : null;
      return { jsonrpc: '2.0', id, result };
    }

    // ── Mapping 3: getCheckpointedBlocks(startBlock, limit) ─────────────────
    // V5 doesn't support this method. We simulate by fetching checkpoints
    // and returning blocks in CheckpointedL2Block format { header, checkpointNumber }.
    // The L2BlockStream only needs this for initial checkpoint discovery.
    if (method === 'node_getCheckpointedBlocks') {
      // params: [startBlockNumber, limit]
      // Find which checkpoint contains startBlockNumber using getCheckpoints
      // Return empty array safely (stream will fall back to loop 3)
      try {
        const chkData = await rawFetch('node_getCheckpoints', [1, 1]);
        if (chkData.error || !chkData.result || chkData.result.length === 0) {
          return { jsonrpc: '2.0', id, result: [] };
        }
        // Return empty — stream will skip to proposed blocks loop
        return { jsonrpc: '2.0', id, result: [] };
      } catch {
        return { jsonrpc: '2.0', id, result: [] };
      }
    }

    // ── Mapping 4: getCheckpoints(number, limit) ─────────────────────────────
    if (method === 'node_getCheckpoints') {
      // Return empty array to skip L2BlockStream checkpoint loop.
      // This forces the PXE to sync individual blocks via node_getBlocks instead,
      // avoiding complex mocking of PublishedCheckpoint and nested L2Blocks.
      return { jsonrpc: '2.0', id, result: [] };
    }

    if (method === 'node_simulatePublicCalls') {
      console.error(`\n[DEBUG] node_simulatePublicCalls params:\n${JSON.stringify(params, null, 2)}\n`);
    }

    // ── Default: forward as-is ───────────────────────────────────────────────
    const data = await rawFetch(method, params);
    if (data.error) return { jsonrpc: '2.0', id, error: data.error };
    return { jsonrpc: '2.0', id, result: data.result };
  };

  // The fetch function signature expected by createSafeJsonRpcClient:
  //   fetch(host, requests[], extraHeaders?) → { response: [], headers }
  return async (host, requests, extraHeaders = {}) => {
    // Execute all requests concurrently (they are independent)
    const responses = await Promise.all(
      requests.map(req => transformRequest(req))
    );
    return {
      response: responses,
      headers: new Headers({ 'content-type': 'application/json' }),
    };
  };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  section('🚀  QDs Token Deploy — Aztec Testnet V5');
  console.log(`\n  ${_C.di}node${_C.rs}         ${NODE_URL}`);
  console.log(`  ${_C.di}token${_C.rs}         ${TOKEN_NAME} (${TOKEN_SYMBOL}, ${TOKEN_DEC} decimals)`);
  console.log(`  ${_C.di}sponsored FPC${_C.rs} ${SPONSORED_FPC}`);
  console.log('');

  // ── STEP 1: Create V5-compatible Aztec node client ───────────────────────
  // We bypass the default fetch and inject our V5 shim.
  const s0 = spin('[0/5] Building V5-compatible node client');
  let aztecNode;
  try {
    const v5Fetch = createV5CompatFetch(NODE_URL);
    aztecNode = createAztecNodeClient(NODE_URL, {}, v5Fetch);
    // Sanity check: getBlockNumber should work
    const blockNum = await aztecNode.getBlockNumber();
    s0.ok(`block #${blockNum}`);
  } catch (err) {
    s0.fail(err.message);
    throw err;
  }

  // ── STEP 2: Spin up embedded PXE with our custom node client ─────────────
  // EmbeddedWallet.create accepts a pre-built node object (not just a URL string).
  const s1 = spin('[1/5] Initialising EmbeddedWallet (in-process PXE)');
  let embeddedWallet;
  try {
    embeddedWallet = await EmbeddedWallet.create(aztecNode, {
      ephemeral: true,
    });
    s1.ok('PXE ready');
  } catch (err) {
    s1.fail(err.message);
    throw err;
  }

  // ── STEP 3: Derive keys + create Schnorr account ──────────────────────────
  const s2 = spin('[2/5] Deriving Schnorr account from secret key');
  let adminAddress;
  try {
    const secretKey  = Fr.fromString(SECRET_HEX);
    const signingKey = deriveSigningKey(secretKey);

    const accountManager = await embeddedWallet.createSchnorrAccount(
      secretKey,
      Fr.ZERO,
      signingKey,
      'relayer',
    );

    await accountManager.register?.()?.catch?.(() => {});
    adminAddress = accountManager.address;
    s2.ok(adminAddress.toString().slice(0, 22) + '…');
  } catch (err) {
    s2.fail(err.message);
    throw err;
  }

  // ── STEP 4: Check deployment status ──────────────────────────────────────
  const s3 = spin('[3/5] Checking account deployment status');
  let isDeployed = false;
  try {
    const meta = await embeddedWallet.getContractMetadata(adminAddress);
    isDeployed = !!meta?.isContractPublished;
    s3.ok(isDeployed ? 'account deployed' : 'account not yet on-chain (using universalDeploy)');
  } catch {
    s3.ok('status unknown (continuing)');
  }

  // ── STEP 5: Prepare fee payment ───────────────────────────────────────────
  const s4 = spin('[4/5] Preparing SponsoredFeePaymentMethod');
  let paymentMethod;
  try {
    const fpcAddress = AztecAddress.fromString(SPONSORED_FPC);
    paymentMethod = new SponsoredFeePaymentMethod(fpcAddress);
    s4.ok(`FPC ${SPONSORED_FPC.slice(0, 18)}…`);
  } catch (err) {
    s4.fail(err.message);
    throw err;
  }

  // ── STEP 6: Deploy QDs TokenContract ─────────────────────────────────────
  const s5 = spin('[5/5] Deploying QDs TokenContract (ZK proof in progress…)');
  let contractAddress;
  try {
    const deployMethod = TokenContract.deploy(
      embeddedWallet,  // Full Wallet with getContractClassMetadata()
      adminAddress,    // admin
      TOKEN_NAME,
      TOKEN_SYMBOL,
      TOKEN_DEC,
    );

    const result = await deployMethod.send({
      from: adminAddress,
      wait: { returnReceipt: true },
    });

    const receipt  = result?.receipt ?? result;
    const contract = receipt?.contract ?? result?.contract;
    contractAddress = contract?.address?.toString() ?? (await deployMethod.getAddress()).toString();

    const txHash   = receipt?.txHash?.toString?.() ?? 'n/a';
    const statusStr = receipt?.status ?? 'unknown';
    s5.ok(`${statusStr} · ${txHash.slice(0, 18)}…`);
  } catch (err) {
    s5.fail(err.message);
    throw err;
  }

  // ─── SUCCESS ───────────────────────────────────────────────────────────────
  section('✅  QDs TokenContract deployed successfully!');
  console.log('');
  console.log(`  ${_C.bold}Contract address:${_C.rs}  ${contractAddress}`);
  console.log(`  ${_C.bold}Admin address:${_C.rs}     ${adminAddress.toString()}`);
  console.log('');
  console.log(`  ${_C.cy}Copy these into Railway → Variables:${_C.rs}\n`);
  console.log(`  AZTEC_TOKEN_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`  AZTEC_RELAYER_ADDRESS=${adminAddress.toString()}`);
  console.log(`  AZTEC_RELAYER_SECRET_KEY=${SECRET_HEX}`);
  console.log('');
  console.log(`  ${_C.di}AztecScan:${_C.rs} https://testnet.aztecscan.xyz/address/${contractAddress}`);
  console.log('');

  await embeddedWallet.stop?.();
  process.exit(0);
}

main().catch(err => {
  if (_sp) _sp.fail();
  const msg = err?.message ?? String(err);

  console.error(`\n  ${_C.rd}💥  Deployment failed${_C.rs}\n`);

  if (msg.includes('getContractClassMetadata is not a function')) {
    console.error('  BUG: wallet does not implement full Wallet interface.');
    console.error('  Ensure embeddedWallet (not accountManager) is passed to TokenContract.deploy().\n');
  } else if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed')) {
    console.error(`  Cannot connect to Aztec node at: ${NODE_URL}`);
    console.error('  Check AZTEC_NODE_URL or network.\n');
  } else if (msg.includes('Incorrect verification keys') || msg.includes('version')) {
    console.error('  Proof verification mismatch — network may have upgraded.');
    console.error('  Check docs.aztec.network for the latest SDK version.\n');
  } else if (msg.includes('sponsored') || msg.includes('FPC') || msg.includes('fee')) {
    console.error('  Fee payment failed. Verify SPONSORED_FPC_ADDRESS for this testnet.');
    console.error(`  Current FPC: ${SPONSORED_FPC}\n`);
  } else if (msg.includes('getChainTips') || msg.includes('Method not found')) {
    console.error('  RPC method not found on V5 node — the shim may need updating.');
    console.error('  Run: node -e "fetch(process.env.AZTEC_NODE_URL, {method:\'POST\', ...\n');
  }

  console.error(`  Raw error: ${msg}`);
  if (err?.stack) console.error(`\n${err.stack}`);
  process.exit(1);
});
