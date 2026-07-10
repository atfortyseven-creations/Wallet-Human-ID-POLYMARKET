// Final analysis: check ContractFunctionInteraction.send() return type to fix txResult usage
async function main() {
  const { ContractFunctionInteraction } = await import('@aztec/aztec.js/contracts');
  console.log('ContractFunctionInteraction proto methods:',
    Object.getOwnPropertyNames(ContractFunctionInteraction.prototype));
  
  // Also check the import path for 'Fr' - there are two: aztec.js/fields and foundation/curves/bn254
  const fields = await import('@aztec/aztec.js/fields');
  console.log('\naztec.js/fields exports:', Object.keys(fields));
  
  // Check pxe/server PXE type
  try {
    const pxeServer = await import('@aztec/pxe/server');
    console.log('\n@aztec/pxe/server exports (first 15):', Object.keys(pxeServer).slice(0, 15));
  } catch(e) {
    console.log('\n@aztec/pxe/server ERROR:', e.message.slice(0, 200));
  }
  
  // Check aztec.js/wallet SendOptions type
  const { WalletSchema } = await import('@aztec/aztec.js/wallet');
  console.log('\nWalletSchema keys:', WalletSchema ? 'exists' : 'missing');
}
main().catch(e => console.error('FATAL:', e.message));
