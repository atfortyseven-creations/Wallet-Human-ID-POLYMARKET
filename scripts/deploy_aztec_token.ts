/**
 * scripts/deploy_aztec_token.ts
 *
 * Deploys the Ledger Network QDs TokenContract to Aztec Mainnet v5 (rc.2).
 *
 * Architecture: Aztec SDK v5.0.0
 *   - EmbeddedWallet.create(nodeUrl) → boots a local PXE process (requires Linux/WSL for @aztec/native binaries)
 *   - wallet.createSchnorrAccount(secret, salt) → AccountManager with .address getter
 *   - TokenContract.deploy(wallet, admin, name, symbol, decimals).send({ from, fee }) → DeployResultMined
 *   - result.contract.address.toString() → deployed contract address
 *
 * Return types confirmed from SDK source:
 *   DeployMethod.send() → Promise<DeployResultMined<TContract>>
 *   DeployResultMined = { contract: TContract; receipt: DeployTxReceipt<TContract> } & OffchainOutput
 *
 * Run on Railway (Linux):
 *   npx tsx scripts/deploy_aztec_token.ts
 *
 * Required env vars:
 *   AZTEC_RELAYER_SECRET_KEY  — 0x-prefixed 32-byte hex scalar (Fr field element)
 *   AZTEC_PXE_URL             — optional, defaults to https://node.aztec.network
 *   SPONSORED_FPC_ADDRESS     — optional, defaults to canonical testnet FPC
 */

import 'dotenv/config';
import { EmbeddedWallet }            from '@aztec/wallets/embedded';
import { Fr }                        from '@aztec/foundation/curves/bn254';
import { AztecAddress }              from '@aztec/stdlib/aztec-address';
import { TokenContract }             from '@aztec/noir-contracts.js/Token';
import { SponsoredFeePaymentMethod } from '@aztec/aztec.js/fee';

// ── Constants ────────────────────────────────────────────────────────────────

const SPONSORED_FPC =
  process.env.SPONSORED_FPC_ADDRESS ||
  '0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7';

