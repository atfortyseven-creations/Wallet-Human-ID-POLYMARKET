#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent
cd "/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"
export AZTEC_RELAYER_SECRET_KEY="2153251234512341234123412341234123412341234123412341234123412345"
node --no-warnings --experimental-vm-modules deploy-qds.mjs
