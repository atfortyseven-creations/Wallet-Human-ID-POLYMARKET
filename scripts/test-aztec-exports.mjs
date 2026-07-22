import * as aztec from '@aztec/aztec.js';
import * as pxe from '@aztec/pxe';
import * as accounts from '@aztec/accounts/schnorr';

console.log('aztec keys:', Object.keys(aztec));
// console.log('pxe keys:', Object.keys(pxe)); // Might fail if it has no default export
console.log('accounts keys:', Object.keys(accounts));
