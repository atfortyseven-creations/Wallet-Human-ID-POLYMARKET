#!/bin/bash
export HOME=/home/atfortyseven
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

TX_HASH="0xe5b1367d52de413300bc2a55985123e577c2ca65eadc8a2715d5eb062ccb4d2f"

echo "[*] Trying Ankr RPC..."
RECEIPT=$(curl -sf -X POST "https://rpc.ankr.com/eth_sepolia" \
  -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getTransactionReceipt\",\"params\":[\"${TX_HASH}\"],\"id\":1}" 2>&1)
echo "Ankr result: $RECEIPT"

echo ""
echo "[*] Trying Cloudflare RPC..."
RECEIPT2=$(curl -sf -X POST "https://ethereum-sepolia-rpc.publicnode.com" \
  -H "Content-Type: application/json" \
  --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getTransactionReceipt\",\"params\":[\"${TX_HASH}\"],\"id\":1}" 2>&1)
echo "Cloudflare result (first 2000 chars): ${RECEIPT2:0:2000}"
