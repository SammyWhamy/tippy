import * as z from 'zod';

export const envie = z.object({
    DISCORD_TOKEN: z.string(),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.number().default(6379),
    REDIS_PASSWORD: z.string().default(''),
    REDIS_DATABASE: z.number().default(0),
    SHARD_COUNT: z.number(),
    SHARDS_PER_WORKER: z.number(),
    METRICS_PORT: z.number().default(9090),
    METRICS_HOST: z.string().default('0.0.0.0'),
    HOSTNAME: z.string(),
    LOG_LEVEL: z.number().default(3),
    DOCKER_SOCK: z.string().default('/var/run/docker.sock'),
});

export type Environment = z.infer<typeof envie>;

export const env: Environment = envie.parse(process.env);