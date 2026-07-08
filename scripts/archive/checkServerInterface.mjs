// Check @aztec/stdlib interfaces for PXE
const mods = [
  '@aztec/stdlib/interfaces/server',
];
for (const m of mods) {
  try {
    const mod = await import(m);
    const allKeys = Object.keys(mod);
    console.log('All keys in', m, ':', allKeys.slice(0, 30));
    const pxeKeys = allKeys.filter(k => k.toLowerCase().includes('pxe'));
    console.log('PXE keys:', pxeKeys);
  } catch(e) {
    console.log(m, 'error:', e.message.slice(0, 200));
  }
}
