#!/bin/bash
export HOME=/home/atfortyseven
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

rm -rf /tmp/aztec-cli-temp
mkdir -p /tmp/aztec-cli-temp
cd /tmp/aztec-cli-temp
npm init -y
npm install --no-fund --no-audit @aztec/cli@5.0.0-rc.2
npx aztec get-canonical-sponsored-fpc-address
