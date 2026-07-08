#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

curl -fsSL https://raw.githubusercontent.com/NethermindEth/aztec-faucet/main/sh/testnet/claim.sh | bash -s -- \
  --secret 0x17a64f77a35c80d9e351aeca664e43eb67541a1e32998046e9e868ac63a5645f \
  --claim-amount 100000000000000000000 \
  --claim-secret 0x162273f0ce546496d75080e120d2ee55b6b2de680e7d7f007ae74e6d3a3472ad \
  --message-leaf-index 102663168
