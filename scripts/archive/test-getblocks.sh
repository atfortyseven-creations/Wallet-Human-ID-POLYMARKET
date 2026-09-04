#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

echo "=== Testing node_getBlocks on V5 ==="
node -e "
fetch('https://node.aztec.network', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({jsonrpc:'2.0', method:'node_getBlocks', params:[9490, 2], id:1})
}).then(r=>r.json()).then(d=>{
  const result = d.result;
  if(Array.isArray(result) && result.length > 0) {
    const block = result[0];
    console.log('Keys:', Object.keys(block));
    console.log('Has body:', 'body' in block);
    console.log('body value:', block.body);
    console.log('number:', block.number);
    console.log('checkpointNumber:', block.checkpointNumber);
  } else {
    console.log('Error or empty:', JSON.stringify(d).slice(0,300));
  }
});
"
