// Probe exactly what methods the testnet PXE server exposes
const baseUrl = 'https://v5.testnet.rpc.aztec-labs.com';

const methodsToTest = [
  // PXE standard methods
  'getNodeInfo',
  'getBlockNumber',
  'getChainId',
  'getPXEInfo',
  'getContractClass',
  'getContractInstance',
  'getContractClassMetadata',
  'getContractMetadata',
  'registerContract',
  'addContracts',
  'simulateTx',
  'sendTx',
  'getChainInfo',
  'getRegisteredAccounts',
  'getRecipients',
  'getAccounts',
];

for (const method of methodsToTest) {
  try {
    const res = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params: [] }),
    });
    const data = await res.json();
    if (data.error?.code === -32601) {
      console.log(`  ✗ ${method}: METHOD NOT FOUND`);
    } else if (data.error) {
      console.log(`  ✓ ${method}: EXISTS (error=${data.error.message})`);
    } else {
      console.log(`  ✓ ${method}: OK =>`, JSON.stringify(data.result).substring(0, 100));
    }
  } catch(e) {
    console.log(`  ? ${method}: fetch error - ${e.message}`);
  }
}
