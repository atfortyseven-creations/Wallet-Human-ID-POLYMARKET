// Check the pxe package for wallet client creation
const allPaths = [
  '@aztec/pxe/client/lazy',
];

for (const path of allPaths) {
  try {
    const mod = await import(path);
    console.log(`\n${path} exports:`, Object.keys(mod));
  } catch(e) {
    console.log(`${path}: ERROR`, e.message);
  }
}
