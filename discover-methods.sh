#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

echo "=== Discovering V5 node methods ==="
node -e "
async function call(method, params=[]) {
  try {
    const r = await fetch('https://v5.testnet.rpc.aztec-labs.com', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({jsonrpc:'2.0', method, params, id:1})
    });
    const d = await r.json();
    return d;
  } catch(e) { return {error:{message: 'fetch:'+e.message}}; }
}

(async()=>{
  // Test all node_ methods that might exist
  const nodeMethods = [
    'node_getL2Tips', 'node_getLogs', 'node_getBlock',
    'node_getBlocks', 'node_getBlockHeader', 'node_getBlockNumber',
    'node_getNodeInfo', 'node_getVersion', 'node_getCheckpoints',
    'node_getCheckpointedBlocks', 'node_getProvenBlockNumber',
    'node_isReady', 'node_getPendingTxs', 'node_getTxEffect',
    'node_getL2BlockHash', 'node_getChainTips', 'node_getTips',
    'node_getPublicState', 'node_simulateUtility'
  ];
  for(const m of nodeMethods) {
    const r = await call(m);
    if(!r.error) console.log('OK  '+m+': '+JSON.stringify(r.result).slice(0,100));
    else console.log('ERR '+m+': '+r.error.message.slice(0,60));
  }
})();
"
