async function check() {
    try {
        const aztec = await import('@aztec/aztec.js');
        console.log('aztec.js:', Object.keys(aztec).filter(k => k.toLowerCase().includes('pxe')));
    } catch (e) {
        console.log('aztec.js error:', e.message);
    }
    
    try {
        const aztec = await import('@aztec/pxe');
        console.log('pxe:', Object.keys(aztec).filter(k => k.toLowerCase().includes('pxe')));
    } catch (e) {
        console.log('pxe error:', e.message);
    }
    
    try {
        const aztec = await import('@aztec/aztec.js/pxe');
        console.log('aztec.js/pxe:', Object.keys(aztec).filter(k => k.toLowerCase().includes('pxe')));
    } catch (e) {
        console.log('aztec.js/pxe error:', e.message);
    }
}
check();
