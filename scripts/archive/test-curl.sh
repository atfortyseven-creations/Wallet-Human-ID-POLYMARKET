#!/bin/bash
echo "Testing v5 node..."
curl -s -X POST -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"node_getBlockNumber","params":[],"id":1}' https://node.aztec.network
echo -e "\nTesting regular testnet node..."
curl -s -X POST -H 'Content-Type: application/json' -d '{"jsonrpc":"2.0","method":"node_getBlockNumber","params":[],"id":1}' https://rpc.testnet.aztec-labs.com
