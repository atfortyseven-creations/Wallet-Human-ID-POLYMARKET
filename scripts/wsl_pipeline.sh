#!/bin/sh
# =============================================================
#  Aztec QDs Token Deploy — WSL2 Pipeline v5 (Pure ESM)
#  Uses NodeEmbeddedWallet + SponsoredFeePaymentMethod
#  No external PXE server required.
# =============================================================

export PATH="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin:$PATH"
PROJECT="/mnt/d/Projects/Wallet Human Polymarket ID"

# ── Config ────────────────────────────────────────────────────
SECRET_KEY="0x0b2cda0c07982cced5c5bbbc01dc76a5b2ef4e8111926bb4d8a14f15104d8e36"
NODE_URL="https://node.aztec.network"
SPONSORED_FPC="0x261366b3c0a9b4c30864629556cf282be409e6822b1f3a065fcb7e34f36d7880"

echo ""
echo "══════════════════════════════════════════════════════"
echo "  QDs Token Deploy — WSL2 Pipeline v5"
echo "══════════════════════════════════════════════════════"
echo "node: $(node --version)"
echo "npm:  $(npm --version)"
echo ""

cd "$PROJECT"

echo "▶  Running deploy-qds-token.mjs directly (pure ESM, no compilation)..."
echo ""

AZTEC_NODE_URL="$NODE_URL" \
AZTEC_RELAYER_SECRET_KEY="$SECRET_KEY" \
SPONSORED_FPC_ADDRESS="$SPONSORED_FPC" \
  node --experimental-vm-modules scripts/deploy-qds-token.mjs

DEPLOY_EXIT=$?

echo ""
echo "══════════════════════════════════════════════════════"
[ $DEPLOY_EXIT -eq 0 ] \
  && echo "  ✅  DEPLOY COMPLETE — copy vars above to Railway!" \
  || echo "  ❌  DEPLOY FAILED (exit $DEPLOY_EXIT)"
echo "══════════════════════════════════════════════════════"
echo ""
exit $DEPLOY_EXIT
