#!/usr/bin/env tsx
/**
 * scripts/deploy-humanity-ledger.ts
 *
 * Deploys the compiled HumanityLedger (QDs) contract to Aztec Alpha Testnet.
 *
 * Prerequisites (run in WSL):
 *   1. aztec-nargo compile (already done ✅)
 *   2. Copy artifact: cp ~/whale-circuits/humanity_ledger/target/dev/humanity_ledger-HumanityLedger.json lib/aztec/artifacts/
 *   3. npm install @aztec/aztec.js @aztec/accounts
 *   4. Set AZTEC_RELAYER_PRIVATE_KEY in .env (or generate below)
 *   5. Fund relayer: aztec-wallet drizzle --recipient <relayer_address> (from Aztec faucet)
 *
 * Run:
 *   npx tsx scripts/deploy-humanity-ledger.ts
 */

import * as dotenv from 'dotenv';
dotenv.config();

const AZTEC_PXE_URL = process.env.AZTEC_PXE_URL || 'http://localhost:8080';

async function main() {
  console.log('\n🐋 ================================================');
  console.log('   Humanity Ledger (QDs) → Aztec Alpha Testnet');
  console.log('   ================================================\n');

  // ── Dynamic imports (server-side only) ──────────────────────────────────
  const { Contract } = await import('@aztec/aztec.js/contracts');
  const { Fr } = await import('@aztec/aztec.js/fields');
  const { AztecAddress } = await import('@aztec/aztec.js/addresses');
  const { createAztecNodeClient: createPXEClient } = await import('@aztec/aztec.js/node');
  const { getSchnorrAccount } = await import('@aztec/accounts/schnorr');
  const { GrumpkinScalar } = await import('@aztec/aztec.js/fields');
  const fs = await import('fs');
  const path = await import('path');

  // ── Connect to PXE ──────────────────────────────────────────────────────
  console.log(`🔌 Connecting to Aztec PXE: ${AZTEC_PXE_URL}`);
  const pxe = createPXEClient(AZTEC_PXE_URL);
  const nodeInfo = await pxe.getNodeInfo();
  console.log(`✅ Connected to Aztec node: ${JSON.stringify(nodeInfo, null, 2)}\n`);

  // ── Load or get Sandbox pre-funded account ──────────────────────────────
  let relayerKey = process.env.AZTEC_RELAYER_PRIVATE_KEY;
  let relayerWallet;
  let relayerAddress;

  if (!relayerKey) {
    console.log('⚠️  AZTEC_RELAYER_PRIVATE_KEY not found. Using pre-funded Sandbox account...');
    const accounts = await pxe.getRegisteredAccounts();
    if (accounts.length === 0) {
        console.error('❌ No registered accounts found in PXE. Are you running the Aztec Sandbox?');
        process.exit(1);
    }
    const sandboxAccount = accounts[0];
    relayerAddress = sandboxAccount.address;
    
    // We get a generic wallet for the first account
    const { getWallet } = await import('@aztec/aztec.js/wallet');
    relayerWallet = await getWallet(pxe, relayerAddress, sandboxAccount);
    console.log(`✅ Using Sandbox Account 0: ${relayerAddress.toString()}`);
  } else {
    // ── Create relayer account from key ─────────────────────────────────────
    console.log('🔐 Loading relayer account from env...');
    const signingKey = GrumpkinScalar.fromString(relayerKey);
    const relayerAccount = getSchnorrAccount(pxe, Fr.fromString(relayerKey), signingKey, Fr.ZERO);

    try {
      await relayerAccount.deploy().wait();
      console.log('✅ Relayer account deployed to Aztec testnet');
    } catch (e: any) {
      if (e.message?.includes('already deployed') || e.message?.includes('already registered')) {
        console.log('✅ Relayer account already deployed');
      } else {
        throw e;
      }
    }
    relayerWallet = await relayerAccount.getWallet();
    relayerAddress = relayerWallet.getAddress();
    console.log(`📬 Relayer address: ${relayerAddress.toString()}\n`);
  }

  // ── Load artifact ────────────────────────────────────────────────────────
  const artifactPath = path.resolve(process.cwd(), 'lib/aztec/artifacts/humanity_ledger-HumanityLedger.json');
  if (!fs.existsSync(artifactPath)) {
    console.error(`❌ Artifact not found at: ${artifactPath}`);
    console.error('Run in WSL:');
    console.error('  cd ~/whale-circuits/humanity_ledger');
    console.error('  aztec-nargo compile');
    console.error('  mkdir -p <project>/lib/aztec/artifacts');
    console.error('  cp target/dev/humanity_ledger-HumanityLedger.json <project>/lib/aztec/artifacts/');
    process.exit(1);
  }

  console.log('📦 Loading HumanityLedger artifact...');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
  console.log(`✅ Artifact loaded: ${artifact.name} (${artifact.functions?.length || '?'} functions)\n`);

  // ── Deploy contract ──────────────────────────────────────────────────────
  console.log('🚀 Deploying HumanityLedger contract to Aztec Alpha Testnet...');
  console.log('   (This may take 30-120 seconds — ZK proof generation in progress)\n');

  const contract = await Contract.deploy(
    relayerWallet,
    artifact,
    [] // constructor args — HumanityLedger takes none
  )
    .send()
    .deployed();

  const contractAddress = contract.address.toString();
  console.log('\n✅ ================================================');
  console.log('   DEPLOYMENT SUCCESSFUL!');
  console.log('   ================================================');
  console.log(`\n📍 Contract Address: ${contractAddress}`);
  console.log(`🔍 Explorer: https://testnet.aztecscan.xyz/contract/${contractAddress}\n`);

  console.log('📋 ADD THESE TO YOUR .env AND Railway dashboard:\n');
  console.log(`AZTEC_QDS_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`NEXT_PUBLIC_AZTEC_QDS_ADDRESS=${contractAddress}`);
  console.log(`AZTEC_PXE_URL=${AZTEC_PXE_URL}`);
  console.log(`AZTEC_NETWORK=alpha-testnet\n`);

  // Auto-write to .env.aztec for convenience
  const envContent = [
    `# Aztec Alpha Testnet — QDs Contract (auto-generated by deploy script)`,
    `AZTEC_QDS_CONTRACT_ADDRESS=${contractAddress}`,
    `NEXT_PUBLIC_AZTEC_QDS_ADDRESS=${contractAddress}`,
    `AZTEC_PXE_URL=${AZTEC_PXE_URL}`,
    `AZTEC_RELAYER_PRIVATE_KEY=${relayerKey}`,
    `AZTEC_NETWORK=alpha-testnet`,
    '',
  ].join('\n');

  fs.writeFileSync('.env.aztec', envContent);
  console.log('💾 Written to .env.aztec — merge into your main .env before deploying to Railway\n');

  console.log('🎉 QDs contract is LIVE on Aztec Alpha Testnet!');
  console.log('   Users can now send private transfers from /portfolio → QDs Transfer\n');
}

main().catch(err => {
  console.error('\n❌ Deployment failed:', err.message || err);
  process.exit(1);
});
