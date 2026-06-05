import * as Aztec from '@aztec/aztec.js';
console.log(Object.keys(Aztec).filter(k => k.includes('Wallet') || k.includes('Account')));
