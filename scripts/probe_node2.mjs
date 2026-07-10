// We know node_getContractClass and node_sendTx exist.
// Let's find ALL available methods via a comprehensive test
const baseUrl = 'https://v5.testnet.rpc.aztec-labs.com';

// First, get nodeInfo to understand what we're working with
const nodeInfo = await fetch(baseUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'node_getNodeInfo', params: [] }),
}).then(r => r.json());
console.log('NodeInfo:', JSON.stringify(nodeInfo.result, null, 2));

// Now test more comprehensive node_ methods
const nodeMethodsToTest = [
  // From SDK AztecNode interface
  'getNodeInfo', 'getVersion', 'getChainId', 'getBlockNumber',
  'getContractClass', 'getContractInstance', 'getContractClassMetadata',
  'simulateTx', 'sendTx', 'sendTxs',
  'getContractClassLogs', 'getBlockHeader', 'getBlocks',
  'getTxReceipt', 'getTxEffect', 'getPendingTxs',
  'getPublicStorageAt', 'getL1ToL2MessageMembershipWitness',
  'getNullifierMembershipWitness', 'getStateReference',
  'isReady', 'getProvenBlockNumber',
].map(m => 'node_' + m);

for (const method of nodeMethodsToTest) {
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
      process.stdout.write(`  ✓ ${method}: EXISTS\n`);
    } else {
      process.stdout.write(`  ✓ ${method}: OK\n`);
    }
  } catch(e) {
    process.stdout.write(`  ? ${method}: ${e.message}\n`);
  }
}
