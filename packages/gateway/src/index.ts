import { REST } from "@discordjs/rest";
import { Cache } from "cache";
import { env } from "core";
import { MetricsClient } from "metrics";
import { setupMetricsServer } from "./api/metrics.js";
import { getManager } from "./services/manager.js";
import { aggregateHandlerMetrics } from "./services/metricsAggregator.js";

const rest = new REST().setToken(env.DISCORD_TOKEN);

const cache = await Cache.new("gateway:");

const metricsClient = new MetricsClient();
await aggregateHandlerMetrics(metricsClient);
await setupMetricsServer({ env, metricsClient });

const manager = await getManager({
    env: env,
    rest: rest,
    cache: cache,
    shardCount: env.SHARD_COUNT,
    metricsClient: metricsClient,
});

await manager.connect();
