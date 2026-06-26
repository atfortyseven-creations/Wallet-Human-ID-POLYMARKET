#!/bin/sh
export PATH="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin:$PATH"
NVM_LIB="/home/atfortyseven/.nvm/versions/node/v20.20.2/lib/node_modules/@aztec/aztec"

echo "=== aztec.sh content ==="
cat "$NVM_LIB/scripts/aztec.sh" 2>/dev/null | head -30

echo ""
echo "=== Available start module flags (grep start.js) ==="
grep -r "pxe\|--pxe\|startPxe\|PXE_PORT\|pxePort" "$NVM_LIB/dest/bin/" 2>/dev/null | head -30

echo ""
echo "=== Check start command source ==="
find "$NVM_LIB/dest" -name "*.js" | xargs grep -l "pxe" 2>/dev/null | head -5
