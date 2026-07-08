#!/bin/bash
# deploy.sh - Lee la clave desde .env o argumento
source ~/.nvm/nvm.sh
nvm use 20 --silent

# Cargar .env si existe
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

# Si se pasa como argumento, usar ese
if [ -n "$1" ]; then
  export AZTEC_RELAYER_SECRET_KEY="$1"
fi

export AZTEC_NODE_URL="${AZTEC_NODE_URL:-https://v5.testnet.rpc.aztec-labs.com}"

echo "=== QDs Token Deploy — Aztec V5 Testnet ==="
echo "Node: $AZTEC_NODE_URL"
echo "Key length: ${#AZTEC_RELAYER_SECRET_KEY} chars"
echo ""

node scripts/deploy-qds-token.mjs
