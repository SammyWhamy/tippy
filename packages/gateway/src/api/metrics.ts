import { createServer } from "node:http";
import type { Environment } from "core/dist/env.js";
import { Logger } from "log";
import type { MetricsClient } from "metrics";
import { register } from "prom-client";

export type MetricsServerOptions = {
    env: Environment;
    metricsClient: MetricsClient;
};

const logger = new Logger();

export async function setupMetricsServer({ env }: MetricsServerOptions) {
    const server = createServer(async (req, res) => {
        if (req.url === "/metrics") {
            try {
                const metrics = await register.metrics();
                res.setHeader("Content-Type", "text/plain");
                res.end(metrics);
            } catch (err: any) {
                logger.error("Failed to get metrics", "Metrics", err);
                res.statusCode = 500;
                res.end("Internal Server Error");
            }
        } else {
            res.statusCode = 404;
            res.end("Not Found");
        }
    });

    server.listen(env.METRICS_PORT, env.METRICS_HOST, () => {
        logger.infoSingle(`Metrics server listening on ${env.METRICS_HOST}:${env.METRICS_PORT}`, "Metrics");
    });
}
