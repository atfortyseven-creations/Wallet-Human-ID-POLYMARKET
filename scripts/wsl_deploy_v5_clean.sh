#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
# wsl_deploy_v5_clean.sh
# Deploys QDs TokenContract to Aztec Testnet V5 using the
# isolated .aztec-v5-sdk directory which has Linux-native node_modules.
# 
# SECURITY: No secret keys hardcoded. Must be passed as env var.
# ═══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Validate environment ─────────────────────────────────────────
if [ -z "${AZTEC_RELAYER_SECRET_KEY:-}" ]; then
  echo "❌ ERROR: AZTEC_RELAYER_SECRET_KEY is not set."
  echo "   Please export it before running this script:"
  echo "   export AZTEC_RELAYER_SECRET_KEY=0x<your-32-byte-hex>"
  exit 1
fi

# ── Setup Node via NVM ───────────────────────────────────────────
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
source "$NVM_DIR/nvm.sh"
nvm use 20

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   WHALE NETWORK — Aztec Testnet V5 Deployment               ║"
echo "║   Target: QDs TokenContract                                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "  Node: $(node --version)"
echo "  npm:  $(npm --version)"
echo ""

# ── Enter the isolated SDK directory ────────────────────────────
# This dir has its OWN node_modules installed natively on Linux.
# We never touch the root Windows node_modules.
SDK_DIR="/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"

cd "$SDK_DIR"
echo "  Working dir: $SDK_DIR"
echo ""

# ── Verify SDK node_modules are present ─────────────────────────
if [ ! -d "node_modules/@aztec/aztec.js" ]; then
  echo "  ⚠️  node_modules not found. Running npm install (Linux-native)..."
  npm install --prefer-offline 2>&1 | tail -5
else
  echo "  ✅ SDK node_modules present (Linux-native)."
fi

echo ""

# ── Verify key artifacts are compiled ───────────────────────────
REGISTRY_JSON="/mnt/d/Projects/Wallet Human Polymarket ID/noir-projects/contracts/registry-contract/target/provenance_registry-ProvenanceRegistry.json"
PAYMASTER_JSON="/mnt/d/Projects/Wallet Human Polymarket ID/noir-projects/contracts/paymaster-contract/target/native_paymaster-NativePaymaster.json"

if [ ! -f "$REGISTRY_JSON" ]; then
  echo "  ❌ ProvenanceRegistry artifact not found at: $REGISTRY_JSON"
  exit 1
fi
if [ ! -f "$PAYMASTER_JSON" ]; then
  echo "  ❌ NativePaymaster artifact not found at: $PAYMASTER_JSON"
  exit 1
fi
echo "  ✅ Contract artifacts verified."
echo ""

# ── Step 1: Verify node connectivity ────────────────────────────
echo "  [PRE-FLIGHT] Testing Aztec node connectivity..."
node query-node.mjs 2>&1 | head -20 || {
  echo "  ⚠️  Node query failed (non-fatal, will try deploy anyway)"
}
echo ""

# ── Step 2: Deploy QDs Token ────────────────────────────────────
echo "  [DEPLOY] Starting QDs TokenContract deployment..."
echo "           (ZK proof generation may take 60-300s)"
echo ""
node deploy-qds.mjs

echo ""
echo "  ✅ Deploy script completed."
