fetch('https://v5.testnet.rpc.aztec-labs.com/status')
  .then(r => { console.log('status:', r.status); return r.text(); })
  .then(t => console.log('body:', t))
  .catch(e => console.error('error:', e.message));
