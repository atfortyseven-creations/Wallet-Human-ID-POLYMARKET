#!/bin/bash
export HOME=/home/atfortyseven
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

TX_HASH="0xe5b1367d52de413300bc2a55985123e577c2ca65eadc8a2715d5eb062ccb4d2f"

# Fetch full receipt
RECEIPT=$(curl -sf -X POST "https://ethereum-sepolia-rpc.publicnode.com" \
  -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getTransactionReceipt\",\"params\":[\"${TX_HASH}\"],\"id\":1}")

echo "=== FULL LOGS ===" 
echo "$RECEIPT" | python3 -c "
import json,sys
d = json.load(sys.stdin)
logs = d['result']['logs']
print(f'Total logs: {len(logs)}')
for i, log in enumerate(logs):
    print(f'')
    print(f'--- Log {i} ---')
    print(f'  address: {log[\"address\"]}')
    print(f'  topics:')
    for t in log['topics']:
        print(f'    {t}')
    print(f'  data: {log[\"data\"]}')
"
