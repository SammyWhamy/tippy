import { Redis, type RedisOptions } from "ioredis";
import { GatewayCache } from "./caches/Gateway.js";

export class Cache {
    private readonly cache: Redis;

    constructor(options: RedisOptions) {
        this.cache = new Redis({
            lazyConnect: true,
            ...options,
        });
        this.gateway = new GatewayCache(this.cache);
    }

    async connect(): Promise<void> {
        await this.cache.connect();
    }

    public gateway;
}
