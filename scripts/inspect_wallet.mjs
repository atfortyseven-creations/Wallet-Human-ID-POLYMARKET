import * as wallet from '@aztec/aztec.js/wallet';
import * as aztecjs from '@aztec/aztec.js';
console.log('Wallet exports:', Object.keys(wallet));
console.log('Account exports:', Object.keys(aztecjs).filter(k => k.toLowerCase().includes('wallet')));
