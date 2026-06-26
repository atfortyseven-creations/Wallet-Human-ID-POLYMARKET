#!/bin/bash
source ~/.nvm/nvm.sh
nvm use 20 --silent

echo "=== Testing V5 shim node_getBlockHeader return ==="
node --input-type=module << 'EOF'
import { createAztecNodeClient } from '@aztec/aztec.js/node';
import { makeFetch } from '@aztec/foundation/json-rpc/client';

const NODE_URL = 'https://v5.testnet.rpc.aztec-labs.com';

// V5 compat fetch shim
function createV5CompatFetch(nodeUrl) {
  const rawFetch = async (method, params) => {
    const resp = await fetch(nodeUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    return resp.json();
  };

  const transformRequest = async (req) => {
    const { id, method, params } = req;
    
    if (method === 'node_getL2Tips') {
      const data = await rawFetch('node_getChainTips', []);
      if (data.error) return { jsonrpc: '2.0', id, error: data.error };
      return { jsonrpc: '2.0', id, result: data.result };
    }
    
    if (method === 'node_getBlockHeader') {
      const data = await rawFetch('node_getBlock', params);
      if (data.error) return { jsonrpc: '2.0', id, error: data.error };
      const result = data.result ? data.result.header : null;
      return { jsonrpc: '2.0', id, result };
    }
    
    if (method === 'node_getCheckpointedBlocks') {
      return { jsonrpc: '2.0', id, result: [] };
    }

    if (method === 'node_getCheckpoints') {
      const data = await rawFetch('node_getCheckpoints', params);
      if (data.error) {
        console.warn('[shim] getCheckpoints error:', data.error.message);
        return { jsonrpc: '2.0', id, result: [] };
      }
      return { jsonrpc: '2.0', id, result: data.result };
    }
    
    const data = await rawFetch(method, params);
    if (data.error) return { jsonrpc: '2.0', id, error: data.error };
    return { jsonrpc: '2.0', id, result: data.result };
  };

  return async (host, requests, extraHeaders = {}) => {
    const responses = await Promise.all(requests.map(req => transformRequest(req)));
    return {
      response: responses,
      headers: new Headers({ 'content-type': 'application/json' }),
    };
  };
}

const v5Fetch = createV5CompatFetch(NODE_URL);
const node = createAztecNodeClient(NODE_URL, {}, v5Fetch);

console.log('Testing getBlockNumber...');
const bn = await node.getBlockNumber();
console.log('Block number:', bn);

console.log('\nTesting getL2Tips (→ getChainTips)...');
const tips = await node.getL2Tips();
console.log('L2Tips:', JSON.stringify(tips, null, 2));

console.log('\nTesting getBlockHeader(1) (→ getBlock.header)...');
const header = await node.getBlockHeader(1);
console.log('BlockHeader type:', typeof header);
console.log('Has toBuffer:', typeof header?.toBuffer);
console.log('Has getBlockNumber:', typeof header?.getBlockNumber);
console.log('Header class:', header?.constructor?.name);
if (header) {
  try {
    const buf = header.toBuffer();
    console.log('toBuffer() ok, length:', buf.length);
  } catch(e) {
    console.log('toBuffer() failed:', e.message);
  }
}
EOF
