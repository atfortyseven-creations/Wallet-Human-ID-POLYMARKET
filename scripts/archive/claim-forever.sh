#!/bin/bash
# Long-running claim retry - runs until success
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

LOGFILE="/tmp/aztec-claim.log"
echo "Started at $(date)" > "$LOGFILE"

SECRET="0x17a64f77a35c80d9e351aeca664e43eb67541a1e32998046e9e868ac63a5645f"
AMOUNT="100000000000000000000"

# All drip secrets - try all of them each round
declare -A CLAIMS
CLAIMS["102637568"]="0x173536d26d3689e0d85a7939e0d47f0c3b01b0dd48587319a86c8e7a3ef5fa82"
CLAIMS["102663168"]="0x162273f0ce546496d75080e120d2ee55b6b2de680e7d7f007ae74e6d3a3472ad"

i=0
while true; do
    i=$((i+1))
    echo "" | tee -a "$LOGFILE"
    echo "=== Round $i at $(date) ===" | tee -a "$LOGFILE"

    for LEAF in "${!CLAIMS[@]}"; do
        CSECRET="${CLAIMS[$LEAF]}"
        echo "Trying leaf=$LEAF..." | tee -a "$LOGFILE"

        OUTPUT=$(curl -fsSL https://raw.githubusercontent.com/NethermindEth/aztec-faucet/main/sh/testnet/claim.sh | bash -s -- \
          --secret "$SECRET" \
          --claim-amount "$AMOUNT" \
          --claim-secret "$CSECRET" \
          --message-leaf-index "$LEAF" 2>&1)

        echo "$OUTPUT" | tail -3 | tee -a "$LOGFILE"

        if echo "$OUTPUT" | grep -q "✓"; then
            echo "" | tee -a "$LOGFILE"
            echo "=== SUCCESS! Fee Juice claimed! Leaf=$LEAF ===" | tee -a "$LOGFILE"
            exit 0
        fi
    done

    echo "All failed. Waiting 30s..." | tee -a "$LOGFILE"
    sleep 30
done
