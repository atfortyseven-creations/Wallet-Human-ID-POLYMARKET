#!/bin/bash
export PATH="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd "/mnt/d/Projects/Wallet Human Polymarket ID"
set -a
source .env
set +a

cd .aztec-v5-sdk
node deploy-qds.mjs
