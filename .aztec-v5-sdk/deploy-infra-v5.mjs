/**
 * deploy-infra-v5.mjs
 *
 * Deploys Whale Network infrastructure contracts to Aztec Testnet V5.
 * Uses SDK v5.0.0-nightly.20260714 from the isolated .aztec-v5-sdk directory.
 *
 * Contracts deployed:
 *   1. QDs TokenContract (from @aztec/noir-contracts.js/Token)
 *
 * API used (verified against SDK type declarations):
 *   - EmbeddedWallet.create(nodeUrl, { ephemeral: true })  → NodeEmbeddedWallet
 *   - wallet.createSchnorrAccount(secret: Fr, salt: Fr, signingKey: Fq) → AccountManager
 *   - accountManager.address  → AztecAddress (sync getter)
 *   - TokenContract.deploy(wallet, admin, name, symbol, decimals).send({ fee }).wait()
 *   - SponsoredFeePaymentMethod(paymentContract: AztecAddress)  ← 1 arg in v5
 *
 * SECURITY: Secret key loaded exclusively from environment variable.
 */

import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Fr, Fq } from '@aztec/foundation/curves/bn254';
import { AztecAddress } from '@aztec/stdlib/aztec-address';
import { TokenContract } from '@aztec/noir-contracts.js/Token';
import { SponsoredFeePaymentMethod } from '@aztec/aztec.js/fee';

// ── Constants ──────────────────────────────────────────────────────────────

const NODE_URL = 'https://v5.testnet.rpc.aztec-labs.com/';

// Canonical Sponsored FPC address on Aztec Testnet V5 (rc.2 / nightly.20260714)
// Source: docs.aztec.network/networks — confirmed by @joshc [AZTC] 2026-07-07
const SPONSORED_FPC = '0x0628377e98bca5913dc86765ad0758f7b7aa83eac49079c6fba125807b393fe1';

const TOKEN_NAME    = 'Quantum Dots';
const TOKEN_SYMBOL  = 'QDs';
const TOKEN_DECIMALS = 18n;

// ── Formatting helpers ─────────────────────────────────────────────────────

