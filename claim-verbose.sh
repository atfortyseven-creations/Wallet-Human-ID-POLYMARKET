#!/bin/bash
set -x
curl -fsSL https://raw.githubusercontent.com/NethermindEth/aztec-faucet/main/sh/testnet/claim.sh | bash -s -- \
  --secret 0x17a64f77a35c80d9e351aeca664e43eb67541a1e32998046e9e868ac63a5645f \
  --claim-amount 100000000000000000000 \
  --claim-secret 0x291e322a2c37037a707b0b939561e5bd2b1cb2260a287ea6a35f371c225752ea \
  --message-leaf-index 102594560
echo "Exit: $?"