const TOKEN_NAME    = 'Ledger QDs';
const TOKEN_SYMBOL  = 'QDs';
const TOKEN_DECIMALS = 18n;

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('══════════════════════════════════════════════════════');
  console.log('  Ledger Network — QDs Token Deployment                ');
  console.log('  Aztec Mainnet v5 (rc.2) | SDK v5.0.0                ');
  console.log('══════════════════════════════════════════════════════');

  // ── Validate env ─────────────────────────────────────────────────────────
  const relayerSecretHex = process.env.AZTEC_RELAYER_SECRET_KEY;
  if (!relayerSecretHex) {
    throw new Error('[FATAL] Missing AZTEC_RELAYER_SECRET_KEY in environment.');
  }

  const pxeUrl =
    process.env.AZTEC_PXE_URL ||
    process.env.AZTEC_NODE_URL ||
    'https://node.aztec.network';

  // ── Step 1: Initialize EmbeddedWallet ────────────────────────────────────
  console.log(`\n[1/4] Initializing EmbeddedWallet...`);
  console.log(`      Node/PXE URL: ${pxeUrl}`);
  console.log('      (This boots a local PXE process and connects to the Aztec node)');

  // NodeEmbeddedWallet.create() is exported as EmbeddedWallet from @aztec/wallets/embedded
  // It: creates an AztecNodeClient, boots a local PXE, creates an LMDB wallet DB
  const wallet = await EmbeddedWallet.create(pxeUrl, { ephemeral: true });
  console.log('      ✅ EmbeddedWallet initialized successfully.');

  // ── Step 2: Derive relayer Schnorr account ───────────────────────────────
  console.log('\n[2/4] Deriving relayer Schnorr account...');

  // Fr.fromHexString expects the hex WITHOUT 0x prefix
  const secretKey = Fr.fromHexString(relayerSecretHex.replace(/^0x/i, ''));
  
  // Use salt = 0 for deterministic address — relayer always gets same Aztec address
  const salt = new Fr(0n);

  // createSchnorrAccount(secret: Fr, salt: Fr, signingKey?: Fq, alias?: string)
  // Returns Promise<AccountManager> — stores account in local wallet DB
  // Auto-derives signing key from secret via deriveSigningKey(secret) if omitted
  const accountManager = await wallet.createSchnorrAccount(secretKey, salt);

  // accountManager.address is a synchronous getter (AztecAddress)
  const relayerAddress = accountManager.address;
  console.log(`      ✅ Relayer account derived and registered.`);
  console.log(`      💳 Relayer Address: ${relayerAddress.toString()}`);

  // ── Step 3: Prepare FPC payment method ──────────────────────────────────
  console.log('\n[3/4] Preparing Sponsored FPC fee payment method...');
  console.log(`      ⚡ FPC Address: ${SPONSORED_FPC}`);

  const fpcAddress       = AztecAddress.fromString(SPONSORED_FPC);
  const feePaymentMethod = new SponsoredFeePaymentMethod(fpcAddress);

  // ── Step 4: Deploy TokenContract ─────────────────────────────────────────
  console.log('\n[4/4] Deploying TokenContract to Aztec Mainnet v5...');
  console.log(`      Token: ${TOKEN_NAME} (${TOKEN_SYMBOL}), ${TOKEN_DECIMALS} decimals`);
  console.log('      ⏳ Simulating and dispatching deployment transaction...');

  //
  // TokenContract.deploy(wallet, admin, name, symbol, decimals) → DeployMethod<TokenContract>
  //
  // The wallet passed here is the EmbeddedWallet (implements Wallet interface via BaseWallet)
  // The admin is the relayer's Aztec address (AztecAddress, implements AztecAddressLike)
  //
  // DeployMethod.send(options: DeployOptionsWithoutWait) → Promise<DeployResultMined<TContract>>
  //   where DeployResultMined = { contract: TContract; receipt: DeployTxReceipt<TContract> } & OffchainOutput
  //
  // from: relayerAddress → locks the deployer to relayerAddress (BoundDeployMethod)
  // fee.paymentMethod   → SponsoredFeePaymentMethod pays gas via the FPC relayer
  //
  const deployResult = await TokenContract
    .deploy(
      wallet,           // Wallet — EmbeddedWallet implements this
      relayerAddress,   // AztecAddressLike — token admin
      TOKEN_NAME,       // string
      TOKEN_SYMBOL,     // string
      TOKEN_DECIMALS    // bigint
    )
    .send({
      from: relayerAddress,    // AztecAddress — mandatory, locks deployer
      fee: {
        paymentMethod: feePaymentMethod,
      },
    });

  // DeployResultMined.contract.address → AztecAddress of deployed contract
  const contractAddress = deployResult.contract.address.toString();
  const txHash          = deployResult.receipt.txHash.toString();

  // ── Report ───────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  ✅  DEPLOYMENT SUCCESSFUL                            ');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Token Contract Address : ${contractAddress}`);
  console.log(`  Transaction Hash       : ${txHash}`);
  console.log(`  Explorer               : https://aztecscan.xyz/tx/${txHash}`);
  console.log('\n📝 ACTION REQUIRED:');
  console.log('  Copy the line below and add it to your .env file (Railway Variables):');
  console.log(`\n  AZTEC_TOKEN_CONTRACT_ADDRESS="${contractAddress}"\n`);
  console.log('══════════════════════════════════════════════════════');

  // Graceful shutdown of C++ AVM simulator background threads and LMDB store
  await wallet.stop();
  process.exit(0);
}

main().catch(async (err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('\n══════════════════════════════════════════════════════');
  console.error(`  ❌  DEPLOYMENT FAILED: ${message}`);
  console.error('══════════════════════════════════════════════════════');
  if (err instanceof Error && err.stack) {
    console.error('\nStack trace:');
    console.error(err.stack);
  }
  process.exit(1);
});
