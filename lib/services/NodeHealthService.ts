import { ethers } from 'ethers';
import { SUPPORTED_CHAINS } from '../chains';

export interface NodeHealthStatus {
    chainId: number;
    name: string;
    blockNumber: number;
    latency: number;
    status: 'Operational' | 'Degraded' | 'Offline';
    timestamp: number;
}

/**
 * NodeHealthService
 * Elite-grade engine for real-time node monitoring.
 * Absolute-Reality, millimetre-precision blockchain telemetry.
 */
export class NodeHealthService {
    
    /**
     * Get real-time health for a specific chain.
     */
    public async getChainHealth(chainId: number): Promise<NodeHealthStatus> {
        const chainKey = Object.keys(SUPPORTED_CHAINS).find(
            key => SUPPORTED_CHAINS[key].id === chainId
        );
        
        if (!chainKey) {
            throw new Error(`Chain ID ${chainId} not supported.`);
        }

        const chain = SUPPORTED_CHAINS[chainKey];
        const rpc = chain.rpcUrls[0];
        
        if (!rpc) {
            return {
                chainId,
                name: chain.name,
                blockNumber: 0,
                latency: 0,
                status: 'Offline',
                timestamp: Date.now()
            };
        }

        const startTime = Date.now();
        try {
            const provider = new ethers.JsonRpcProvider(rpc);
            const blockNumber = await provider.getBlockNumber();
            const latency = Date.now() - startTime;

            return {
                chainId,
                name: chain.name,
                blockNumber,
                latency: latency / 1000, // in seconds for millimetre precision 0.00x
                status: latency < 1000 ? 'Operational' : 'Degraded',
                timestamp: Date.now()
            };
        } catch (error) {
            console.error(`[NodeHealthService]  Fail for ${chain.name}:`, error);
            return {
                chainId,
                name: chain.name,
                blockNumber: 0,
                latency: 0,
                status: 'Offline',
                timestamp: Date.now()
            };
        }
    }

    /**
     * Get health for a collection of critical nodes.
     */
    public async getCriticalNodesHealth(): Promise<NodeHealthStatus[]> {
        const criticalChains = [1, 56, 8453, 534352]; // ETH, BSC, BASE, SCROLL
        return await Promise.all(criticalChains.map(id => this.getChainHealth(id)));
    }
}

export const nodeHealthService = new NodeHealthService();
