// Check what JSON-RPC methods are available on the public testnet node
const URLS = [
  'https://v5.testnet.rpc.aztec-labs.com',
];

const methods = [
  'pxe_getNodeInfo',
  'node_getNodeInfo',
  'pxe_getPXEInfo', 
  'pxe_getRegisteredAccounts',
  'aztec_pxe_getNodeInfo',
];

async function checkMethod(url, method) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params: [], id: 1 })
  });
  const json = await res.json();
  return { method, result: json.result !== undefined ? 'OK' : `ERR: ${json.error?.message || 'unknown'}` };
}

for (const url of URLS) {
  console.log(`\nChecking ${url}:`);
  for (const m of methods) {
    checkMethod(url, m)
      .then(r => console.log(`  ${r.method}: ${r.result}`))
      .catch(e => console.log(`  ${m}: FETCH_ERROR ${e.message}`));
  }
}
