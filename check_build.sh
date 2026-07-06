#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use node
cd "/mnt/d/Projects/Wallet Human Polymarket ID"
npx tsc --noEmit
