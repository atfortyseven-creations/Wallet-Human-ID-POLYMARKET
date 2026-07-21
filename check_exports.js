const m = require('./node_modules/@aztec/aztec.js');
const keys = Object.keys(m).filter(k => k.includes('PXE') || k.includes('Account') || k.includes('Schnorr') || k.includes('pxe'));
console.log(keys.join('\n'));
