#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent
cd "/mnt/d/Projects/Wallet Human Polymarket ID"
export AZTEC_RELAYER_SECRET_KEY="2153251234512341234123412341234123412341234123412341234123412345"
export SPONSORED_FPC_ADDRESS="0x08b888c4be63ed67f61a622fdd013ea028326bac22a8982a3b5a7e9ec62f765b"
node --no-warnings --experimental-vm-modules scripts/deploy-qds-token.mjs
