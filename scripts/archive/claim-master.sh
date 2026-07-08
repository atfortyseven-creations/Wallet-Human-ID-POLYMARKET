#!/bin/bash
# CLAIM MASTER - version definitiva con node path explicito
export NODE_BIN=/home/atfortyseven/.nvm/versions/node/v24.12.0/bin
export PATH=$NODE_BIN:$PATH

SECRET=""
AMOUNT=""
CLAIM_SECRET=""
LEAF_INDEX=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --secret) SECRET="$2"; shift 2 ;;
    --claim-amount) AMOUNT="$2"; shift 2 ;;
    --claim-secret) CLAIM_SECRET="$2"; shift 2 ;;
    --message-leaf-index) LEAF_INDEX="$2"; shift 2 ;;
    *) shift ;;
  esac
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AZTEC FEE JUICE CLAIM - MODO CUANTICO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  secret:       ${SECRET:0:20}..."
echo "  amount:       $AMOUNT"
echo "  claim-secret: ${CLAIM_SECRET:0:20}..."
echo "  leaf-index:   $LEAF_INDEX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd /home/atfortyseven/.aztec-devtools

$NODE_BIN/node /home/atfortyseven/.aztec-devtools/claim-fee-juice.mjs \
  --secret "$SECRET" \
  --claim-amount "$AMOUNT" \
  --claim-secret "$CLAIM_SECRET" \
  --message-leaf-index "$LEAF_INDEX" \
  --network testnet \
  --node-url "https://rpc.testnet.aztec-labs.com"
