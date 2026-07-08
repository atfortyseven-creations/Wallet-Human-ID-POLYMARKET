#!/bin/bash
# Extract claim parameters directly from the Sepolia L1 transaction receipt
# No need to wait for the faucet UI - parse the logs ourselves

export HOME=/home/atfortyseven
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

TX_HASH="0xe5b1367d52de413300bc2a55985123e577c2ca65eadc8a2715d5eb062ccb4d2f"
SEPOLIA_RPC="https://rpc.ankr.com/eth_sepolia"

echo "[*] Fetching Sepolia tx receipt to extract claim parameters..."
RECEIPT=$(curl -sf -X POST "$SEPOLIA_RPC" \
  -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getTransactionReceipt\",\"params\":[\"$TX_HASH\"],\"id\":1}")

echo "[*] Raw receipt logs:"
echo "$RECEIPT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
result = data.get('result', {})
logs = result.get('logs', [])
print(f'Total logs: {len(logs)}')
for i, log in enumerate(logs):
    print(f'--- Log {i} ---')
    print(f'  address: {log.get(\"address\")}')
    print(f'  topics: {log.get(\"topics\")}')
    print(f'  data: {log.get(\"data\")}')
"
