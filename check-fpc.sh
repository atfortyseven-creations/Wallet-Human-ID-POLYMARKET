#!/bin/bash
export HOME=/home/atfortyseven
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

cd "/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"
npx aztec get-canonical-sponsored-fpc-address --help
