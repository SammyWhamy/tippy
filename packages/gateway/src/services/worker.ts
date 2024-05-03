import { clearInterval } from "node:timers";
import { parentPort, workerData } from "node:worker_threads";
import { PubSubRedisBroker } from "@discordjs/brokers";
import { WebSocketShardEvents, WorkerBootstrapper } from "@discordjs/ws";
import { calculateWorkerId, env } from "core";
import { Logger } from "log";
import { WorkerMetricsClient } from "metrics";
import { CustomWorkerPayloadOp } from "./manager.js";
import { redis } from "./redis.js";

const logger = new Logger();

const bootstrapper = new WorkerBootstrapper();
const broker = new PubSubRedisBroker({ redisClient: redis });

const workerId = calculateWorkerId(workerData.shardIds, env.SHARDS_PER_WORKER);
logger.info("Starting...", `Worker ${workerId}`, { shardIds: workerData.shardIds });
const metricsClient = new WorkerMetricsClient(workerId);

void bootstrapper.bootstrap({
    forwardEvents: [
        WebSocketShardEvents.Closed,
        WebSocketShardEvents.Ready,
        WebSocketShardEvents.Resumed,
        WebSocketShardEvents.Error,
        WebSocketShardEvents.Hello,
    ],
    shardCallback: (shard) => {
        shard.on(WebSocketShardEvents.Dispatch, async (event) => {
            await broker.publish("dispatch", {
                shardId: shard.id,
                data: event.data,
            });

            metricsClient.incEvents(shard.id);
        });
    },
});

setInterval(async () => {
    if (!parentPort) {
        logger.warn("Parent port is not available, exiting metrics loop", `Worker ${workerId}`);
        clearInterval(this);
        return;
    }

    const metrics = metricsClient.serialize();

    parentPort.postMessage({
        op: CustomWorkerPayloadOp.Metrics,
        data: metrics,
    });

    metricsClient.reset();
}, 10000);
