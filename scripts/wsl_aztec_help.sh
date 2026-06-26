#!/bin/sh
export PATH="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin:$PATH"
echo "=== aztec start --help ==="
aztec start --help 2>&1
echo ""
echo "=== aztec --help ==="
aztec --help 2>&1
