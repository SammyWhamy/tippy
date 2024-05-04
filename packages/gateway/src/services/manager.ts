import type { REST } from "@discordjs/rest";
import { SimpleIdentifyThrottler, WebSocketManager, WebSocketShardEvents, WorkerShardingStrategy } from "@discordjs/ws";
import type { Cache } from "cache";
import type { Environment } from "core/dist/env.js";
import { GatewayIntentBits } from "discord-api-types/v10";
import { Logger } from "log";
import type { MetricsClient, WorkerMetricsMessage } from "metrics";

export type ManagerOptions = {
    rest: REST;
    cache: Cache;
    shardCount: number;
    env: Environment;
    metricsClient: MetricsClient;
};

export enum CustomWorkerPayloadOp {
    Metrics = "metrics",
}

export interface CustomWorkerPayloadMap {
    [CustomWorkerPayloadOp.Metrics]: WorkerMetricsMessage;
}

export type CustomWorkerPayload = {
    op: CustomWorkerPayloadOp;
    data: CustomWorkerPayloadMap[keyof CustomWorkerPayloadMap];
};

let manager: WebSocketManager;
const logger = new Logger();

export async function getManager({
    env,
    rest,
    shardCount,
    cache,
    metricsClient,
}: ManagerOptions): Promise<WebSocketManager> {
    manager = new WebSocketManager({
        token: env.DISCORD_TOKEN,
        intents:
            0 |
            GatewayIntentBits.Guilds |
            GatewayIntentBits.GuildMembers |
            GatewayIntentBits.GuildModeration |
            GatewayIntentBits.GuildVoiceStates |
            GatewayIntentBits.GuildMessages |
            GatewayIntentBits.GuildMessageReactions |
            GatewayIntentBits.DirectMessages |
            GatewayIntentBits.MessageContent,
        rest,
        shardCount,
        buildIdentifyThrottler: async () => {
            const gatewayInformation = await manager.fetchGatewayInformation();
            return new SimpleIdentifyThrottler(gatewayInformation.session_start_limit.max_concurrency);
        },
        buildStrategy: (manager) => {
            return new WorkerShardingStrategy(manager, {
                shardsPerWorker: env.SHARDS_PER_WORKER,
                workerPath: `${import.meta.dirname}/worker.js`,
                unknownPayloadHandler: async ({ op, data }: CustomWorkerPayload) => {
                    switch (op) {
                        case CustomWorkerPayloadOp.Metrics: {
                            metricsClient.mergeWorkerMetrics(data);
                        }
                    }
                },
            });
        },
        retrieveSessionInfo: cache.gateway.getSession.bind(cache.gateway),
        updateSessionInfo: cache.gateway.saveSession.bind(cache.gateway),
    });

    metricsClient.shardCount.set(shardCount);

    manager.on(WebSocketShardEvents.Resumed, ({ shardId }) => {
        logger.debugSingle(`Shard ${shardId} resumed.`, "Gateway");
    });

    manager.on(WebSocketShardEvents.Ready, ({ shardId }) => {
        logger.infoSingle(`Shard ${shardId} ready.`, "Gateway");
    });

    manager.on(WebSocketShardEvents.Closed, ({ shardId }) => {
        logger.debugSingle(`Shard ${shardId} closed.`, "Gateway");
    });

    manager.on(WebSocketShardEvents.Error, ({ shardId, error }) => {
        logger.error(`Shard ${shardId} errored.`, "Gateway", error);
    });

    return manager;
}
