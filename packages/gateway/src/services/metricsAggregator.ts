import { PubSubRedisBroker } from "@discordjs/brokers";
import { getRedis } from "core";
import type { HandlerMetricsMessage, MetricsClient } from "metrics";

type EventPayload = {
    data: HandlerMetricsMessage;
    ack(): Promise<void>;
};

export async function aggregateHandlerMetrics(metricsClient: MetricsClient) {
    const redis = await getRedis();

    const broker = new PubSubRedisBroker({ redisClient: redis });

    broker.on("metrics", ({ data, ack }: EventPayload) => {
        void ack();
        metricsClient.mergeHandlerMetrics(data);
    });

    await broker.subscribe("gateway", ["metrics"]);
}
