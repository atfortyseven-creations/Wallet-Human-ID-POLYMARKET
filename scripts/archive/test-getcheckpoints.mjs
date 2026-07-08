import { createAztecNodeClient } from '@aztec/aztec.js/node';

async function main() {
  const resp = await fetch('https://v5.testnet.rpc.aztec-labs.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'node_getCheckpoints',
      params: [9200, 1] // Get checkpoint 9200
    })
  });
  const data = await resp.json();
  console.log(JSON.stringify(data, null, 2).slice(0, 800));
}

main().catch(console.error);
