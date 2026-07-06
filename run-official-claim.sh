#!/bin/bash
export HOME=/home/atfortyseven
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use 20

SECRET="0x2153251234512341234123412341234123412341234123412341234123412345"

curl -fsSL https://raw.githubusercontent.com/NethermindEth/aztec-faucet/main/sh/testnet/claim.sh | sh -s -- \
  --secret $SECRET \
  --claim-amount 100000000000000000000 \
  --claim-secret 0x2ead062e3b6b73f67ce37ad0b51d028c9c112470dd69f2a2126ae97e0449e97c \
  --message-leaf-index 14067758
