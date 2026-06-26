#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

echo "=== Testing node_getCheckpoints on V5 ==="
node -e "
fetch('https://v5.testnet.rpc.aztec-labs.com', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({jsonrpc:'2.0', method:'node_getCheckpoints', params:[9400, 1], id:1})
}).then(r=>r.json()).then(d=>{
  console.log(JSON.stringify(d, null, 2).slice(0, 500));
});
"
