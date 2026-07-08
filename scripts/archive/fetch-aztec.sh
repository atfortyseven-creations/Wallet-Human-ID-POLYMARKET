#!/bin/bash
# Fetch real Aztec testnet blocks and transactions via JSON-RPC
echo "=== FETCHING REAL AZTEC BLOCKS ==="
curl -s -X POST https://rpc.testnet.aztec-labs.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"node_getBlockNumber","params":[],"id":1}'

echo ""
echo "=== FETCHING BLOCK 103861 (OUR CLAIM BLOCK) ==="
curl -s -X POST https://rpc.testnet.aztec-labs.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"node_getBlock","params":[103861],"id":2}'

echo ""
echo "=== FETCHING LATEST BLOCK ==="
curl -s -X POST https://rpc.testnet.aztec-labs.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"node_getBlock","params":[],"id":3}'

echo ""
echo "=== CHICMOZ API: LATEST TXS ==="
curl -s "https://api.aztec.network/testnet/chicmoz/block-explorer/v1/l2/txs?page=1&pageSize=5" \
  -H "Accept: application/json"

echo ""
echo "=== AZTEC LABS AZTEC NODE INFO ==="
curl -s -X POST https://rpc.testnet.aztec-labs.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"node_getNodeInfo","params":[],"id":4}'
