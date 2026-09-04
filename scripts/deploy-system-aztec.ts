import { Fr } from '@aztec/aztec.js/fields';
import { deriveSigningKey } from '@aztec/stdlib/keys';
import { AztecAddress } from '@aztec/aztec.js/addresses';
import { SponsoredFeePaymentMethod } from '@aztec/aztec.js/fee';
import { getSchnorrAccount } from '@aztec/accounts/schnorr';
import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { Contract } from '@aztec/aztec.js/contracts';
import * as fs from 'fs';
import * as path from 'path';

const NODE_URL = process.env.AZTEC_NODE_URL || 'https://node.aztec.network';
const SECRET = process.env.AZTEC_RELAYER_SECRET_KEY || '0x0b2cda0c07982cced5c5bbbc01dc76a5b2ef4e8111926bb4d8a14f15104d8e36';
const SPONSORED_FPC = process.env.SPONSORED_FPC_ADDRESS || '0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7';

async function main() {
  console.log('══════════════════════════════════════════════════════');
  console.log('  Aztec Mainnet Deployment — Infrastructure Contracts');
  console.log('══════════════════════════════════════════════════════');

  console.log('\n🔗 Initializing EmbeddedWallet...');
  const pxe = await EmbeddedWallet.create(NODE_URL, {
    ephemeral: true,
    pxeConfig: { proverEnabled: true }
  });

  const nodeInfo = await pxe.getNodeInfo();
  console.log(`🌐 Network: chain=${nodeInfo.l2ChainId} version=${nodeInfo.protocolVersion}`);

  console.log('🔑 Loading relayer account...');
  const secretKey = Fr.fromHexString(SECRET.replace(/^0x/i, ''));
  const signingKey = deriveSigningKey(secretKey);
  const account = getSchnorrAccount(pxe, secretKey, signingKey);
  await account.register();
  const wallet = await account.getWallet();
  const adminAddr = wallet.getAddress();

  console.log(`👛 Relayer address: ${adminAddr.toString()}`);

  const fpcAddress = AztecAddress.fromString(SPONSORED_FPC);
  const paymentMethod = new SponsoredFeePaymentMethod(fpcAddress);

  // Deploy Registry
  console.log('\n📦 Deploying ProvenanceRegistry...');
  const registryPath = path.resolve(__dirname, '../noir-projects/contracts/registry-contract/target/provenance_registry-ProvenanceRegistry.json');
  const registryArtifact = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  try {
    const registryTx = await Contract.deploy(wallet, registryArtifact, [])
      .send({ fee: { paymentMethod } })
      .deployed();
    console.log(`✅ ProvenanceRegistry deployed at: ${registryTx.contract.address.toString()}`);
  } catch (e: any) {
    console.error('❌ Registry deploy failed:', e?.message || e);
  }

  // Deploy Paymaster
  console.log('\n📦 Deploying NativePaymaster...');
  const paymasterPath = path.resolve(__dirname, '../noir-projects/contracts/paymaster-contract/target/native_paymaster-NativePaymaster.json');
  const paymasterArtifact = JSON.parse(fs.readFileSync(paymasterPath, 'utf8'));

  try {
    const paymasterTx = await Contract.deploy(wallet, paymasterArtifact, [])
      .send({ fee: { paymentMethod } })
      .deployed();
    console.log(`✅ NativePaymaster deployed at: ${paymasterTx.contract.address.toString()}`);
  } catch (e: any) {
    console.error('❌ Paymaster deploy failed:', e?.message || e);
  }

  console.log('\n✅ Deployment process finished!');
  await pxe.stop();
  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Deployment failed:', err?.message || err);
  process.exit(1);
});
