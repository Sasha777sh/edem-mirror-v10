import { NextRequest } from 'next/server';

// Redis client for production (optional)
let redisClient: any = null;
if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
    try {
        // Only import Redis in production when URL is available
        const Redis = require('ioredis');
        redisClient = new Redis(process.env.REDIS_URL);
    } catch (error) {
        console.warn('Redis not available, falling back to in-memory store');
    }
}

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

// In-memory store for development
const store: RateLimitStore = {};

const RATE_LIMIT = {
    requests: 60,
    windowMs: 60 * 1000, // 1 minute
};

export function getRateLimitKey(req: NextRequest): string {
    // For authenticated users, use user ID
    const userId = req.headers.get('x-user-id');
    if (userId) {
        return `user:${userId}`;
    }

    // For guests, use IP address
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : req.ip || 'unknown';
    return `ip:${ip}`;
}

export async function checkRateLimit(key: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
}> {
    const now = Date.now();

    // Use Redis in production if available
    if (redisClient) {
        try {
            const multi = redisClient.multi();
            const windowStart = Math.floor(now / RATE_LIMIT.windowMs);
            const redisKey = `rate_limit:${key}:${windowStart}`;

            multi.incr(redisKey);
            multi.expire(redisKey, Math.ceil(RATE_LIMIT.windowMs / 1000));

            const results = await multi.exec();
            const count = results[0][1];

            const resetTime = (windowStart + 1) * RATE_LIMIT.windowMs;
            const remaining = Math.max(0, RATE_LIMIT.requests - count);

            return {
                allowed: count <= RATE_LIMIT.requests,
                remaining,
                resetTime,
            };
        } catch (error) {
            console.error('Redis error, falling back to memory store:', error);
            // Fall through to in-memory implementation
        }
    }

    // In-memory implementation (development/fallback)
    const record = store[key];

    // Clean up expired records
    if (record && now > record.resetTime) {
        delete store[key];
    }

    // Get current record or create new one
    const current = store[key] || {
        count: 0,
        resetTime: now + RATE_LIMIT.windowMs,
    };

    // Check if limit exceeded
    if (current.count >= RATE_LIMIT.requests) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: current.resetTime,
        };
    }

    // Increment counter
    current.count++;
    store[key] = current;

    return {
        allowed: true,
        remaining: RATE_LIMIT.requests - current.count,
        resetTime: current.resetTime,
    };
}

export function getRateLimitHeaders(remaining: number, resetTime: number) {
    return {
        'X-RateLimit-Limit': RATE_LIMIT.requests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
    };
}

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, RATE_LIMIT.windowMs);