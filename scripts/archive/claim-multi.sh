#!/bin/bash
# Try multiple Aztec testnet RPC endpoints
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

SECRET="0x17a64f77a35c80d9e351aeca664e43eb67541a1e32998046e9e868ac63a5645f"
AMOUNT="100000000000000000000"
CLAIM_SECRET="0x173536d26d3689e0d85a7939e0d47f0c3b01b0dd48587319a86c8e7a3ef5fa82"
LEAF_INDEX="102637568"

ENDPOINTS=(
  "https://rpc.testnet.aztec-labs.com"
  "https://aztec-mainnet.drpc.org"
  "https://api.aztec.network/aztec-mainnet/v1"
)

MAX_RETRIES=20
INTERVAL=20

for i in $(seq 1 $MAX_RETRIES); do
    for ENDPOINT in "${ENDPOINTS[@]}"; do
        echo ""
        echo "=== Attempt $i, endpoint: $ENDPOINT ==="
        
        OUTPUT=$(AZTEC_NODE_URL="$ENDPOINT" curl -fsSL https://raw.githubusercontent.com/NethermindEth/aztec-faucet/main/sh/testnet/claim.sh | AZTEC_NODE_URL="$ENDPOINT" bash -s -- \
          --secret "$SECRET" \
          --claim-amount "$AMOUNT" \
          --claim-secret "$CLAIM_SECRET" \
          --message-leaf-index "$LEAF_INDEX" 2>&1)
        
        echo "$OUTPUT" | tail -5
        
        if echo "$OUTPUT" | grep -q "✓"; then
            echo ""
            echo "=== SUCCESS! Fee Juice claimed! ==="
            exit 0
        fi
    done
    
    echo "All endpoints failed. Waiting ${INTERVAL}s..."
    sleep $INTERVAL
done

echo "Max retries reached."
exit 1
