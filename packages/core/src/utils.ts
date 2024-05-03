import { request } from "node:http";
import { env } from "./env.js";

export function calculateWorkerId(shardIds: number[], shardsPerWorker: number): number {
    if (shardIds[0] === undefined) throw new Error("No shard IDs provided.");

    return Math.floor(shardIds[0] / shardsPerWorker);
}

export type Container = {
    Id: string;
    Names: string[];
    Image: string;
    ImageID: string;
    Command: string;
    Created: number;
    Ports: { IP?: string; PrivatePort?: number; PublicPort?: number; Type?: string }[];
    Labels: {
        [key: string]: string;
        "com.docker.compose.container-number": string;
    };
    State: string;
    Status: string;
    HostConfig: { NetworkMode: string };
    NetworkSettings: {
        Networks: {
            [key: string]: {
                IPAMConfig: null;
                Links: null;
                Aliases: null;
                NetworkID: string;
                EndpointID: string;
                Gateway: string;
                IPAddress: string;
                IPPrefixLen: number;
                IPv6Gateway: string;
                GlobalIPv6Address: string;
                GlobalIPv6PrefixLen: number;
                MacAddress: string;
                DriverOpts: null;
            };
        };
    };
    Mounts: { Type: string; Source: string; Destination: string; Mode: string; RW: boolean; Propagation: string }[];
};

export async function getContainer(containerId: string): Promise<Container> {
    const containers = (await new Promise((resolve, reject) => {
        const req = request(
            {
                socketPath: env.DOCKER_SOCK,
                path: "http://localhost/containers/json",
                method: "GET",
            },
            (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Failed to get containers: ${res.statusCode}`));
                }

                const buffers: Buffer[] = [];

                res.on("data", (chunk) => buffers.push(chunk));

                res.on("end", () => {
                    try {
                        resolve(JSON.parse(Buffer.concat(buffers).toString("utf8")));
                    } catch (error) {
                        reject(error);
                    }
                });

                res.on("error", reject);
            },
        );

        req.end();
    })) as Container[];

    const container = containers.find((c) => c.Id.startsWith(containerId));

    if (!container) {
        throw new Error(`Container ${containerId} not found.`);
    }

    return container;
}
