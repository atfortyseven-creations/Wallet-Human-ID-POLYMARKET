export function getFriendlyError(error: any): string {
    const msg = error?.message || String(error);

    if (msg.includes("User rejected")) return "You cancelled the operation.";
    if (msg.includes("insufficient funds")) return "Insufficient balance for gas.";
    if (msg.includes("exceeds balance")) return "Amount exceeds available balance.";
    if (msg.includes("GS026")) return "Safe validation failed.";

    return "An unexpected error occurred. Please try again.";
}
