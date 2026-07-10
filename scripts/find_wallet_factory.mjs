// Check what's available in all the @aztec/aztec.js subpath exports
const allPaths = [
  '@aztec/aztec.js/account',
  '@aztec/aztec.js/wallet',
  '@aztec/aztec.js/node',
  '@aztec/aztec.js/fee',
  '@aztec/aztec.js/contracts',
  '@aztec/aztec.js/deployment',
  '@aztec/aztec.js/fields',
  '@aztec/aztec.js/tx',
  '@aztec/aztec.js/utils',
];

for (const path of allPaths) {
  try {
    const mod = await import(path);
    const keys = Object.keys(mod).filter(k => k.toLowerCase().includes('wallet') || k.toLowerCase().includes('pxe') || k.toLowerCase().includes('client'));
    console.log(`\n${path}:`, keys);
  } catch(e) {
    console.log(`${path}: ERROR`, e.message);
  }
}
