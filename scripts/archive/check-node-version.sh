#!/bin/bash
# Verifica cuál versión SDK coincide con el nodo V5
source ~/.nvm/nvm.sh
nvm use 20 --silent

echo "=== Checking V5 node version vs SDK version ==="
node -e "
async function main() {
  // Get node version from chain tip
  const resp = await fetch('https://v5.testnet.rpc.aztec-labs.com', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({jsonrpc:'2.0', method:'node_getNodeInfo', params:[], id:1})
  });
  const data = await resp.json();
  console.log('node_getNodeInfo result:', JSON.stringify(data.result, null, 2));
}
main().catch(console.error);
"
