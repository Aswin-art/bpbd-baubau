import "server-only";

import { createClient } from "redis";

/**
 * Bentuk klien yang dikembalikan `createClient` — dipakai agar TypeScript tidak bentrok
 * antara `RedisClientType` default vs varian modul (mis. graph).
 */
export type BpbdRedisClient = ReturnType<typeof createClient>;

const globalForRedis = globalThis as unknown as {
  __bpbdRedis?: BpbdRedisClient | null;
  __bpbdRedisConnecting?: Promise<BpbdRedisClient | null>;
};

function redisUrl(): string | undefined {
  const url = process.env.REDIS_URL?.trim();
  return url || undefined;
}

/**
 * Shared Redis client (TCP). Set `REDIS_URL` (e.g. `redis://127.0.0.1:6379`).
 * Reused across hot reloads in development.
 */
export async function getRedis(): Promise<BpbdRedisClient | null> {
  const url = redisUrl();
  if (!url) return null;

  const existing = globalForRedis.__bpbdRedis;
  if (existing?.isOpen) return existing;

  let connecting = globalForRedis.__bpbdRedisConnecting;
  if (!connecting) {
    connecting = (async () => {
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
    globalForRedis.__bpbdRedisConnecting = connecting;
  }

  return connecting;
}

export function permNavCacheKey(role: string): string {
  return `bpbd:perm:nav:${role.toLowerCase()}`;
}
