#!/usr/bin/env bash
# scripts/start-with-pxe.sh
#
# Starts the Aztec PXE sidecar + the Next.js application.
# Used as the Railway start command for production deployment.
#
# Required env vars:
#   AZTEC_NODE_URL     = https://rpc.testnet.aztec-labs.com
#   AZTEC_PXE_URL      = http://localhost:8080  (default, PXE runs on same container)
#   AZTEC_RELAYER_SECRET_KEY = <32-byte hex>
#   AZTEC_QDS_CONTRACT_ADDRESS = <deployed contract address>

set -e

echo "══════════════════════════════════════════════════"
echo " LEDGER INTELLIGENCE — Aztec Testnet PXE Startup"
echo "══════════════════════════════════════════════════"

AZTEC_NODE="${AZTEC_NODE_URL:-https://rpc.testnet.aztec-labs.com}"
PXE_PORT="${PXE_PORT:-8080}"

echo "🌐 Aztec Node: $AZTEC_NODE"
echo "🔌 PXE Port:   $PXE_PORT"

# Check if aztec CLI is available
if command -v aztec &> /dev/null; then
  echo "✅ Aztec CLI found: $(aztec --version)"

  # Start the PXE in background, pointing to the public testnet node
  echo "🚀 Starting PXE connected to Aztec Testnet..."
  aztec start --pxe \
    --pxe.nodeUrl "$AZTEC_NODE" \
    --pxe.port "$PXE_PORT" \
    &
  PXE_PID=$!
  echo "📡 PXE started (PID: $PXE_PID)"

  # Wait for PXE to be ready
  echo "⏳ Waiting for PXE to be ready..."
  for i in {1..30}; do
    if curl -s "http://localhost:$PXE_PORT/status" > /dev/null 2>&1; then
      echo "✅ PXE is ready!"
      break
    fi
    sleep 2
    echo "   Attempt $i/30..."
  done
else
  echo "⚠️  Aztec CLI not found. Install via: bash -i <(curl -s https://install.aztec.network)"
  echo "   Continuing without local PXE — AZTEC_PXE_URL must point to an external PXE."
fi

echo ""
echo "🚀 Starting Next.js application..."
exec npm start
