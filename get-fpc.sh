#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent
./node_modules/.bin/aztec get-canonical-sponsored-fpc-address -r https://v5.testnet.rpc.aztec-labs.com
