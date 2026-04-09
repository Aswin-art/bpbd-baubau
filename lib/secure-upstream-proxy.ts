import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { auth } from "@/lib/auth";
import { checkPermission } from "@/lib/permission-cache";

type ProxyTarget = {
  /** Identifier passed by client: ?target=... */
  id: string;
  /** Base origin, e.g. "https://example.com" */
  origin: string;
  /** Allowlist for pathname (relative to origin). */
  allowPath: RegExp;
  /** Optional allowlist for query keys */
  allowQueryKeys?: RegExp;
};

export type UpstreamProxyOptions = {
  /** Maximum requests per window per (ip+target). */
  rateLimitMax?: number;
  /** Window length in ms. */
  rateLimitWindowMs?: number;
  /** Request timeout in ms. */
  timeoutMs?: number;
  /**
   * AuthN/AuthZ for proxy access.
   * By default, proxy access is protected (requires session).
   */
  auth?: {
    required?: boolean;
    /**
     * Optional permission check against role-permissions table.
     * Example: { resource: "maps", action: "read" }
     */
    permission?: { resource: string; action: string };
  };
  /** Allowed proxy targets (SSRF protection). */
  targets: ProxyTarget[];
};

type RateState = { resetAt: number; count: number };
const RATE = new Map<string, RateState>();

function now() {
  return Date.now();
}

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function isPrivateIp(ip: string): boolean {
  // IPv4 private / reserved ranges
  if (ip.includes(".")) {
    const [a, b] = ip.split(".").map((x) => Number.parseInt(x || "0", 10));
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a >= 224) return true; // multicast + reserved
    return false;
  }

  // IPv6 loopback/link-local/unique-local
  const s = ip.toLowerCase();
  if (s === "::1") return true;
  if (s.startsWith("fe80:")) return true; // link-local
  if (s.startsWith("fc") || s.startsWith("fd")) return true; // unique local
  return false;
}

async function assertPublicHostname(hostname: string) {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost")) {
    throw new Error("Blocked hostname");
  }

  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("Blocked IP");
    return;
  }

  const records = await lookup(hostname, { all: true, verbatim: true });
  for (const r of records) {
    if (r.address && isPrivateIp(r.address)) {
      throw new Error("Blocked resolved IP");
    }
  }
}

function rateLimit(key: string, max: number, windowMs: number) {
  const t = now();
  const state = RATE.get(key);
  if (!state || state.resetAt <= t) {
    RATE.set(key, { resetAt: t + windowMs, count: 1 });
    return { ok: true, remaining: max - 1, resetAt: t + windowMs };
  }
  if (state.count >= max) {
    return { ok: false, remaining: 0, resetAt: state.resetAt };
  }
  state.count += 1;
  return {
    ok: true,
    remaining: Math.max(0, max - state.count),
    resetAt: state.resetAt,
  };
}

function sanitizeForwardHeaders(req: NextRequest) {
  // Only forward safe headers. Never forward cookies/authorization.
  const out = new Headers();
  const accept = req.headers.get("accept");
  const acceptLanguage = req.headers.get("accept-language");
  const userAgent = req.headers.get("user-agent");

  if (accept) out.set("accept", accept);
  if (acceptLanguage) out.set("accept-language", acceptLanguage);
  if (userAgent) out.set("user-agent", userAgent);

  const contentType = req.headers.get("content-type");
  if (contentType) out.set("content-type", contentType);

  return out;
}

function sanitizeResponseHeaders(headers: Headers) {
  const out = new Headers(headers);
  out.delete("set-cookie");
  out.delete("www-authenticate");
  if (!out.has("cache-control")) out.set("cache-control", "no-store");
  return out;
}

/**
 * Upstream proxy handler (Route Handler helper; Node.js runtime).
 *
 * Query params:
 * - target: one of options.targets[].id
 * - path: relative path to fetch (must match allowPath, starts with "/")
 * - ...other query params will be forwarded only if allowed by allowQueryKeys
 */
export function createSecureProxyHandler(options: UpstreamProxyOptions) {
  const {
    targets,
    rateLimitMax = 60,
    rateLimitWindowMs = 60_000,
    timeoutMs = 15_000,
    auth: authOptions = { required: true },
  } = options;

  const targetById = new Map(targets.map((t) => [t.id, t] as const));

  return async function secureProxy(req: NextRequest) {
    if (req.method !== "GET") {
      return NextResponse.json(
        { status: "error", message: "Method not allowed" },
        { status: 405 },
      );
    }

    const requireAuth = authOptions.required !== false;
    if (requireAuth) {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session?.user) {
        return NextResponse.json(
          { status: "error", message: "Authentication required" },
          { status: 401 },
        );
      }
      if (authOptions.permission) {
        const ok = await checkPermission(
          session.user.role,
          authOptions.permission.resource,
          authOptions.permission.action,
        );
        if (!ok) {
          return NextResponse.json(
            { status: "error", message: "Forbidden" },
            { status: 403 },
          );
        }
      }
    }

    const url = new URL(req.url);
    const targetId = (url.searchParams.get("target") || "").trim();
    const path = (url.searchParams.get("path") || "").trim();

    const target = targetById.get(targetId);
    if (!target) {
      return NextResponse.json(
        { status: "error", message: "Invalid target" },
        { status: 400 },
      );
    }

    if (!path.startsWith("/") || path.includes("..")) {
      return NextResponse.json(
        { status: "error", message: "Invalid path" },
        { status: 400 },
      );
    }
    if (!target.allowPath.test(path)) {
      return NextResponse.json(
        { status: "error", message: "Path not allowed" },
        { status: 403 },
      );
    }

    const ip = getClientIp(req);
    const rlKey = `${ip}:${target.id}`;
    const rl = rateLimit(rlKey, rateLimitMax, rateLimitWindowMs);
    if (!rl.ok) {
      return NextResponse.json(
        { status: "error", message: "Too many requests" },
        {
          status: 429,
          headers: {
            "retry-after": String(Math.ceil((rl.resetAt - now()) / 1000)),
            "x-ratelimit-limit": String(rateLimitMax),
            "x-ratelimit-remaining": "0",
          },
        },
      );
    }

    const upstream = new URL(target.origin);
    await assertPublicHostname(upstream.hostname);

    const upstreamUrl = new URL(path, upstream.origin);
    for (const [k, v] of url.searchParams.entries()) {
      if (k === "target" || k === "path") continue;
      if (target.allowQueryKeys && !target.allowQueryKeys.test(k)) continue;
      upstreamUrl.searchParams.append(k, v);
    }

    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), timeoutMs);
    try {
      const res = await fetch(upstreamUrl.toString(), {
        method: "GET",
        headers: sanitizeForwardHeaders(req),
        signal: ac.signal,
        redirect: "manual",
      });

      const headers = sanitizeResponseHeaders(res.headers);
      headers.set("x-proxy-target", target.id);
      headers.set("x-ratelimit-limit", String(rateLimitMax));
      headers.set("x-ratelimit-remaining", String(rl.remaining));

      return new NextResponse(res.body, {
        status: res.status,
        headers,
      });
    } catch (e) {
      const msg =
        e instanceof Error && e.name === "AbortError"
          ? "Upstream timeout"
          : "Upstream request failed";
      return NextResponse.json({ status: "error", message: msg }, { status: 502 });
    } finally {
      clearTimeout(timeout);
    }
  };
}

