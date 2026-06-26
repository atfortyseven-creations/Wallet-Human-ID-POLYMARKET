import { EmbeddedWallet } from '@aztec/wallets/embedded';
import { TokenContract } from '@aztec/noir-contracts.js/Token';

// Check EmbeddedWallet
console.log('EmbeddedWallet:', typeof EmbeddedWallet);
console.log('EmbeddedWallet.create:', typeof EmbeddedWallet.create);

// Check prototype chain for getContractClassMetadata
let proto = EmbeddedWallet.prototype;
let found = false;
while (proto) {
  if (Object.prototype.hasOwnProperty.call(proto, 'getContractClassMetadata')) {
    console.log('getContractClassMetadata found on:', proto.constructor?.name);
    found = true;
    break;
  }
  proto = Object.getPrototypeOf(proto);
}
if (!found) console.log('getContractClassMetadata NOT found in prototype chain!');

// Check TokenContract.deploy signature
console.log('TokenContract:', typeof TokenContract);
console.log('TokenContract.deploy:', typeof TokenContract.deploy);
