import { Redis, type RedisOptions } from "ioredis";
import { env } from "./env.js";

const redisInstances: Redis[] = [];

export async function getRedis(options?: RedisOptions): Promise<Redis> {
    if (options) {
        for (const instance of redisInstances) {
            // Hacky deep comparison, and prone to undetected equality due to property order, but should be fine for this use case.
            if (JSON.stringify(instance.options) === JSON.stringify(options)) {
                return instance;
            }
        }
    }

    const redis = new Redis({
        lazyConnect: true,
        enableAutoPipelining: true,
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
        db: env.REDIS_DATABASE,
        ...options,
    });

    await redis.connect();

    redisInstances.push(redis);

    return redis;
}
