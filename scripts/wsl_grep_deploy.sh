#!/bin/bash
grep -n 'DeployResultMined\|deployed\b\|send\b\|wait\b' \
  "/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk/node_modules/@aztec/aztec.js/dest/contract/deploy_method.d.ts" \
  | grep -v 'base64\|#sourceMapping'
