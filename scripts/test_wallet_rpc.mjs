// The testnet URL serves a Wallet interface, NOT a PXE!
// Use createSafeJsonRpcClient with WalletSchema
import { createSafeJsonRpcClient } from '@aztec/foundation/json-rpc/client';
import { WalletSchema } from '@aztec/aztec.js/wallet';

const walletUrl = 'https://v5.testnet.rpc.aztec-labs.com';
const wallet = createSafeJsonRpcClient(walletUrl, WalletSchema);

console.log('Wallet client methods:', Object.keys(wallet));
console.log('Has getContractClassMetadata:', typeof wallet.getContractClassMetadata);

// Test a live call
try {
  const chainInfo = await wallet.getChainInfo();
  console.log('chainInfo:', chainInfo);
} catch(e) {
  console.log('getChainInfo error:', e.message);
}
