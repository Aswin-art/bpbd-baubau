import "server-only";

import { createClient, type RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as {
  __bpbdRedis?: RedisClientType;
  __bpbdRedisConnecting?: Promise<RedisClientType | null>;
};

function redisUrl(): string | undefined {
  const url = process.env.REDIS_URL?.trim();
  return url || undefined;
}

/**
 * Shared Redis client (TCP). Set `REDIS_URL` (e.g. `redis://127.0.0.1:6379`).
 * Reused across hot reloads in development.
 */
export async function getRedis(): Promise<RedisClientType | null> {
  const url = redisUrl();
  if (!url) return null;

  const existing = globalForRedis.__bpbdRedis;
  if (existing?.isOpen) return existing;

  if (!globalForRedis.__bpbdRedisConnecting) {
    globalForRedis.__bpbdRedisConnecting = (async () => {
      try {
        const client = createClient({ url });
        client.on("error", (err) => {
          console.error("[redis]", err.message);
        });
        await client.connect();
        globalForRedis.__bpbdRedis = client;
        return client;
      } catch (e) {
        console.error("[redis] connect failed:", e);
        return null;
      } finally {
        globalForRedis.__bpbdRedisConnecting = undefined;
      }
    })();
  }

  return globalForRedis.__bpbdRedisConnecting;
}

export function permNavCacheKey(role: string): string {
  return `bpbd:perm:nav:${role.toLowerCase()}`;
}
