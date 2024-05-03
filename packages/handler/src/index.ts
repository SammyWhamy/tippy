import { Client, GatewayDispatchEvents } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { env } from "core";
import { getContainer } from "core/dist/utils.js";
import { Logger } from "log";
import { Gateway } from "./Gateway.js";
import { redis } from "./redis.js";

export const container = await getContainer(env.HOSTNAME);
export const containerId = Number.parseInt(container.Labels["com.docker.compose.container-number"]);

const logger = new Logger();

const rest = new REST().setToken(env.DISCORD_TOKEN);
const gateway = new Gateway({ redis, env, handlerId: containerId });
await gateway.connect();

const client = new Client({ rest, gateway });

client.on(GatewayDispatchEvents.MessageCreate, async ({ data: message }) => {
    logger.sillySingle(`Received message: ${message.content}`, `Handler ${containerId}`);
});

client.on(GatewayDispatchEvents.Ready, () => {
    logger.infoSingle("Ready!", `Handler ${containerId}`);
});

client.on(GatewayDispatchEvents.Resumed, () => {
    logger.debugSingle("Resumed!", `Handler ${containerId}`);
});

await getContainer(env.HOSTNAME);
