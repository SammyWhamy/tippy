import { z } from "zod";

export const envSchema = z.object({
    DISCORD_TOKEN: z.string(),
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().default(""),
    REDIS_DATABASE: z.coerce.number().default(0),
    SHARD_COUNT: z.coerce.number(),
    SHARDS_PER_WORKER: z.coerce.number(),
    METRICS_PORT: z.coerce.number().default(9090),
    METRICS_HOST: z.string().default("0.0.0.0"),
    HOSTNAME: z.string(),
    LOG_LEVEL: z.coerce.number().default(3),
    DOCKER_SOCK: z.string().default("/var/run/docker.sock"),
});

export type Environment = z.infer<typeof envSchema>;

export const env: Environment = envSchema.parse(process.env);
