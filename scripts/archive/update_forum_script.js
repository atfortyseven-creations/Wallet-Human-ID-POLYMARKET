const fs = require('fs');
let file = fs.readFileSync('app/forum/new/page.tsx', 'utf8');
file = file.replace(
  'const { privateKey: storedPrivateKey } = useWalletStore.getState();',
  'const { privateKey: storedPrivateKey, address: actualWalletAddress } = useWalletStore.getState();'
);
file = file.replace(
  '      } else if (isLocalSystemWallet) {',
  '      } else if (isLocalSystemWallet || (actualWalletAddress && address && actualWalletAddress.toLowerCase() === address.toLowerCase() && !storedPrivateKey && isSystemHandshake)) {'
);
fs.writeFileSync('app/forum/new/page.tsx', file);
console.log('Forum updated.');