const dim    = s => `\x1b[2m${s}\x1b[0m`;
const bold   = s => `\x1b[1m${s}\x1b[0m`;
const ok     = s => `\x1b[32m✓\x1b[0m  ${s}`;
const fail   = s => `\x1b[31m✗\x1b[0m  ${s}`;
const info   = s => `  ${dim('►')} ${s}`;

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  // ── 0. Validate secret key ─────────────────────────────────────────────
  const SECRET_HEX = process.env.AZTEC_RELAYER_SECRET_KEY?.trim();
  if (!SECRET_HEX) {
    console.error(fail('AZTEC_RELAYER_SECRET_KEY is not set in the environment.'));
    console.error(info('Run: export AZTEC_RELAYER_SECRET_KEY=0x<your-32-byte-hex-fr>'));
    process.exit(1);
  }
  if (!/^(0x)?[0-9a-fA-F]{1,64}$/.test(SECRET_HEX)) {
    console.error(fail('AZTEC_RELAYER_SECRET_KEY format is invalid. Expected 0x-prefixed hex string.'));
    process.exit(1);
  }

  const t0 = Date.now();

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   WHALE NETWORK — Aztec Testnet V5 Contract Deployment       ║');
  console.log('║   SDK: 5.0.0-nightly.20260714  |  Pure ESM, no esbuild       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(info(`Node URL : ${NODE_URL}`));
  console.log(info(`Token    : ${TOKEN_NAME} (${TOKEN_SYMBOL}, ${TOKEN_DECIMALS} decimals)`));
  console.log(info(`FPC      : ${SPONSORED_FPC.slice(0, 20)}...`));
  console.log(info(`Key      : ${SECRET_HEX.slice(0, 10)}... (masked)`));
  console.log('');

  // ── 1. Verify node connectivity ────────────────────────────────────────
  process.stdout.write('  [1/5] Testing Aztec node connectivity... ');
  const node = createAztecNodeClient(NODE_URL);
  const blockNum = await node.getBlockNumber();
  console.log(ok(`Block #${blockNum}`));

  // ── 2. Initialize EmbeddedWallet (boots local PXE, connects to node) ──
  process.stdout.write('  [2/5] Initializing EmbeddedWallet (local PXE)... ');
  const wallet = await EmbeddedWallet.create(NODE_URL, { ephemeral: true });
  console.log(ok('PXE ready'));

  // ── 3. Derive Schnorr account from secret key ──────────────────────────
  // Fr = BN254 scalar field (secret key)
  // Fq = Grumpkin base field (signing/nullifier key) — required by createSchnorrAccount
  process.stdout.write('  [3/5] Deriving Schnorr account from secret key... ');

  const secretKey  = Fr.fromHexString(SECRET_HEX.replace(/^0x/i, ''));
  const signingKey = Fq.fromBuffer(secretKey.toBuffer()); // deterministic Fq from same secret
  const salt       = Fr.ZERO; // deterministic address (same key → same address always)

  const accountManager = await wallet.createSchnorrAccount(secretKey, salt, signingKey);
  const adminAddr      = accountManager.address; // sync AztecAddress getter

  console.log(ok(`Address: ${adminAddr.toString().slice(0, 22)}...`));

  // ── 4. Prepare Sponsored FPC payment ──────────────────────────────────
  process.stdout.write('  [4/5] Preparing Sponsored FPC fee payment... ');
  // In SDK v5, AztecAddress.fromString was removed.
  // fromStringUnsafe is correct here — SPONSORED_FPC is a canonical testnet address.
  const fpcAddress    = AztecAddress.fromStringUnsafe(SPONSORED_FPC);
  const paymentMethod = new SponsoredFeePaymentMethod(fpcAddress); // 1 arg in v5
  console.log(ok('Payment method ready'));

  // ── 5. Deploy QDs TokenContract ────────────────────────────────────────
  // Register the artifact for the FPC so the PXE can simulate the transaction.
  const { FPCContractArtifact } = await import('@aztec/noir-contracts.js/FPC');
  const { SponsoredFPCContractArtifact } = await import('@aztec/noir-contracts.js/SponsoredFPC');
  await wallet.registerContractClass(SponsoredFPCContractArtifact).catch(() => {});
  await wallet.registerContractClass(FPCContractArtifact).catch(() => {});

  console.log('  [5/5] Deploying QDs TokenContract...');
  console.log(info('Generating ZK proof and submitting (60–300s expected)'));
  console.log('');

  // In SDK v5, .send() returns Promise<DeployResultMined<TContract>> directly.
  // There is no SentTx or .wait() required for deploys.
  const deployResult = await TokenContract
    .deploy(wallet, adminAddr, TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS)
    .send({
      universalDeploy: true,
      from: adminAddr,
      fee: { paymentMethod },
    });

  // ── Result ─────────────────────────────────────────────────────────────
  const contractAddr = deployResult.contract.address.toString();
  const txHash       = deployResult.txHash?.toString() ?? 'n/a';
  const elapsed      = ((Date.now() - t0) / 1000).toFixed(1);

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║   ✅  DEPLOYMENT SUCCESSFUL — Aztec Testnet V5               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`  ${bold('AZTEC_TOKEN_CONTRACT_ADDRESS')}=${contractAddr}`);
  console.log(`  ${bold('AZTEC_RELAYER_ADDRESS')}=${adminAddr.toString()}`);
  console.log(`  ${bold('TX_HASH')}=${txHash}`);
  console.log('');
  console.log(info(`AztecScan : https://testnet.aztecscan.xyz/address/${contractAddr}`));
  console.log(info(`TX        : https://testnet.aztecscan.xyz/tx/${txHash}`));
  console.log(info(`Elapsed   : ${elapsed}s`));
  console.log('');
  console.log('  👉 Copy AZTEC_TOKEN_CONTRACT_ADDRESS and AZTEC_RELAYER_ADDRESS to Railway Variables');
  console.log('');

  await wallet.stop();
  process.exit(0);
}

main().catch(async err => {
  console.error('');
  console.error(`\x1b[31m❌  Deployment FAILED: ${err?.message ?? err}\x1b[0m`);
  if (err?.stack) {
    const lines = err.stack.split('\n').slice(1, 6);
    lines.forEach(l => console.error(`  ${l}`));
  }
  process.exit(1);
});
