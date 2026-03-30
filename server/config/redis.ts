// server/config/redis.ts — Centralized Redis Client
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

// Shared options
const redisOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: null, // required for BullMQ / Socket adapter
    retryStrategy: (times: number) => {
        if (times > 10) {
            console.error('❌ Redis: max retries reached, giving up');
            return null; // stop retrying
        }
        return Math.min(times * 200, 3000);
    },
    lazyConnect: true, // don't connect until first command
};

// ============================================
// MAIN CLIENT  –  used for caching & counters
// ============================================
export const redis = new Redis(redisOptions);

// ============================================
// PUB / SUB CLIENTS  –  for Socket.io adapter
// ============================================
export const redisPub = new Redis(redisOptions);
export const redisSub = new Redis(redisOptions);

// ============================================
// CONNECTION HELPERS
// ============================================
let isRedisConnected = false;

export const connectRedis = async (): Promise<boolean> => {
    try {
        await redis.connect();
        await redisPub.connect();
        await redisSub.connect();
        isRedisConnected = true;
        console.log(`✅ Redis connected (${REDIS_HOST}:${REDIS_PORT})`);
        return true;
    } catch (error) {
        isRedisConnected = false;
        console.warn('⚠️  Redis unavailable — caching & real-time features disabled');
        console.warn('   Start Redis with: redis-server');
        return false;
    }
};

export const isRedisAvailable = () => isRedisConnected;

redis.on('error', (err) => {
    if (isRedisConnected) {
        console.error('❌ Redis error:', err.message);
        isRedisConnected = false;
    }
});
redis.on('connect', () => {
    isRedisConnected = true;
});

// Graceful shutdown
export const disconnectRedis = async () => {
    try {
        await redis.quit();
        await redisPub.quit();
        await redisSub.quit();
        console.log('🔌 Redis disconnected gracefully');
    } catch {
        // ignore
    }
};
