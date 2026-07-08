#!/bin/bash
# Cargar NVM y Node en WSL
export PATH="/home/atfortyseven/.nvm/versions/node/v20.20.2/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

cd "/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"

# Cargar variables de entorno del directorio superior
set -a
source ../.env
set +a

echo "🚀 Ejecutando V5 Native Deploy Script..."
node deploy-qds.mjs
