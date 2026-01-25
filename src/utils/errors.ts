export function getFriendlyError(error: any): string {
    if (!error) return "Ocurrió un error desconocido.";

    const message = (error.message || JSON.stringify(error)).toLowerCase();

    // User rejection
    if (message.includes("user rejected") || message.includes("action_rejected")) {
        return "Cancelaste la operación.";
    }

    // Insufficient funds (Native)
    if (message.includes("insufficient funds") || message.includes("exceeds balance")) {
        return "No tienes suficiente MATIC para el gas.";
    }

    // Insufficient funds (ERC20)
    if (message.includes("transfer amount exceeds balance")) {
        return "No tienes suficiente saldo USDC.";
    }

    // Gnosis Safe validation
    if (message.includes("gs026")) {
        return "Fallo en la validación del Safe (GS026).";
    }

    // Connection issues
    if (message.includes("connector not found") || message.includes("disconnected")) {
        return "Billetera desconectada. Por favor conecta nuevamente.";
    }

    // Fallback for generic short messages
    if (typeof error === 'string' && error.length < 100) {
        return error;
    }

    return "Ocurrió un error inesperado. Intenta nuevamente.";
}
