#!/bin/bash
export PATH="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd "/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"

echo "📦 Installing Aztec SDK 5.0.0-nightly.20260714..."
npm install 2>&1 | tail -10
echo "Done."
