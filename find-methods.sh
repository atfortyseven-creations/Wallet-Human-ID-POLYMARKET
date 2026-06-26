#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

echo "=== Deep inspect node_getCheckpoints ==="
node -e "
async function call(method, params=[]) {
  const r = await fetch('https://v5.testnet.rpc.aztec-labs.com', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({jsonrpc:'2.0', method, params, id:1})
  });
  const d = await r.json();
  return d;
}

(async()=>{
  // Get L2Tips equivalent
  const tips = await call('node_getL2Tips');
  console.log('L2Tips:', JSON.stringify(tips));

  // Try different tip methods
  const methods = [
    'aztec_blockNumber','eth_blockNumber',
    'node_getProvenBlockNumber','node_getBlockNumber',
    'node_getTips','node_status','node_getStatus',
    'pxe_getNodeInfo'
  ];
  for(const m of methods) {
    const r = await call(m);
    if(!r.error) console.log(m+':', JSON.stringify(r.result).slice(0,150));
    else console.log(m+':', r.error.message);
  }
})();
"
