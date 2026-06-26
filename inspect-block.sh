#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

# Inspect what getBlock returns vs what node API expects
node -e "
import('https://v5.testnet.rpc.aztec-labs.com').catch(()=>{});

const res = fetch('https://v5.testnet.rpc.aztec-labs.com', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ jsonrpc: '2.0', method: 'node_getBlock', params: [1], id: 1 })
});

res.then(r => r.json()).then(d => {
  console.log(JSON.stringify(d.result?.header, null, 2));
});
" 2>&1
