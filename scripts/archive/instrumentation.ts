export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { enforceBootIntegrity } = await import('./lib/security/vault-sentinel');
        enforceBootIntegrity();

        const { initializeBackgroundServices } = await import('./lib/services/init');
        initializeBackgroundServices();
    }
}
