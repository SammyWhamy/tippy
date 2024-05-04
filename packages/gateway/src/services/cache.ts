import { Cache } from "cache";
import { getRedis } from "core";

const redis = await getRedis({
    keyPrefix: "gateway:",
});

export const cache = new Cache(redis);
