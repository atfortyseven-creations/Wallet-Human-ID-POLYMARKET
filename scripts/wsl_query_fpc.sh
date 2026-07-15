#!/bin/bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 20 --silent
cd "/mnt/d/Projects/Wallet Human Polymarket ID/.aztec-v5-sdk"

node -e "
import('@aztec/aztec.js/node').then(async m => {
  const node = m.createAztecNodeClient('https://v5.testnet.rpc.aztec-labs.com/');
  const addr = '0x0628377e98bca5913dc86765ad0758f7b7aa83eac49079c6fba125807b393fe1';
  const { AztecAddress } = await import('@aztec/stdlib/aztec-address');
  const fpcAddress = AztecAddress.fromStringUnsafe(addr);
  const instance = await node.getContract(fpcAddress);
  console.log('Contract instance:', instance);
}).catch(console.error);
"
