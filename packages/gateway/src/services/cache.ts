import { Cache } from "cache";
import { env } from "core";

const cache = new Cache({
    keyPrefix: "gateway:",
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
    db: env.REDIS_DATABASE,
});

await cache.connect();

export { cache };
