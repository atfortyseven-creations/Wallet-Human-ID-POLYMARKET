import * as aztec from '@aztec/aztec.js';
import * as wallet from '@aztec/aztec.js/wallet';
import * as account from '@aztec/aztec.js/account';

console.log('aztec keys:', Object.keys(aztec).filter(k => k.includes('Wallet') || k.includes('Account')));
console.log('wallet keys:', Object.keys(wallet).filter(k => k.includes('Wallet') || k.includes('Account')));
console.log('account keys:', Object.keys(account).filter(k => k.includes('Wallet') || k.includes('Account')));
