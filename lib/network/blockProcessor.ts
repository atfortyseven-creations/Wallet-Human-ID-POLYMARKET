// Block classification and processing utilities

export type BlockType = 'normal' | 'consolidation' | 'coinjoin' | 'data';

export interface ProcessedTransaction {
    hash: string;
    type: BlockType;
    amount: number; // BTC
    feeRate: number; // sats/vB
    virtualSize: number; // vB
    inputs: number;
    outputs: number;
    timestamp: number;
    rbfEnabled: boolean;
    version: number;
}

export interface ProcessedBlock {
    id: string;
    height: number;
    timestamp: number;
    size: number;
    txCount: number;
    transactions: ProcessedTransaction[];
    type: BlockType; // Dominant type
    color: string; // CSS gradient class
}

/**
 * Classify a transaction based on its inputs/outputs
 */
export function classifyTransaction(tx: any): BlockType {
    const inputCount = tx.inputs?.length || tx.vin?.length || 0;
    const outputCount = tx.outputs?.length || tx.vout?.length || 0;
    const outputs = tx.outputs || tx.vout || [];

    // Consolidation: Many inputs  1 output
    if (inputCount > 5 && outputCount === 1) {
        return 'consolidation';
    }

    // Coinjoin: Multiple equal-value outputs (privacy technique)
    if (outputCount >= 3) {
        const values = outputs.map((o: any) => o.value || 0);
        const uniqueValues = new Set(values);
        // If 50%+ outputs have same value, likely coinjoin
        const mostCommonValue = values.sort((a: number, b: number) =>
            values.filter((v: number) => v === a).length - values.filter((v: number) => v === b).length
        ).pop();
        const sameValueCount = values.filter((v: number) => v === mostCommonValue).length;
        if (sameValueCount >= outputCount / 2 && sameValueCount >= 2) {
            return 'coinjoin';
        }
    }

    // Data transaction: OP_RETURN or large witness data
    const hasOpReturn = outputs.some((o: any) => 
        o.script_pubkey?.startsWith('6a') || // OP_RETURN opcode
        o.scriptPubKey?.type === 'nulldata'
    );
    if (hasOpReturn || (tx.witness_data?.length || 0) > 1000) {
        return 'data';
    }

    return 'normal';
}

/**
 * Get color gradient CSS class for block type
 */
export function getBlockColor(type: BlockType): string {
    switch (type) {
        case 'consolidation':
            return 'from-emerald-900 to-emerald-600';
        case 'coinjoin':
            return 'from-cyan-900 to-cyan-500';
        case 'data':
            return 'from-yellow-900 to-yellow-600';
        case 'normal':
        default:
            return 'from-green-900 to-green-600';
    }
}

/**
 * Process raw block data into structured format for treemap
 */
export function processBlock(rawBlock: any): ProcessedBlock {
    const transactions: ProcessedTransaction[] = (rawBlock.tx || []).map((tx: any) => {
        const type = classifyTransaction(tx);
        
        return {
            hash: tx.txid || tx.hash || '',
            type,
            amount: (tx.vout || tx.outputs || []).reduce((sum: number, o: any) => sum + (o.value || 0), 0) / 100000000, // satoshi to BTC
            feeRate: tx.fee_rate || tx.feeRate || 0,
            virtualSize: tx.vsize || tx.size || 0,
            inputs: (tx.vin || tx.inputs || []).length,
            outputs: (tx.vout || tx.outputs || []).length,
            timestamp: rawBlock.timestamp || Date.now() / 1000,
            rbfEnabled: tx.vin?.some((i: any) => i.sequence < 0xfffffffe) || false,
            version: tx.version || 1,
        };
    });

    // Determine dominant block type
    const typeCounts = transactions.reduce((acc, tx) => {
        acc[tx.type] = (acc[tx.type] || 0) + 1;
        return acc;
    }, {} as Record<BlockType, number>);

    const dominantType = (Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as BlockType) || 'normal';

    return {
        id: rawBlock.id || rawBlock.hash || '',
        height: rawBlock.height || 0,
        timestamp: rawBlock.timestamp || Date.now() / 1000,
        size: rawBlock.size || 0,
        txCount: transactions.length,
        transactions,
        type: dominantType,
        color: getBlockColor(dominantType),
    };
}

/**
 * Filter blocks by type
 */
export function filterBlocksByType(blocks: ProcessedBlock[], filterType: 'all' | BlockType): ProcessedBlock[] {
    if (filterType === 'all') return blocks;
    return blocks.filter(block => block.type === filterType);
}

