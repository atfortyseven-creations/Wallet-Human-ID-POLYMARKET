// We know node_getNodeInfo works. Let's find all available methods
// by trying comprehensive list with node_ prefix, and also check what AccountManager used
const baseUrl = 'https://v5.testnet.rpc.aztec-labs.com';

// From the previous probe, node_getNodeInfo worked.
// The AccountManager derived the relayer address - this means it successfully
// called some PXE methods. Let's check what createSafeJsonRpcClient with PXE uses
// for AccountManager.create() - it's all local computation (deriveKeys, getContractInstanceFromInstantiationParams)
// and does NOT require ANY network calls! That's why it worked.

// The getAccount() method is also pure local computation:
// CompleteAddress.fromSecretKeyAndInstance(secretKey, instance)
// So AccountManager.create + getAccount() = ALL LOCAL, NO NETWORK CALLS

// The ACTUAL first network call happens in TokenContract.deploy(...).send()
// which calls getContractClassMetadata.

// Let's try node_ prefixed methods for everything
const nodeMethodsToTest = [
  'getNodeInfo',
  'getVersion', 
  'getChainId',
  'getBlockNumber',
  'getContractClass',
  'getContractInstance',
  'getContractClassMetadata',
  'getContractMetadata',
  'simulateTx',
  'sendTx',
  'getChainInfo',
  'getL2BlockNumber',
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
      process.stdout.write(`  ✓ ${method}: EXISTS (err=${data.error.message.substring(0,80)})\n`);
    } else {
      process.stdout.write(`  ✓ ${method}: OK => ${JSON.stringify(data.result).substring(0,100)}\n`);
    }
  } catch(e) {
    process.stdout.write(`  ? ${method}: ${e.message}\n`);
  }
}
