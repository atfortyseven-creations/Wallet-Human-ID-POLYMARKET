// deploy-token.mjs
// Despliega el QDs TokenContract en Aztec Testnet v5
// Uso: node deploy-token.mjs
// Requiere: AZTEC_RELAYER_SECRET_KEY en el entorno

import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { createSafeJsonRpcClient } from '@aztec/foundation/json-rpc/client';
import { PXE } from '@aztec/pxe/client/lazy';
import { Fr } from '@aztec/aztec.js/fields';
import { deriveSigningKey } from '@aztec/stdlib/keys';
import { SchnorrAccountContract } from '@aztec/accounts/schnorr';
import { AccountManager } from '@aztec/aztec.js/wallet';
import { AztecAddress } from '@aztec/stdlib/aztec-address';
import { SponsoredFeePaymentMethod } from '@aztec/aztec.js/fee';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

const NODE_URL   = 'https://v5.testnet.rpc.aztec-labs.com';
const FPC_ADDR   = '0x1969946536f0c09269e2c75e414eef4e21a76e763c5514125208db33d7d944d7';
const SECRET_HEX = process.env.AZTEC_RELAYER_SECRET_KEY;

if (!SECRET_HEX) {
  console.error('❌ Set AZTEC_RELAYER_SECRET_KEY env var first');
  process.exit(1);
}

console.log('🔗 Connecting to Aztec Testnet node...');
const node = createAztecNodeClient(NODE_URL);
const blockNumber = await node.getBlockNumber();
console.log(`✅ Node connected — Block #${blockNumber}`);

console.log('🔑 Deriving Schnorr Account from relayer secret key...');
const pxe = createSafeJsonRpcClient(NODE_URL, PXE);
const secretKey  = Fr.fromHexString(SECRET_HEX.replace('0x', ''));
const signingKey = deriveSigningKey(secretKey);
const contract   = new SchnorrAccountContract(signingKey);

const manager = await AccountManager.create(pxe, secretKey, contract);
const wallet  = await manager.getWallet();
const adminAddress = wallet.getAddress();
console.log(`👤 Admin address: ${adminAddress.toString()}`);

const paymentMethod = new SponsoredFeePaymentMethod(
  AztecAddress.fromString(FPC_ADDR)
);

console.log('🚀 Deploying QDs TokenContract on Aztec Testnet...');
console.log('   (This may take 30-120 seconds for ZK proof generation)');

const deployTx = TokenContract.deploy(wallet, adminAddress, 'Quantum Dollars', 'QDs', 18)
  .send({ fee: { paymentMethod } });

console.log('⏳ Waiting for block confirmation...');
const receipt = await deployTx.wait();
const tokenAddress = receipt.contract.address.toString();

console.log('\n✅ ═══════════════════════════════════════════════════════');
console.log(`✅ QDs TokenContract deployed successfully!`);
console.log(`✅ ═══════════════════════════════════════════════════════`);
console.log(`\n📌 Token Address:  ${tokenAddress}`);
console.log(`📌 Admin Address:  ${adminAddress.toString()}`);
console.log(`📌 Deploy Tx Hash: ${receipt.txHash?.toString()}`);
console.log(`📌 Block Number:   ${receipt.blockNumber}`);
console.log(`\n🔗 View on AztecScan:`);
console.log(`   https://testnet.aztecscan.xyz/tx/${receipt.txHash?.toString()}`);
console.log(`\n📋 ACTION REQUIRED — Add to Railway env vars:`);
console.log(`   AZTEC_TOKEN_CONTRACT_ADDRESS=${tokenAddress}`);
console.log(`\n   Then redeploy Railway to activate Mode A (real on-chain txs)`);
