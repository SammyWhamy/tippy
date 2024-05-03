import type { SessionInfo } from "@discordjs/ws";
import type { Redis } from "ioredis";

export class GatewayCache {
    constructor(private cache: Redis) {}

    async saveSession(shardId: number, session: SessionInfo): Promise<void> {
        if (!session) {
            await this.clearSession(shardId);
            return;
        }

        await this.cache.hset(
            `shards:${shardId}`,
            "resumeURL",
            session.resumeURL,
            "sequence",
            session.sequence,
            "sessionId",
            session.sessionId,
            "shardCount",
            session.shardCount,
        );
    }

    async getSession(shardId: number): Promise<SessionInfo | null> {
        const [resumeURL, sequence, sessionId, shardCount] = await this.cache.hmget(
            `shards:${shardId}`,
            "resumeURL",
            "sequence",
            "sessionId",
            "shardCount",
        );

        if (!sessionId || !sequence || !resumeURL || !shardCount) {
            return null;
        }

        return {
            shardId: shardId,
            resumeURL: resumeURL,
            sequence: Number(sequence),
            sessionId: sessionId,
            shardCount: Number(shardCount),
        };
    }

    async clearSession(shardId: number): Promise<void> {
        await this.cache.del(`shards:${shardId}`);
    }
}
