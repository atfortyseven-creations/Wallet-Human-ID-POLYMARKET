const fs = require('fs');
const submodules = ['abi', 'account', 'addresses', 'authorization', 'block', 'contracts', 'crypto', 'deployment', 'ethereum', 'events', 'fee', 'fields', 'keys', 'log', 'messaging', 'node', 'note', 'protocol', 'trees', 'tx', 'utils', 'wallet'];
let found = false;
for (const sub of submodules) {
  try {
    const mod = require('@aztec/aztec.js/dest/api/' + sub + '.js');
    if (mod.createPXEClient) {
      console.log('Found createPXEClient in @aztec/aztec.js/' + sub);
      found = true;
    }
  } catch(e) {}
}
if (!found) {
  console.log('Not found in aztec.js submodules');
}
