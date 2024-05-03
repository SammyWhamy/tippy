import { PubSubRedisBroker } from "@discordjs/brokers";
import type { HandlerMetricsMessage, MetricsClient } from "metrics";
import { redis } from "./redis.js";

type EventPayload = {
    data: HandlerMetricsMessage;
    ack(): Promise<void>;
};

export async function aggregateHandlerMetrics(metricsClient: MetricsClient) {
    const broker = new PubSubRedisBroker({ redisClient: redis });

    broker.on("metrics", ({ data, ack }: EventPayload) => {
        void ack();
        metricsClient.mergeHandlerMetrics(data);
    });

    await broker.subscribe("gateway", ["metrics"]);
}
