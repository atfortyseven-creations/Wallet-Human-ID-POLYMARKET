#!/bin/bash
export HOME=/home/atfortyseven
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$HOME/.nvm/versions/node/v20.20.2/bin

WORK_DIR="/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"
cd "$WORK_DIR"

node -e "
const p = require('./node_modules/@aztec/foundation/package.json');
console.log(JSON.stringify(p.exports, null, 2));
" 2>&1
