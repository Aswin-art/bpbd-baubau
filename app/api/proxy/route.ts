import { createSecureProxyHandler } from "@/lib/secure-upstream-proxy";

// Needs Node.js runtime (dns/net used for SSRF protection)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Proxy endpoint (secured).
 *
 * Usage:
 *   /api/proxy?target=<id>&path=/some/upstream/path&...
 *
 * IMPORTANT:
 * - You must add allowed targets here (allowlist).
 * - This endpoint requires an authenticated session by default.
 */
export const GET = createSecureProxyHandler({
  auth: {
    required: true,
    // If you want to restrict to a specific feature permission, set it here.
    // permission: { resource: "maps", action: "read" },
  },
  targets: [
    // Add your upstreams here, e.g.:
    // { id: "osm", origin: "https://tile.openstreetmap.org", allowPath: /^\/\d+\/\d+\/\d+\.png$/ },
  ],
});

