#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

# Check L2BlockStream.sync to understand ZodError path ["body"]
grep -n "body\|parseAsync\|ZodOptional\|blockStream\|L2Block" \
  /mnt/d/Projects/"Wallet Human Polymarket ID"/node_modules/@aztec/stdlib/dest/block/l2_block_stream.js | head -80
