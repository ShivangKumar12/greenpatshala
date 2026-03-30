// server/middleware/cacheMiddleware.ts — Redis-backed API response caching
import type { Request, Response, NextFunction } from 'express';
import { redis, isRedisAvailable } from '../config/redis';

// ============================================
// CACHE RESPONSE MIDDLEWARE
// ============================================
/**
 * Caches GET responses in Redis.
 * Usage: `router.get('/courses', cacheResponse(120), getCourses)`
 *
 * @param ttlSeconds  Time-to-live in seconds (default 120)
 */
export const cacheResponse = (ttlSeconds = 120) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests & only when Redis is available
        if (req.method !== 'GET' || !isRedisAvailable()) {
            return next();
        }

        const cacheKey = `api_cache:${req.method}:${req.originalUrl}`;

        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                // Cache HIT
                const parsed = JSON.parse(cached);
                res.setHeader('X-Cache', 'HIT');
                return res.json(parsed);
            }
        } catch (err) {
            // Redis read failed — fall through to handler
            console.warn('Redis cache read error:', (err as Error).message);
        }

        // Cache MISS — intercept res.json to store the response
        const originalJson = res.json.bind(res);
        res.json = ((body: any) => {
            // Store in Redis asynchronously (don't block the response)
            if (isRedisAvailable() && res.statusCode >= 200 && res.statusCode < 300) {
                redis
                    .setex(cacheKey, ttlSeconds, JSON.stringify(body))
                    .catch((err) => console.warn('Redis cache write error:', err.message));
            }
            res.setHeader('X-Cache', 'MISS');
            return originalJson(body);
        }) as typeof res.json;

        next();
    };
};

// ============================================
// CACHE INVALIDATION
// ============================================
/**
 * Deletes all Redis keys matching any of the given glob patterns.
 * Usage: `await invalidateCache('api_cache:GET:/api/courses*')`
 *
 * @param patterns  One or more Redis key glob patterns
 */
export const invalidateCache = async (...patterns: string[]): Promise<void> => {
    if (!isRedisAvailable()) return;

    try {
        for (const pattern of patterns) {
            let cursor = '0';
            do {
                const [nextCursor, keys] = await redis.scan(
                    cursor,
                    'MATCH',
                    pattern,
                    'COUNT',
                    100
                );
                cursor = nextCursor;
                if (keys.length > 0) {
                    await redis.del(...keys);
                }
            } while (cursor !== '0');
        }
    } catch (err) {
        console.warn('Redis invalidation error:', (err as Error).message);
    }
};
