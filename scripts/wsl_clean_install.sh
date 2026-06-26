#!/bin/sh
export PATH="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin:$PATH"

NVM_LIB="/home/atfortyseven/.nvm/versions/node/v20.20.2/lib/node_modules"
NVM_BIN="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin"

echo "=== Cleaning broken aztec install ==="
# Remove any partial/broken aztec install directories
rm -rf "$NVM_LIB/@aztec/aztec" 2>/dev/null && echo "Removed @aztec/aztec dir" || echo "Dir did not exist"
rm -rf "$NVM_LIB/@aztec/.aztec-"* 2>/dev/null && echo "Removed temp dirs" || echo "No temp dirs"
rm -f "$NVM_BIN/aztec" 2>/dev/null && echo "Removed aztec symlink" || echo "No symlink"

echo ""
echo "=== Clean install of @aztec/aztec@4.3.1 ==="
npm install -g @aztec/aztec@4.3.1

echo ""
echo "=== Result ==="
if [ -f "$NVM_BIN/aztec" ]; then
  echo "SUCCESS: aztec binary found at $NVM_BIN/aztec"
  ls -la "$NVM_BIN/aztec"
else
  echo "FAILED: aztec binary NOT found"
  ls "$NVM_BIN/" | sort
fi
