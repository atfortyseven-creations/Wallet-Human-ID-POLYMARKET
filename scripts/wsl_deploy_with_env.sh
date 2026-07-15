#!/bin/bash
# Reads AZTEC_RELAYER_SECRET_KEY from .env and runs the deploy
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 20 --silent

ENV_FILE="/mnt/d/Projects/Wallet Human Polymarket ID/.env"
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | grep 'AZTEC_RELAYER_SECRET_KEY' | xargs)
fi

exec bash "/mnt/d/Projects/Wallet Human Polymarket ID/scripts/wsl_deploy_v5_final.sh"
