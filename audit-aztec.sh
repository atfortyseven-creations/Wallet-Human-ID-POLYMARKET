#!/bin/bash
echo "=== AZTEC API ROUTES ==="
find . -path ./node_modules -prune -o -path ./.next -prune -o -type f \( -name "*.ts" -o -name "*.tsx" \) -print | xargs grep -li "aztec" 2>/dev/null | grep -v node_modules | grep -v ".next"

echo ""
echo "=== AZTEC API DIRS ==="
find ./app/api -type d -name "*aztec*" 2>/dev/null

echo ""
echo "=== LIB AZTEC DIR ==="
ls ./lib/aztec/ 2>/dev/null

echo ""
echo "=== ENV AZTEC VARS ==="
grep -i "AZTEC" .env 2>/dev/null
