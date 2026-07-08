#!/bin/bash
curl -v -X POST https://faucet.testnet.aztec-labs.com/ \
  -H "Content-Type: application/json" \
  -d '{"address": "0x17aabf46823538f3e08360ea23813798508481f0e4341ba19cb43028bd5ac87f"}'
