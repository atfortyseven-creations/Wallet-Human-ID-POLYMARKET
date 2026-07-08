#!/bin/bash
echo "=== FILES WITH MORALIS ==="
grep -rl "moralis\|MORALIS" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next . 2>/dev/null

echo ""
echo "=== .ENV MORALIS KEYS ==="
grep -i "MORALIS" .env 2>/dev/null | head -20

echo ""
echo "=== PACKAGE.JSON MORALIS ==="
grep -i "moralis" package.json 2>/dev/null
