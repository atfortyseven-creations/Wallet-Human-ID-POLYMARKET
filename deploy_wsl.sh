#!/usr/bin/env bash
# deploy_wsl.sh — Run from project root via: wsl bash deploy_wsl.sh

set -e

echo "══════════════════════════════════════════════════════"
echo "  Ledger Network — QDs Token Deployment"
echo "  Aztec Mainnet v5 | SDK v5.0.0"
echo "══════════════════════════════════════════════════════"

# Load env vars from .env
export $(grep -v '^#' .env | grep -v '^$' | xargs)

echo "[1/3] Checking Node version..."
node -v

echo "[2/3] Installing linux esbuild binary..."
cd /tmp
rm -rf ledger-deploy
mkdir ledger-deploy
cd ledger-deploy

# Initialize a fresh ESM project
cat > package.json << 'EOF'
{
  "name": "ledger-deploy",
  "version": "1.0.0",
  "type": "module",
  "private": true
}
EOF

# Install only what's needed for the deploy script
npm install \
  dotenv \
  @aztec/aztec.js@4.3.1 \
  @aztec/accounts@4.3.1 \
  @aztec/wallets@4.3.1 \
  @aztec/noir-contracts.js@4.3.1 \
  @aztec/foundation@4.3.1 \
  @aztec/stdlib@4.3.1 \
  @aztec/pxe@4.3.1 \
  tsx \
  typescript \
  --legacy-peer-deps 2>&1

echo "[3/3] Running deployment script..."

# Set env vars directly
export AZTEC_RELAYER_SECRET_KEY="0x284a50f1d76de0e16d99b3bc8cf355db77c4fdb2ba69631e7bcd192415f9a98f"
export AZTEC_PXE_URL="https://node.aztec.network"
export AZTEC_NODE_URL="https://node.aztec.network"

# Copy the deploy script
cp "/mnt/d/Projects/Wallet Human Polymarket ID/scripts/deploy_aztec_token.ts" ./deploy.ts

npx tsx deploy.ts
