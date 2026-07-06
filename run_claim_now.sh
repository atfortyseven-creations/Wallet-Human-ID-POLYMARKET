#!/bin/bash
export HOME=/home/atfortyseven
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SECRET="0x15fa25927efea27a69bc92e624c43160a221f75355a297e64177d6ee37cbdb76"
CLAIM_AMOUNT="0x0000000000000000000000000000000000000000000000056bc75e2d63100000"
CLAIM_SECRET="0x253ce6a663b68df669f3db6c7dc9fd7360495da29aa2f804c742324126dee236"
LEAF_INDEX="14067758"
NODE_URL="https://v5.testnet.rpc.aztec-labs.com"

echo "[*] Claiming Fee Juice from Aztec bridge..."
echo "    Amount:     100 FeeJuice"
echo "    Leaf Index: $LEAF_INDEX"

# Download claim script fresh
curl -fsSL "https://raw.githubusercontent.com/NethermindEth/aztec-faucet/main/sh/testnet/claim.sh" \
  -o /tmp/aztec_claim.sh 2>&1

export AZTEC_NODE_URL="$NODE_URL"

bash /tmp/aztec_claim.sh \
  --secret "$SECRET" \
  --claim-amount "$CLAIM_AMOUNT" \
  --claim-secret "$CLAIM_SECRET" \
  --message-leaf-index "$LEAF_INDEX" \
  2>&1
