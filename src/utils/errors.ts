export function getFriendlyError(error: any): string {
    if (!error) return "An unknown error occurred.";

    const message = (error.message || JSON.stringify(error)).toLowerCase();

    // User rejection
    if (message.includes("user rejected") || message.includes("action_rejected")) {
        return "You cancelled the operation.";
    }

    // Insufficient funds (Native)
    if (message.includes("insufficient funds") || message.includes("exceeds balance")) {
        return "Insufficient MATIC for gas.";
    }

    // Insufficient funds (ERC20)
    if (message.includes("transfer amount exceeds balance")) {
        return "Insufficient USDC balance.";
    }

    // Gnosis Safe validation
    if (message.includes("gs026")) {
        return "Safe validation failed (GS026).";
    }

    // Connection issues
    if (message.includes("connector not found") || message.includes("disconnected")) {
        return "Wallet disconnected. Please connect again.";
    }

    // Fallback for generic short messages
    if (typeof error === 'string' && error.length < 100) {
        return error;
    }

    return "An unexpected error occurred. Please try again.";
}
