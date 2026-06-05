const k = require('@aztec/aztec.js/dest/api/keys.js');
const keys = Object.keys(k).filter(x => x.toLowerCase().includes('sign') || x.toLowerCase().includes('derive') || x.toLowerCase().includes('key') || x.toLowerCase().includes('schnorr'));
console.log('Available key functions:');
console.log(keys.join('\n'));
