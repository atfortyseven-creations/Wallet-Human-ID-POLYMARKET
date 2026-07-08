import * as aztec from '@aztec/aztec.js';
console.log("AZTEC_JS EXPORTS:");
console.log(Object.keys(aztec).filter(k => k.toLowerCase().includes('pxe')));

try {
  import('@aztec/aztec.js/wallet').then(wallet => {
    console.log("WALLET EXPORTS:");
    console.log(Object.keys(wallet).filter(k => k.toLowerCase().includes('pxe')));
  });
} catch (e) {}
