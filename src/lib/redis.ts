import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client with fallback for missing environment variables
let redisClient: Redis | null = null;

// Only initialize Redis if environment variables are provided
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
        redisClient = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    } catch (error) {
        console.warn('Failed to initialize Redis client:', error);
        redisClient = null;
    }
}

// Export redis as either the Redis client or a mock object
export const redis = redisClient || {
    get: async () => null,
    setex: async () => true,
    del: async () => 0,
};

// Mock Ratelimit class for when Redis is not available
class MockRatelimit {
    limiter: any;
    prefix: string;

    constructor(config: { limiter: any; prefix: string }) {
        this.limiter = config.limiter;
        this.prefix = config.prefix;
    }

    async limit(identifier: string) {
        return {
            success: true,
            limit: 1000,
            reset: Date.now() + 60000,
            remaining: 1000,
        };
    }
}

// Rate limiters with fallback to in-memory when Redis is not available
export const demoRateLimit = redisClient
    ? new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(2, "1 d"), // 2 requests per day
        analytics: true,
        prefix: "demo",
    })
    : new MockRatelimit({
        limiter: Ratelimit.slidingWindow(2, "1 d"),
        prefix: "demo",
    }) as any;

export const apiRateLimit = redisClient
    ? new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
        analytics: true,
        prefix: "api",
    })
    : new MockRatelimit({
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "api",
    }) as any;

// Cache functions
export async function getCachedData<T>(key: string): Promise<T | null> {
    try {
        if (!redisClient) {
            console.warn('Redis not available, cache miss for key:', key);
            return null;
        }
        const data = await redis.get(key);
        return data as T;
    } catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
}

export async function setCachedData(key: string, data: any, ttlSeconds: number = 3600): Promise<boolean> {
    try {
        if (!redisClient) {
            console.warn('Redis not available, skipping cache set for key:', key);
            return false;
        }
        await redis.setex(key, ttlSeconds, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Redis set error:', error);
        return false;
    }
}

export async function deleteCachedData(key: string): Promise<boolean> {
    try {
        if (!redisClient) {
            console.warn('Redis not available, skipping cache delete for key:', key);
            return false;
        }
        await redis.del(key);
        return true;
    } catch (error) {
        console.error('Redis delete error:', error);
        return false;
    }
}

// Helper function to generate cache keys
export function generateCacheKey(prefix: string, ...parts: string[]): string {
    return `${prefix}:${parts.join(':')}`;
}

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
    USER_PROGRESS: 300, // 5 minutes
    DAILY_WORD: 86400, // 24 hours
    SESSION_DATA: 3600, // 1 hour
    SUBSCRIPTION: 600, // 10 minutes
} as const;