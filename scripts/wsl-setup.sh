#!/bin/bash
set -euo pipefail

echo "=== Instalando nvm y Node.js 20.19.0 ==="
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

nvm install 20.19.0
nvm use 20.19.0
nvm alias default 20.19.0

echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"

echo ""
echo "=== Instalando nargo (Noir compiler) ==="
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash

# Add nargo to PATH for this session
export PATH="$HOME/.nargo/bin:$PATH"

echo "Nargo version: $(nargo --version)"
echo "=== Setup completado con exito ==="
