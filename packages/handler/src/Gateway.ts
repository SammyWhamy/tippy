import { EventEmitter } from "node:events";
import { PubSubRedisBroker } from "@discordjs/brokers";
import type { Environment } from "core/dist/env.js";
import type { GatewayDispatchPayload, GatewaySendPayload } from "discord-api-types/v10";
import type { Redis } from "ioredis";
import { HandlerMetricsClient } from "metrics";

type EventPayload = {
    data: { data: GatewayDispatchPayload };
    ack(): Promise<void>;
};

export type GatewayOptions = {
    redis: Redis;
    env: Environment;
    handlerId: number;
};

export class Gateway extends EventEmitter {
    private pubSubBroker: PubSubRedisBroker<Record<string, any>>;
    private metricsClient: HandlerMetricsClient;
    private env: Environment;

    constructor({ redis, env, handlerId }: GatewayOptions) {
        super();

        this.env = env;
        this.pubSubBroker = new PubSubRedisBroker({ redisClient: redis });
        this.metricsClient = new HandlerMetricsClient(handlerId);

        this.pubSubBroker.on("dispatch", ({ data, ack }: EventPayload) => {
            this.emit("dispatch", data);
            void ack();

            this.metricsClient.incEvents();
        });

        setInterval(async () => {
            const metrics = this.metricsClient.serialize();

            await this.pubSubBroker.publish("metrics", metrics);

            this.metricsClient.reset();
        }, 10000);
    }

    async connect(): Promise<void> {
        await this.pubSubBroker.subscribe("handler", ["dispatch"]);
    }

    send = (_shardId: number, _payload: GatewaySendPayload) => {};

    getShardCount = () => this.env.SHARD_COUNT;
}
