import * as aztec from '@aztec/aztec.js';
import * as account from '@aztec/aztec.js/account';
import * as wallet from '@aztec/aztec.js/wallet';

console.log('aztec keys:', Object.keys(aztec).filter(k => k.includes('Wallet') || k.includes('Account')));
console.log('account keys:', Object.keys(account).filter(k => k.includes('Wallet') || k.includes('Account')));
console.log('wallet keys:', Object.keys(wallet).filter(k => k.includes('Wallet') || k.includes('Account')));

// Let's also check what gets returned by createAccountManager
if ('AccountManager' in aztec) {
  console.log('AccountManager exists in aztec');
}

// Let's check if there is an AccountWalletWithSecretKey
if ('AccountWalletWithSecretKey' in account) {
  console.log('AccountWalletWithSecretKey exists in account');
} else {
  console.log('AccountWalletWithSecretKey NOT in account');
}
