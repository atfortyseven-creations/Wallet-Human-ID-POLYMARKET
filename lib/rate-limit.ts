import { redisClient } from './redis/client';

type RateLimitOptions = {
    uniqueTokenPerInterval?: number;
    interval?: number; // interval in milliseconds
};

export default function rateLimit(options?: RateLimitOptions) {
    const windowSeconds = Math.max(1, Math.floor((options?.interval || 60000) / 1000));

    return {
        check: async (limit: number, token: string) => {
            // If Redis is not configured or in mock mode, fallback to allow
            if (!redisClient || (redisClient as any).__isMock) {
                return Promise.resolve();
            }

            const key = `ratelimit:generic:${token}`;
            
            // Atomic Lua Script: INCR and set EXPIRE only on first hit
            const luaScript = `
                local current = redis.call('INCR', KEYS[1])
                if current == 1 then
                    redis.call('EXPIRE', KEYS[1], ARGV[1])
                end
                return current
            `;

            try {
                const count = await redisClient.eval(luaScript, 1, key, windowSeconds) as number;
                if (count > limit) {
                    return Promise.reject(new Error('Rate limit exceeded'));
                }
                return Promise.resolve();
            } catch (e) {
                console.error('[RateLimit:Redis] Error executing Lua script:', e);
                return Promise.resolve(); // Fail open to prevent blocking legitimate traffic on Redis outage
            }
        },
    };
}

