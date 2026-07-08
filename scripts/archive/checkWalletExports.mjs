// Check if WalletSchema is exported from @aztec/aztec.js/wallet
const mod = await import('@aztec/aztec.js/wallet');
const allKeys = Object.keys(mod);
console.log('Total keys:', allKeys.length);
const schemaKeys = allKeys.filter(k => k.toLowerCase().includes('schema'));
console.log('Schema keys:', schemaKeys);
const pxeKeys = allKeys.filter(k => k.toLowerCase().includes('pxe'));
console.log('PXE keys:', pxeKeys);
