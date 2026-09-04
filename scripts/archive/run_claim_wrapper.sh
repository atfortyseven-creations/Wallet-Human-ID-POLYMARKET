#!/bin/bash
export HOME=/home/atfortyseven
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$HOME/.nvm/versions/node/v20.20.2/bin
export LOG_LEVEL=silent

WORK_DIR="/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"
cd "$WORK_DIR"

export NODE_URL="https://node.aztec.network/"
export SECRET="0x15fa25927efea27a69bc92e624c43160a221f75355a297e64177d6ee37cbdb76"
export CLAIM_AMOUNT="100000000000000000000"
export CLAIM_SECRET="0x253ce6a663b68df669f3db6c7dc9fd7360495da29aa2f804c742324126dee236"
export LEAF_INDEX="14067758"

node claim-feejuice.mjs 2>&1
