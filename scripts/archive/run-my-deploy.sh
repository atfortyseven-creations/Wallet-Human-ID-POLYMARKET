#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20
export AZTEC_RELAYER_SECRET_KEY=0x0b2cda0c07982cced5c5bbbc01dc76a5b2ef4e8111926bb4d8a14f15104d8e36
export AZTEC_NODE_URL=https://node.aztec.network
node scripts/deploy-qds-token.mjs
