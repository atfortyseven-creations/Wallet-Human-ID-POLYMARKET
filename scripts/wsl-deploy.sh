#!/bin/bash
set -e

echo "========================================"
echo "  Aztec QDs Deploy - WSL2 Linux"
echo "========================================"

# 1. Install NVM + Node 20 if not present
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 20 via nvm..."
  export NVM_DIR="$HOME/.nvm"
  if [ ! -d "$NVM_DIR" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  fi
  source "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
else
  echo "Node already installed: $(node --version)"
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"

echo "Node: $(node --version)"
echo "NPM: $(npm --version)"

# 2. Install aztec globally
echo ""
echo "Installing @aztec/aztec@4.3.1..."
npm install -g @aztec/aztec@4.3.1 --silent 2>&1 | tail -5

echo "aztec binary: $(which aztec)"

# 3. Start PXE in background
echo ""
echo "Starting Aztec PXE connected to V5 Testnet..."
AZTEC_NODE_URL=https://v5.testnet.rpc.aztec-labs.com \
  aztec start --pxe --port 8081 &
PXE_PID=$!
echo "PXE PID: $PXE_PID"

# 4. Wait for PXE to be ready
echo "Waiting for PXE to be ready..."
for i in $(seq 1 60); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/status 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    echo "PXE is ready!"
    break
  fi
  echo -n "."
  sleep 3
done

echo ""
echo "PXE status: $(curl -s http://localhost:8081/status)"

# 5. Run deploy script
echo ""
echo "Deploying QDs TokenContract..."
AZTEC_PXE_URL=http://localhost:8081 \
AZTEC_RELAYER_SECRET_KEY=0x0b2cda0c07982cced5c5bbbc01dc76a5b2ef4e8111926bb4d8a14f15104d8e36 \
  aztec-wallet deploy token --args 0x0b2cda0c07982cced5c5bbbc01dc76a5b2ef4e8111926bb4d8a14f15104d8e36 "Quantum Dots" QDs 18 \
  --from 0x0b2cda0c07982cced5c5bbbc01dc76a5b2ef4e8111926bb4d8a14f15104d8e36 \
  --pxe http://localhost:8081 || echo "aztec-wallet not found, trying tsx..."

# 6. Cleanup
kill $PXE_PID 2>/dev/null || true
echo "Done."
