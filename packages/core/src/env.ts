export type Environment = {
    DISCORD_TOKEN: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD: string;
    REDIS_DATABASE: number;
    SHARD_COUNT: number;
    SHARDS_PER_WORKER: number;
    METRICS_PORT: number;
    METRICS_HOST: string;
    HOSTNAME: string;
    LOG_LEVEL: number;
    DOCKER_SOCK: string;
};

export const env: Environment = {
    DISCORD_TOKEN: getRequiredString("DISCORD_TOKEN"),
    REDIS_HOST: getString("REDIS_HOST", "localhost"),
    REDIS_PORT: getInt("REDIS_PORT", 6379),
    REDIS_PASSWORD: getString("REDIS_PASSWORD", ""),
    REDIS_DATABASE: getInt("REDIS_DATABASE", 0),
    SHARD_COUNT: getRequiredInt("SHARD_COUNT"),
    SHARDS_PER_WORKER: getRequiredInt("SHARDS_PER_WORKER"),
    METRICS_PORT: getInt("METRICS_PORT", 9090),
    METRICS_HOST: getString("METRICS_HOST", "0.0.0.0"),
    HOSTNAME: getRequiredString("HOSTNAME"),
    LOG_LEVEL: getInt("LOG_LEVEL", 3),
    DOCKER_SOCK: getString("DOCKER_SOCK", "/var/run/docker.sock"),
};

function getString(key: string, defaultValue: string): string {
    return process.env[key] ?? defaultValue;
}

function getRequiredString(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`No value provided for ${key}.`);
    }

    return value;
}

function getInt(key: string, defaultValue: number): number {
    const value = process.env[key];

    if (!value) {
        return defaultValue;
    }

    const int = Number.parseInt(value);

    if (Number.isNaN(int)) {
        throw new Error(`Invalid value provided for ${key}.`);
    }

    return int;
}

function getRequiredInt(key: string): number {
    const value = process.env[key];
    if (!value) {
        throw new Error(`No value provided for ${key}.`);
    }

    const int = Number.parseInt(value);
    if (Number.isNaN(int)) {
        throw new Error(`Invalid value provided for ${key}.`);
    }

    return int;
}
