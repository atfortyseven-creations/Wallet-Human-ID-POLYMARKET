#!/bin/bash
set -e
source ~/.nvm/nvm.sh
nvm use 20 --silent

SDK_DIR="/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"

echo "Checking SDK dir: $SDK_DIR"
if [ -f "$SDK_DIR/node_modules/@aztec/aztec.js/package.json" ]; then
  echo "SDK_INSTALLED"
  node -e "const p=require('$SDK_DIR/node_modules/@aztec/aztec.js/package.json'); console.log('version:', p.version);"
else
  echo "SDK_MISSING - installing now..."
  mkdir -p "$SDK_DIR"
  cd "$SDK_DIR"
  cat > package.json << 'EOF'
{"name":"aztec-v5-sdk","version":"1.0.0","type":"module","private":true}
EOF
  echo "Running npm install (verbose)..."
  npm install --loglevel=warn \
    @aztec/aztec.js@5.0.0-nightly.20260625 \
    @aztec/accounts@5.0.0-nightly.20260625 \
    @aztec/noir-contracts.js@5.0.0-nightly.20260625
  echo "INSTALL_DONE"
fi
