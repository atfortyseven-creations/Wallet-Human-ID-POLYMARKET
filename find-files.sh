#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

# Find all JS files containing setHeader or anchorBlock
grep -rl "setHeader\|anchorBlock" /mnt/d/Projects/"Wallet Human Polymarket ID"/node_modules/@aztec/pxe/
