import { env } from "core";
import { Redis } from "ioredis";

export const redis = new Redis({
    lazyConnect: true,
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DATABASE,
});
