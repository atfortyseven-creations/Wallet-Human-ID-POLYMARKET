#!/bin/bash
export PATH="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd "/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"

npx aztec-cli get-node-info --rpc-url https://v5.testnet.rpc.aztec-labs.com/
