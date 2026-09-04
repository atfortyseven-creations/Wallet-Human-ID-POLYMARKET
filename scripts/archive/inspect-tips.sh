#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

echo "=== Full node_getChainTips result ==="
node -e "
fetch('https://node.aztec.network', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({jsonrpc:'2.0', method:'node_getChainTips', params:[], id:1})
}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d.result, null, 2)));
"

echo "=== node_getBlock full result ==="
node -e "
fetch('https://node.aztec.network', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({jsonrpc:'2.0', method:'node_getBlock', params:[1], id:1})
}).then(r=>r.json()).then(d=>console.log(JSON.stringify(d.result, null, 2)));
" 2>&1 | head -60
