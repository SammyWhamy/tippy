import type { Redis } from "ioredis";
import { GatewayCache } from "./caches/Gateway.js";

export class Cache {
    private readonly cache: Redis;

    constructor(redis: Redis) {
        this.cache = redis;
        this.gateway = new GatewayCache(this.cache);
    }

    public gateway;
}
