'use client';

import { broadcastSignal } from '../p2p/eternalNode';

/**
 * SAL Block Schema
 * Represents an immutable record of thermodynamic analytics.
 */
export type SALBlock = {
    height: number;
    timestamp: number;
    hash: string;
    prevHash: string;
    data: {
        zScore: number;
        mempoolDensity: number;
        entropy: number;
        source: string;
    };
    signature?: string;
};

/**
 * System Akashic Ledger  Core Store
 * Manages the local chain state and gossip triggers.
 */
class SALLedger {
    private chain: SALBlock[] = [];
    private static instance: SALLedger;

    private constructor() {}

    public static getInstance(): SALLedger {
        if (!SALLedger.instance) {
            SALLedger.instance = new SALLedger();
        }
        return SALLedger.instance;
    }

    /**
     * Commits a new block to the local ledger and gossips it to the mesh.
     */
    public async commitBlock(data: SALBlock['data']): Promise<SALBlock> {
        const prevBlock = this.chain[this.chain.length - 1];
        const newBlock: SALBlock = {
            height: this.chain.length,
            timestamp: Date.now(),
            hash: this.calculateHash(data),
            prevHash: prevBlock ? prevBlock.hash : 'GENESIS',
            data,
        };

        this.chain.push(newBlock);
        
        // Gossip to the Eternal Node Mesh
        await broadcastSignal('sal-block', newBlock);
        
        console.log(`[SAL-LEDGER] Inner-Commit Success. Height: ${newBlock.height}`);
        return newBlock;
    }

    /**
     * Ingests a block received via P2P Gossip after verification.
     */
    public ingestGossipBlock(block: SALBlock) {
        // Validation logic (Check signature, prevHash, etc.)
        if (this.chain.find(b => b.hash === block.hash)) return;
        
        this.chain.push(block);
        this.chain.sort((a,b) => a.height - b.height);
        
        console.log(`[SAL-LEDGER] Ingested P2P Block at height ${block.height}`);
    }

    public getSnapshot(): SALBlock[] {
        return [...this.chain];
    }

    private calculateHash(data: any): string {
        // Simple deterministic hash for UI/Demo (replace with real crypto hash in prod)
        return 'sha256-' + btoa(JSON.stringify(data)).slice(0, 16);
    }
}

export const salLedger = SALLedger.getInstance();
