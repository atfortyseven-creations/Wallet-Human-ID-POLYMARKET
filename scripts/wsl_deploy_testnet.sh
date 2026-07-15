#!/bin/bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 20
cd "/mnt/d/Projects/Wallet Human Polymarket ID"
npm install @esbuild/linux-x64 --no-save --legacy-peer-deps
npx tsx scripts/deploy-system-aztec.ts
