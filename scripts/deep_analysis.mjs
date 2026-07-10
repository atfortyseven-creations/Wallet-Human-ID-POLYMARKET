// Deep analysis of Aztec SDK v4.3.1 - enumerate all relevant exports
const modules = [
  '@aztec/aztec.js/fee',
  '@aztec/aztec.js/wallet',
  '@aztec/aztec.js/node',
  '@aztec/aztec.js/contracts',
  '@aztec/aztec.js/addresses',
  '@aztec/accounts/schnorr',
  '@aztec/foundation/curves/bn254',
  '@aztec/stdlib/aztec-address',
  '@aztec/stdlib/keys',
];

async function main() {
  for (const m of modules) {
    try {
      const mod = await import(m);
      console.log(`\n=== ${m} ===`);
      console.log('Exports:', Object.keys(mod).join(', '));
    } catch(e) {
      console.log(`\n=== ${m} === ERROR: ${e.message}`);
    }
  }
}
main();
