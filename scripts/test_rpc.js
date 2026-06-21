const projectId = '47cce4049225582027fdeeecb2868ead';

// Test 1: WalletConnect relay
fetch('https://relay.walletconnect.com/?projectId=' + projectId)
  .then(r => console.log('WC Relay HTTP status:', r.status, r.statusText))
  .catch(e => console.log('WC Relay error:', e.message));

// Test 2: Reown verify
fetch('https://verify.walletconnect.com/v3/sessions?projectId=' + projectId)
  .then(r => console.log('WC Verify status:', r.status))
  .catch(e => console.log('WC Verify error:', e.message));

// Test 3: RPC endpoints
const rpcs = [
  'https://eth.llamarpc.com',
  'https://base.llamarpc.com',
  'https://bsc.publicnode.com',
];

rpcs.forEach(rpc => {
  fetch(rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
  })
    .then(r => r.json())
    .then(d => console.log(rpc, '=> block:', parseInt(d.result, 16)))
    .catch(e => console.log(rpc, '=> ERROR:', e.message));
});
