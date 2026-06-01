/**
 * COMPATIBILITY ADAPTER — DO NOT REMOVE
 * 
 * This file re-exports QUANTUM_TOKENS (357 tokens) in the UNIVERSAL_TOKENS shape
 * (single `address` field) so that existing components that import from here
 * (NativeSwapView, NativeBridgeView, ReceiveHub, UnifiedWalletModal, GainersLosersPanel)
 * automatically get the full 357-token registry with correct logos.
 *
 * The Ethereum address is used as default. Tokens with no Ethereum address
 * fall back to the first available network address.
 */
import { QUANTUM_TOKENS } from '@/lib/config/tokens';

export interface UniversalToken {
    symbol: string;
    name: string;
    address: string;
    decimals: number;
    logoPath: string;
}

// Map QUANTUM_TOKENS → legacy UniversalToken shape.
// Priority: ethereum > polygon > arbitrum > base > bsc > avalanche > first available
const NETWORK_PRIORITY = ['ethereum', 'polygon', 'arbitrum', 'base', 'bsc', 'avalanche', 'optimism'];

function pickAddress(addresses: Record<string, string>): string {
    for (const net of NETWORK_PRIORITY) {
        if (addresses[net]) return addresses[net];
    }
    const first = Object.values(addresses)[0];
    return first || '';
}

export const UNIVERSAL_TOKENS: UniversalToken[] = QUANTUM_TOKENS.map(t => ({
    symbol:   t.symbol,
    name:     t.name,
    address:  pickAddress(t.addresses),
    decimals: t.decimals,
    logoPath: t.logoPath,
}));
