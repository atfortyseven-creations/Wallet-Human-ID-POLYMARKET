import { fileURLToPath } from 'url';
import { dirname } from 'path';

export async function findWallet() {
  const glob = await import('glob');
  const path = await import('path');
  const files = glob.sync('node_modules/@aztec/aztec.js/dest/**/*.js');
  
  for (const f of files) {
    try {
      const ex = await import('./' + f);
      Object.values(ex).forEach(V => {
        if (typeof V === 'function' && V.prototype && typeof V.prototype.sendTx === 'function') {
          console.log('FOUND WALLET in:', f, V.name);
        }
      });
    } catch(e) {}
  }
}
findWallet();
