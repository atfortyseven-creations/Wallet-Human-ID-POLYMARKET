#!/bin/bash
echo "=== LIVE BLOCK HEIGHT ==="
curl -s -X POST https://rpc.testnet.aztec-labs.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"node_getBlockNumber","params":[],"id":1}'

echo ""
echo "=== VERIFY TX HASH EXISTS IN BLOCK 103861 ==="
curl -s -X POST https://rpc.testnet.aztec-labs.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"node_getBlock","params":[103861],"id":2}' | python3 -c "
import sys, json
data = json.load(sys.stdin)
block = data.get('result', {})
txs = block.get('body', {}).get('txEffects', [])
print('Block 103861 TX count:', len(txs))
for tx in txs:
    print('TX Hash:', tx.get('txHash'))
    print('Revert Code:', tx.get('revertCode'))
    print('Fee:', tx.get('transactionFee'))
"
