async function check() {
    const exports = [
        'abi', 'account', 'addresses', 'authorization', 'block', 'contracts', 'crypto',
        'deployment', 'ethereum', 'events', 'fee', 'fee/testing', 'fields', 'keys',
        'log', 'messaging', 'node', 'note', 'protocol', 'trees', 'tx', 'utils', 'wallet'
    ];
    for (const exp of exports) {
        try {
            const mod = await import(`@aztec/aztec.js/${exp}`);
            const pxeKeys = Object.keys(mod).filter(k => k.toLowerCase().includes('pxe'));
            if (pxeKeys.length > 0) {
                console.log(`Found in @aztec/aztec.js/${exp}:`, pxeKeys);
            }
        } catch (e) {}
    }
}
check();
