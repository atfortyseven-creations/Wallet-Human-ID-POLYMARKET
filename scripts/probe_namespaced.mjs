// The server uses namespaced methods: node_X, pxe_X, wallet_X
const baseUrl = 'https://v5.testnet.rpc.aztec-labs.com';

const namespacedMethods = [
  // PXE methods
  'pxe_getNodeInfo',
  'pxe_getBlockNumber', 
  'pxe_getChainId',
  'pxe_getPXEInfo',
  'pxe_getContractClass',
  'pxe_getContractInstance',
  'pxe_getContractClassMetadata',
  'pxe_getContractMetadata',
  'pxe_registerContract',
  'pxe_addContracts',
  'pxe_simulateTx',
  'pxe_sendTx',
  'pxe_getChainInfo',
  'pxe_getRegisteredAccounts',
  'pxe_getAccounts',
  // Wallet methods
  'wallet_getChainInfo',
  'wallet_getContractClassMetadata',
  'wallet_getContractMetadata', 
  'wallet_registerContract',
  'wallet_simulateTx',
  'wallet_sendTx',
  'wallet_getAccounts',
];

for (const method of namespacedMethods) {
  try {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params: [] }),
    });
    const data = await res.json();
    if (data.error?.code === -32601) {
      process.stdout.write(`  ✗ ${method}\n`);
    } else if (data.error) {
      process.stdout.write(`  ✓ ${method}: EXISTS (err=${data.error.message.substring(0,60)})\n`);
    } else {
      process.stdout.write(`  ✓ ${method}: OK\n`);
    }
  } catch(e) {
    process.stdout.write(`  ? ${method}: ${e.message}\n`);
  }
}
