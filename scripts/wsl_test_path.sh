#!/bin/sh
# CRITICAL: export PATH before ANYTHING else
export PATH="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin:$PATH"

echo "=== PATH test ==="
echo "which node: $(which node)"
echo "which npm: $(which npm)"
echo "which npx: $(which npx)"
echo "node: $(node --version)"
echo "npm:  $(npm --version)"
echo "npx:  $(npx --version)"
echo "TEST OK"
