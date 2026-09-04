#!/bin/bash
echo "Installing Aztec CLI..."
npm install -g @aztec/cli

echo "Navigating to circuits..."
cd /mnt/d/Projects/Wallet\ Human\ Polymarket\ ID/circuits

echo "Compiling Noir Contract..."
aztec-cli compile .

echo "Deploying to Aztec Mainnet..."
aztec-cli deploy ./target/ledger_circuits-QDsContract.json --rpc-url https://rpc.testnet.aztec-labs.com
