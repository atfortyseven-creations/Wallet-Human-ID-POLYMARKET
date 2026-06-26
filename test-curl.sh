#!/bin/bash
echo "Testing v5 node..."
curl -s -X POST -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"node_getBlockNumber","params":[],"id":1}' https://v5.testnet.rpc.aztec-labs.com
echo -e "\nTesting regular testnet node..."
curl -s -X POST -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"node_getBlockNumber","params":[],"id":1}' https://rpc.testnet.aztec-labs.com
