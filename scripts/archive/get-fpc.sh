#!/bin/bash
cd "/mnt/d/Projects/Wallet Human Polymarket ID"
git show HEAD~1:scripts/deploy-qds-token.mjs | grep SPONSORED_FPC > /tmp/fpc.txt
cat /tmp/fpc.txt
