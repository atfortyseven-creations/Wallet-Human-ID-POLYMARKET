// Deep analysis: SponsoredFeePaymentMethod, TokenContract deploy signature, AccountManager.create
// Also inspect: SendOptions structure and the `from` field requirement

const modules2 = [
  '@aztec/aztec.js/fee',
  '@aztec/pxe/client/lazy',
  '@aztec/wallets/embedded',
];

async function main() {
  // Check SponsoredFeePaymentMethod constructor
  const { SponsoredFeePaymentMethod } = await import('@aztec/aztec.js/fee');
  console.log('SponsoredFeePaymentMethod proto keys:', Object.getOwnPropertyNames(SponsoredFeePaymentMethod.prototype));

  // Check @aztec/pxe/client/lazy
  try {
    const pxeClientLazy = await import('@aztec/pxe/client/lazy');
    console.log('\n@aztec/pxe/client/lazy exports:', Object.keys(pxeClientLazy));
  } catch(e) {
    console.log('\n@aztec/pxe/client/lazy ERROR:', e.message);
  }

  // Check what @aztec/wallets/embedded actually exports (hits the Windows native error but let's see)
  try {
    const embWallet = await import('@aztec/wallets/embedded');
    console.log('\n@aztec/wallets/embedded exports:', Object.keys(embWallet));
  } catch(e) {
    console.log('\n@aztec/wallets/embedded ERROR:', e.message.slice(0,200));
  }

  // Check TokenContract deploy
  const { TokenContract } = await import('@aztec/noir-contracts.js/Token');
  console.log('\nTokenContract static methods:', Object.getOwnPropertyNames(TokenContract).filter(k => typeof TokenContract[k] === 'function'));
  
  // Check DeployMethod
  const { DeployMethod } = await import('@aztec/aztec.js/contracts');
  console.log('\nDeployMethod proto methods:', Object.getOwnPropertyNames(DeployMethod.prototype));
  
  // Check AccountManager
  const { AccountManager } = await import('@aztec/aztec.js/wallet');
  console.log('\nAccountManager proto methods:', Object.getOwnPropertyNames(AccountManager.prototype));
  console.log('AccountManager static methods:', Object.getOwnPropertyNames(AccountManager).filter(k => typeof AccountManager[k] === 'function'));
}

main().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
