/**
 * Canonical list of browser origins trusted for CSRF (Origin/Referer) and
 * better-auth `trustedOrigins`. Keep in sync with `proxy.ts` checks.
 */

import { getBaseUrl } from "./url";

function addOriginFromEnvUrl(out: Set<string>, raw: string | undefined) {
  if (!raw?.trim()) return;
  try {
    out.add(new URL(raw.trim()).origin);
  } catch {
    /* ignore invalid env */
  }
}

/** Origins derived from env only (no request). */
export function getEnvTrustedOrigins(): string[] {
  const out = new Set<string>();

  addOriginFromEnvUrl(out, process.env.NEXT_PUBLIC_BASE_URL);
  addOriginFromEnvUrl(out, process.env.NEXT_PUBLIC_APP_URL);

  for (const piece of process.env.ALLOWED_ORIGINS?.split(",") ?? []) {
    addOriginFromEnvUrl(out, piece.trim());
  }

  if (process.env.NODE_ENV !== "production") {
    out.add("http://localhost:3000");
    out.add("http://127.0.0.1:3000");
    out.add("http://localhost:3001");
    out.add("http://127.0.0.1:3001");
  }

  return [...out];
}

/** Origins for middleware CSRF: current request origin plus env list. */
export function getAllowedOriginsForRequest(requestOrigin: string): Set<string> {
  const out = new Set<string>([requestOrigin]);
  for (const o of getEnvTrustedOrigins()) {
    out.add(o);
  }
  return out;
}

/** Full URL strings for better-auth `trustedOrigins` (includes path-less origins). */
export function getAuthTrustedOrigins(): string[] {
  const out = new Set(getEnvTrustedOrigins());
  addOriginFromEnvUrl(out, getBaseUrl());
  return [...out];
}
