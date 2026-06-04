/**
 *  PULSE MONITOR SERVICE 
 * Tracks the "Heartbeat" of major networks (BTC, ETH, BNB, BASE, SOL).
 */

export interface NetworkPulse {
    chainId: string;
    label: string;
    tps: number;
    gasPriceGwei?: number;
    whaleHeatIndex: number; // 0-100 based on recent volume
    status: 'OPTIMAL' | 'CONGESTED' | 'STRESS';
    lastSync: number;
}

export class PulseService {
    private pulses: Record<string, NetworkPulse> = {
        'BITCOIN': { chainId: 'btc', label: 'BTC', tps: 7, whaleHeatIndex: 45, status: 'OPTIMAL', lastSync: Date.now() },
        'ETHEREUM': { chainId: 'eth', label: 'ETH', tps: 15, gasPriceGwei: 12, whaleHeatIndex: 65, status: 'OPTIMAL', lastSync: Date.now() },
        'BSC': { chainId: '56', label: 'BNB', tps: 85, gasPriceGwei: 3, whaleHeatIndex: 30, status: 'OPTIMAL', lastSync: Date.now() },
        'BASE': { chainId: '8453', label: 'BASE', tps: 120, gasPriceGwei: 0.01, whaleHeatIndex: 85, status: 'OPTIMAL', lastSync: Date.now() },
        'SOLANA': { chainId: 'sol', label: 'SOL', tps: 2400, whaleHeatIndex: 92, status: 'OPTIMAL', lastSync: Date.now() },
        'POLYGON': { chainId: '137', label: 'MATIC', tps: 45, gasPriceGwei: 40, whaleHeatIndex: 22, status: 'OPTIMAL', lastSync: Date.now() },
        'CHAINLINK': { chainId: 'link', label: 'LINK', tps: 12, whaleHeatIndex: 78, status: 'OPTIMAL', lastSync: Date.now() },
    };

    /**
     * Get real-time pulse for all monitored networks.
     * In a full implementation, this would aggregate data from RPCs and WebSocket streams.
     */
    public async getGlobalPulse(): Promise<NetworkPulse[]> {
        // Return current state without artificial jitter.
        // Future integration: Fetch live throughput from network indexers.
        return Object.values(this.pulses);
    }

    public static getInstance() {
        if (!(global as any).__pulseService) {
            (global as any).__pulseService = new PulseService();
        }
        return (global as any).__pulseService as PulseService;
    }
}

export const pulseService = PulseService.getInstance();
