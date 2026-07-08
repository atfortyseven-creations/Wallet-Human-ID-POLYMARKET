#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

# Load from .env.relayer
export AZTEC_RELAYER_SECRET_KEY="0x0b2cda0c07982cced5c5bbbc01dc76a5b2ef4e8111926bb4d8a14f15104d8e36"
export AZTEC_NODE_URL="https://v5.testnet.rpc.aztec-labs.com"
export SPONSORED_FPC_ADDRESS="0x261366b3c0a9b4c30864629556cf282be409e6822b1f3a065fcb7e34f36d7880"

echo "=== QDs Token Deploy — Aztec Testnet V5 ==="
echo "Node: $AZTEC_NODE_URL"
echo "Key: ${AZTEC_RELAYER_SECRET_KEY:0:10}..."
echo ""

bash deploy-v5-sdk.sh
