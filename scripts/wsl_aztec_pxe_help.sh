#!/bin/sh
export PATH="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin:$PATH"
# Check what modules aztec start supports
echo "=== Module flags ==="
aztec start --help 2>&1 | grep -E "^\s+--[a-z]" | grep -v "sequencer\|proverNode\|archiver\|p2p\|node\.\|txe\|pxe\." | head -40
echo ""
echo "=== Looking for pxe flag ==="
aztec start --help 2>&1 | grep -i "pxe"
