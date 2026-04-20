import { getRedis } from "@/lib/redis";

type RateLimitOptions = {
  prefix: string;
  limit: number;
  interval?: number;
};

export type RateLimitResult = {
  isRateLimited: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number;
  /** `redis` = counted; `unconfigured` = no REDIS_URL (requests allowed); `degraded` = Redis error (requests allowed). */
  source: "redis" | "unconfigured" | "degraded";
};

let hasWarnedMissingRedis = false;
let hasWarnedRedisFailure = false;

function warnOnce(kind: "missing" | "failure", message: string) {
  if (kind === "missing" && hasWarnedMissingRedis) return;
  if (kind === "failure" && hasWarnedRedisFailure) return;

  if (kind === "missing") hasWarnedMissingRedis = true;
  if (kind === "failure") hasWarnedRedisFailure = true;
  console.warn(message);
}

async function hashIdentifier(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function degradedResult(options: RateLimitOptions, reset: number, retryAfter: number): RateLimitResult {
  return {
    isRateLimited: false,
    limit: options.limit,
    remaining: options.limit,
    reset,
    retryAfter,
    source: "degraded",
  };
}

function unconfiguredResult(options: RateLimitOptions, reset: number, retryAfter: number): RateLimitResult {
  return {
    isRateLimited: false,
    limit: options.limit,
    remaining: options.limit,
    reset,
    retryAfter,
    source: "unconfigured",
  };
}

export function rateLimit(options: RateLimitOptions) {
  const interval = options.interval || 60_000;

  return {
    async check(token: string): Promise<RateLimitResult> {
      const reset = (Math.floor(Date.now() / interval) + 1) * interval;
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      const hashedToken = await hashIdentifier(token);
      const redisKey = `bpbd:rl:${options.prefix}:${Math.floor(Date.now() / interval)}:${hashedToken}`;

      const client = await getRedis();
      if (!client) {
        warnOnce(
          "missing",
          "[rate-limit] REDIS_URL tidak diatur — rate limiting dinonaktifkan (semua permintaan diizinkan).",
        );
        return unconfiguredResult(options, reset, retryAfter);
      }

      try {
        const currentUsage = await client.incr(redisKey);
        if (currentUsage === 1) {
          await client.pExpireAt(redisKey, reset);
        }

        return {
          isRateLimited: currentUsage > options.limit,
          limit: options.limit,
          remaining: Math.max(0, options.limit - currentUsage),
          reset,
          retryAfter,
          source: "redis",
        };
      } catch (error) {
        warnOnce(
          "failure",
          `[rate-limit] Redis error — permintaan tetap diizinkan. ${error instanceof Error ? error.message : String(error)}`,
        );
        return degradedResult(options, reset, retryAfter);
      }
    },
  };
}
