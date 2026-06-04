/**
 * System Hardware Wallet Detection Heuristics
 * 
 * Cold storage identification cannot be verified 100% reliably purely on-chain,
 * but via specific signatures, derivation path structures, or connector IDs
 * (like "ledger" or "trezor"), we can calculate a probability score.
 */

export interface HWHeuristicResult {
    isLikelyHardware: boolean;
    probability: number;
    detectedType: 'LEDGER' | 'TREZOR' | 'HOT_WALLET' | 'UNKNOWN';
}

export function evaluateHardwareWallet(connectorId?: string, userAgent?: string): HWHeuristicResult {
    let probability = 0.0;
    let detectedType: HWHeuristicResult['detectedType'] = 'UNKNOWN';

    // 1. Connector ID Heuristic (AppKit/Wagmi exposes this)
    if (connectorId) {
        const idLower = connectorId.toLowerCase();
        if (idLower.includes('ledger')) {
            probability += 0.8;
            detectedType = 'LEDGER';
        } else if (idLower.includes('trezor')) {
            probability += 0.8;
            detectedType = 'TREZOR';
        } else if (idLower.includes('metamask') || idLower.includes('trust') || idLower.includes('rainbow')) {
            probability -= 0.5; // Likely a hot wallet natively, though could be linked to HW.
            detectedType = 'HOT_WALLET';
        }
    }

    // 2. Browser User Agent Heuristic (e.g. Ledger Active Webview)
    if (userAgent) {
        const ua = userAgent.toLowerCase();
        if (ua.includes('ledgerlive')) {
            probability += 0.9;
            detectedType = 'LEDGER';
        }
    }

    // Thresholds for System VIP/Cold Storage tagging
    const isLikelyHardware = probability >= 0.7;

    return {
        isLikelyHardware,
        probability: Math.max(0, Math.min(1, probability)), // clamp 0-1
        detectedType: isLikelyHardware ? detectedType : 'HOT_WALLET'
    };
}
