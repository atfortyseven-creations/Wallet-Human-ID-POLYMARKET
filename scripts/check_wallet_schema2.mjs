// What methods does the WalletSchema define?
import { WalletSchema } from '@aztec/aztec.js/wallet';
console.log('WalletSchema:', WalletSchema);
console.log('WalletSchema type:', typeof WalletSchema);
// Try shape on zod object  
if (WalletSchema && typeof WalletSchema === 'object') {
  const keys = Object.keys(WalletSchema);
  console.log('WalletSchema obj keys:', keys);
}
