#!/bin/sh
export PATH="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin:$PATH"
cd "/mnt/d/Projects/Wallet Human Polymarket ID"
npm install @esbuild/linux-x64 --no-save --legacy-peer-deps
./scripts/wsl_pipeline.sh
