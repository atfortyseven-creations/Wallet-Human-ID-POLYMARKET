#!/bin/bash
# Retry claim every 30 seconds for up to 20 minutes
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

MAX_RETRIES=40
INTERVAL=30

echo "Will retry every ${INTERVAL}s for up to $((MAX_RETRIES * INTERVAL / 60)) minutes..."

for i in $(seq 1 $MAX_RETRIES); do
    echo ""
    echo "=== Attempt $i / $MAX_RETRIES ==="
    
    OUTPUT=$(curl -fsSL https://raw.githubusercontent.com/NethermindEth/aztec-faucet/main/sh/testnet/claim.sh | bash -s -- \
      --secret 0x17a64f77a35c80d9e351aeca664e43eb67541a1e32998046e9e868ac63a5645f \
      --claim-amount 100000000000000000000 \
      --claim-secret 0x173536d26d3689e0d85a7939e0d47f0c3b01b0dd48587319a86c8e7a3ef5fa82 \
      --message-leaf-index 102637568 2>&1)
    
    echo "$OUTPUT"
    
    if echo "$OUTPUT" | grep -q "✓"; then
        echo ""
        echo "SUCCESS! Fee Juice claimed!"
        exit 0
    fi
    
    if echo "$OUTPUT" | grep -q "No matching L1 to L2"; then
        echo "Message not yet on node. Waiting ${INTERVAL}s before retry..."
        sleep $INTERVAL
    else
        echo "Unexpected error. Stopping."
        exit 1
    fi
done

echo "Max retries reached."
exit 1
