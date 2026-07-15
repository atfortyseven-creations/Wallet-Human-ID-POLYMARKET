#!/bin/bash
set -euo pipefail

echo "=== Buscando aztec-nr lib.nr en cache de nargo ==="
find /home/atfortyseven -name "lib.nr" -path "*/aztec*" 2>/dev/null | head -20

echo ""
echo "=== Contenido de ~/nargo ==="
ls /home/atfortyseven/nargo/ 2>/dev/null || echo "No hay ~/nargo"

echo ""
echo "=== Buscando cache de nargo (git deps) ==="
find /home/atfortyseven -maxdepth 5 -name "*.nr" -path "*/aztec-nr*" 2>/dev/null | head -20

echo ""
echo "=== Buscando en ~/.cache ==="
find /home/atfortyseven/.cache -name "lib.nr" 2>/dev/null | head -10

echo ""
echo "=== Buscando en aztec versions dir ==="
find /home/atfortyseven/.aztec/versions/4.4.0 -name "lib.nr" 2>/dev/null | head -20

echo ""
echo "=== Buscando en whale-circuits para contratos de ejemplo ==="
find /home/atfortyseven/whale-circuits -name "*.nr" 2>/dev/null | head -20
