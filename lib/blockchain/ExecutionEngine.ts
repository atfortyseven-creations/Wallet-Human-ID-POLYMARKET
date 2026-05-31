import { Queue, Worker, type Job } from 'bullmq';
import { SmartAccountService } from './SmartAccountService';
import { blockchainService, ChainId } from './BlockchainService';
import { type Address, type Hex } from 'viem';

/**
 * ExecutionEngine
 * The heart of deterministic institutional execution.
 * Orchestrates signal transformation, UserOp construction, and high-frequency relaying.
 */
export class ExecutionEngine {
    private executionQueue: Queue;
    private worker: Worker;

    constructor() {
        const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.argv.join(' ').includes('next build');
        if (isBuild) return;

        this.executionQueue = new Queue('execution-engine', {
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            }
        });

        this.worker = new Worker('execution-engine', async (job: Job) => {
            return this.processExecution(job.data);
        }, {
            connection: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            },
            concurrency: 50 // High-concurrency for institutional scale
        });
    }

    /**
     * Entry point: Submit a signal for execution.
     */
    public async submitSignal(signal: {
        chainId: ChainId;
        owner: Address;
        calls: { to: Address; data: Hex; value: bigint }[];
    }) {
        await this.executionQueue.add('execute-signal', signal, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 }
        });
    }

    /**
     * Core processing logic: Signal -> UserOp -> Relay.
     */
    private async processExecution(data: any) {
        const { chainId, owner, calls } = data;
        const saService = SmartAccountService.createForChain(chainId);

        // Note: In an institutional agent flow, we would retrieve the session key
        // and its scoped signer here.
        const account = await saService.getKernelAccount({ address: owner });
        const client = await saService.createClient(account);

        // Execute the batch call via ERC-4337
        const hash = await (client as any).sendTransactions({
            transactions: calls.map((c: any) => ({
                to: c.to,
                data: c.data,
                value: c.value
            }))
        });

        console.log(`[ExecutionEngine] Successfully relayed UserOp on chain ${chainId}. Hash: ${hash}`);
        return hash;
    }
}

export const executionEngine = new ExecutionEngine();
