#!/bin/bash
set -e
export NVM_DIR="$HOME/.nvm"

echo "=== Setting up Node.js in WSL ==="

# Install nvm if not present
if [ ! -d "$NVM_DIR" ]; then
  echo "Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi

source "$NVM_DIR/nvm.sh"

# Install node 20 if not present
if ! nvm list | grep -q "v20"; then
  echo "Installing Node 20..."
  nvm install 20
fi

nvm use 20
echo "Node: $(node --version)"
echo "npm: $(npm --version)"

# Install aztec CLI
echo ""
echo "=== Installing @aztec/aztec@4.3.1 ==="
npm install -g @aztec/aztec@4.3.1 2>&1 | tail -10

echo ""
echo "=== Starting PXE ==="
AZTEC_NODE_URL=https://node.aztec.network PORT=8081 aztec start --pxe &
PXE_PID=$!
echo "PXE started (PID $PXE_PID), waiting 90s for it to be ready..."

for i in $(seq 1 30); do
  sleep 3
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/status 2>/dev/null || true)
  echo -n " [check $i: $STATUS]"
  if [ "$STATUS" = "200" ]; then
    echo ""
    echo "PXE ready!"
    break
  fi
done
echo ""

echo "=== Checking PXE Node Info ==="
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"pxe_getNodeInfo","params":[],"id":1}' \
  http://localhost:8081 | python3 -m json.tool || true

echo ""
echo "PXE is running. Now running deploy script..."

# Change to project directory (mounted as /mnt/d/...)
PROJECT_DIR="/mnt/d/Projects/Wallet Human Polymarket ID"
cd "$PROJECT_DIR"

AZTEC_PXE_URL=http://localhost:8081 \
AZTEC_RELAYER_SECRET_KEY=0x0b2cda0c07982cced5c5bbbc01dc76a5b2ef4e8111926bb4d8a14f15104d8e36 \
  npx tsx scripts/deploy-qds-token.ts

echo ""
echo "=== Stopping PXE ==="
kill $PXE_PID 2>/dev/null || true
