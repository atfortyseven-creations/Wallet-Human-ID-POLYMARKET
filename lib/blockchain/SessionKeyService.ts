import { 
    generatePrivateKey, 
    privateKeyToAccount 
} from 'viem/accounts';
import { type Address, type Hex } from 'viem';
import { Redis } from '@upstash/redis';

/**
 * SessionKeyService
 * Manages the generation, storage, and cryptographic scoping of Session Keys.
 * Enables non-custodial, restricted execution for AI agents.
 */
export class SessionKeyService {
    private redis: Redis;

    constructor() {
        this.redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        });
    }

    /**
     * Generates a new cryptographically secure session key.
     */
    public async createSession(
        ownerAddress: Address,
        expiry: number,
        scope: {
            maxSpendUsd: number;
            allowedTargets: Address[];
        }
    ): Promise<{ sessionKey: Hex; sessionId: string }> {
        const privateKey = generatePrivateKey();
        const account = privateKeyToAccount(privateKey);
        const sessionId = crypto.randomUUID();

        // Store session metadata in Redis with expiry
        await this.redis.set(
            `session:${sessionId}`,
            JSON.stringify({
                owner: ownerAddress,
                sessionAddress: account.address,
                privateKey,
                scope,
                expiry
            }),
            { ex: expiry }
        );

        return { sessionKey: privateKey, sessionId };
    }

    /**
     * Retrieves a session by ID and validates its validity.
     */
    public async getSession(sessionId: string): Promise<any> {
        const session = await this.redis.get(`session:${sessionId}`);
        if (!session) {
            throw new Error('Session expired or invalid.');
        }
        return typeof session === 'string' ? JSON.parse(session) : session;
    }

    /**
     * Revokes a session immediately.
     */
    public async revokeSession(sessionId: string): Promise<void> {
        await this.redis.del(`session:${sessionId}`);
    }
}

export const sessionKeyService = new SessionKeyService();
