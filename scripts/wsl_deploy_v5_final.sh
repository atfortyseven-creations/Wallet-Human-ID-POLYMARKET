#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# wsl_deploy_v5_final.sh
#
# Deploys QDs TokenContract to Aztec Testnet V5 from the isolated SDK dir.
# Uses SDK v5.0.0-nightly.20260714 with Linux-native node_modules.
#
# SECURITY GUARANTEES:
#   - No secrets hardcoded anywhere in this script or in deploy-infra-v5.mjs
#   - Secret key loaded exclusively from AZTEC_RELAYER_SECRET_KEY env var
#   - ephemeral: true — no wallet state persists to disk after execution
#   - No network requests other than to the official Aztec V5 Testnet RPC
#   - No npm installs at runtime (uses pre-installed Linux-native modules)
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── Validate required secret ─────────────────────────────────────────────
if [ -z "${AZTEC_RELAYER_SECRET_KEY:-}" ]; then
  echo ""
  echo "  ❌ ERROR: AZTEC_RELAYER_SECRET_KEY is not set."
  echo ""
  echo "  Please run:"
  echo "    export AZTEC_RELAYER_SECRET_KEY=0x<your-64-char-hex-fr>"
  echo ""
  exit 1
fi

# ── Setup Node 20 via NVM ─────────────────────────────────────────────────
export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
source "$NVM_DIR/nvm.sh"
nvm use 20 --silent

echo ""
echo "  Node: $(node --version)  |  npm: $(npm --version)"

# ── SDK directory (isolated — has Linux-native node_modules) ─────────────
readonly SDK_DIR="/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"
cd "$SDK_DIR"

# ── Sanity check: verify core SDK package is present ─────────────────────
if [ ! -f "node_modules/@aztec/aztec.js/package.json" ]; then
  echo "  ❌ SDK node_modules not found. Running: npm install"
  npm install --prefer-offline
fi

# ── Sanity check: verify deploy script exists ─────────────────────────────
if [ ! -f "deploy-infra-v5.mjs" ]; then
  echo "  ❌ deploy-infra-v5.mjs not found in $SDK_DIR"
  exit 1
fi

# ── Execute deployment ────────────────────────────────────────────────────
echo ""
node --experimental-vm-modules deploy-infra-v5.mjs
