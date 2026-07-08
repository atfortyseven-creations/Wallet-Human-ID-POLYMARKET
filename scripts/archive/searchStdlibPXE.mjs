// Search for PXEApiSchema in all @aztec/stdlib interfaces
const mods = [
  '@aztec/stdlib/interfaces/client',
  '@aztec/stdlib/interfaces/server',
  '@aztec/stdlib',
];
for (const m of mods) {
  try {
    const mod = await import(m);
    const pxeKeys = Object.keys(mod).filter(k => k.toLowerCase().includes('pxe'));
    if (pxeKeys.length > 0) {
      console.log(m, '->', pxeKeys);
    }
  } catch(e) {
    console.log(m, 'error:', e.message.slice(0, 100));
  }
}
