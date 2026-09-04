fetch('https://node.aztec.network/status')
  .then(r => { console.log('status:', r.status); return r.text(); })
  .then(t => console.log('body:', t))
  .catch(e => console.error('error:', e.message));
