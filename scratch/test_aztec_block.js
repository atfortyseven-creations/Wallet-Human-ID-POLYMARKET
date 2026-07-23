const url = 'https://v5.testnet.rpc.aztec-labs.com';

async function test() {
  // 1. Get latest block number
  const r1 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'node_getBlockNumber', params: [], id: 1 })
  });
  const d1 = await r1.json();
  console.log('Block Number:', d1.result);

  if (!d1.result) return;

  // 2. Get block by number
  const r2 = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'node_getBlock', params: [d1.result], id: 2 })
  });
  const d2 = await r2.json();
  console.log('Block Data keys:', d2.result ? Object.keys(d2.result) : d2);
  
  if (d2.result?.header) {
    console.log('Header:', Object.keys(d2.result.header));
    if (d2.result.header.globalVariables) {
       console.log('Global Vars:', d2.result.header.globalVariables);
    }
  }
}

test().catch(console.error);
