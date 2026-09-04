#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

echo "=== Checking node RPC methods from v5 ==="
node -e "
async function call(method, params=[]) {
  const r = await fetch('https://node.aztec.network', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({jsonrpc:'2.0', method, params, id:1})
  });
  const d = await r.json();
  if(d.error) console.log(method+':', JSON.stringify(d.error));
  else console.log(method+':', JSON.stringify(d.result).slice(0,200));
}

(async()=>{
  await call('node_getL2Tips');
  await call('node_getBlockHeader', [1]);
  await call('node_getBlock', [1]);
  await call('node_getCheckpoints', [1, 1]);
  await call('node_getCheckpointedBlocks', [1, 1]);
})();
"
