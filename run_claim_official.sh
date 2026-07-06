#!/bin/bash
export HOME=/home/atfortyseven
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$HOME/.nvm/versions/node/v20.20.2/bin

WORK_DIR="/mnt/d/Projects/Wallet Human Polymarket ID"
cd "$WORK_DIR"

export SECRET="0x15fa25927efea27a69bc92e624c43160a221f75355a297e64177d6ee37cbdb76"
export CLAIM_AMOUNT="0x0000000000000000000000000000000000000000000000056bc75e2d63100000"
export CLAIM_SECRET="0x253ce6a663b68df669f3db6c7dc9fd7360495da29aa2f804c742324126dee236"
export LEAF_INDEX="14067758"

# We run the command with bash -x to see exactly where it fails silently
curl -fsSL https://raw.githubusercontent.com/NethermindEth/aztec-faucet/main/sh/testnet/claim.sh > /tmp/aztec_claim.sh
bash -x /tmp/aztec_claim.sh \
  --secret "$SECRET" \
  --claim-amount "$CLAIM_AMOUNT" \
  --claim-secret "$CLAIM_SECRET" \
  --message-leaf-index "$LEAF_INDEX" \
  2>&1
