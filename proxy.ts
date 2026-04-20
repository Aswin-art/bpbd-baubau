import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { getAllowedOriginsForRequest } from "@/lib/trusted-origins";
import { rateLimit } from "@/lib/rate-limit";

const isDev = process.env.NODE_ENV !== "production";

// Rate limiter for general API endpoints
const apiLimiter = rateLimit({
  prefix: "api",
  limit: 100,
  interval: 60 * 1000,
});

// Stricter rate limiter for auth operations
const authApiLimiter = rateLimit({
  prefix: "auth",
  limit: 30,
  interval: 60 * 1000,
});

const dashboardApiLimiter = rateLimit({
  prefix: "dashboard",
  limit: 150,
  interval: 60 * 1000,
});

const uploadApiLimiter = rateLimit({
  prefix: "upload",
  limit: 20,
  interval: 60 * 1000,
});

const publicWriteLimiter = rateLimit({
  prefix: "public-write",
  limit: 20,
  interval: 60 * 1000,
});

const authUiPaths = ["/sign-in", "/forgot-password"];
const protectedUiPaths = ["/dashboard"];
const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
const allowedFetchSites = new Set(["same-origin", "same-site", "none"]);

function getClientIp(request: NextRequest): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  return "127.0.0.1";
}

function hasSessionCookie(request: NextRequest): boolean {
  const sessionToken = getSessionCookie(request);
  return !!sessionToken && sessionToken.length > 10;
}

function isPathMatching(pathname: string, paths: string[]): boolean {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function getAllowedOrigins(request: NextRequest): Set<string> {
  return getAllowedOriginsForRequest(request.nextUrl.origin);
}

function validateCsrfOrigin(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (safeMethods.has(method)) return true;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const headerValue = origin || referer;

  if (!headerValue) return false;

  try {
    // Some environments may send a relative Referer like "/api/..."
    // Treat as same-origin (safe) by resolving against current request URL.
    const url = headerValue.startsWith("/")
      ? new URL(headerValue, request.url)
      : new URL(headerValue);
    return getAllowedOrigins(request).has(url.origin);
  } catch {
    return false;
  }
}

function validateFetchMetadata(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (safeMethods.has(method)) return true;

  const fetchSite = request.headers.get("sec-fetch-site");
  if (!fetchSite) {
    // Non-browser clients commonly omit Fetch Metadata headers.
    return true;
  }

  return allowedFetchSites.has(fetchSite);
}

function getRateLimiter(pathname: string): {
  limiter: ReturnType<typeof rateLimit>;
  limit: number;
} {
  if (pathname.startsWith("/api/auth")) {
    return { limiter: authApiLimiter, limit: 30 };
  }
  if (pathname.startsWith("/api/upload")) {
    return { limiter: uploadApiLimiter, limit: 20 };
  }
  if (
    pathname.startsWith("/api/public/aspirations") ||
    pathname.includes("/comments") ||
    pathname.startsWith("/api/map-disasters")
  ) {
    return { limiter: publicWriteLimiter, limit: 20 };
  }
  if (pathname.startsWith("/api/dashboard")) {
    return { limiter: dashboardApiLimiter, limit: 150 };
  }
  return { limiter: apiLimiter, limit: 100 };
}

function createRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter: number;
}) {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.reset / 1000).toString(),
    "RateLimit-Limit": result.limit.toString(),
    "RateLimit-Remaining": result.remaining.toString(),
    "RateLimit-Reset": result.retryAfter.toString(),
  };
}

function buildContentSecurityPolicy(nonce: string) {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // OWASP strict CSP: migrate inline styles to CSS modules / nonce; chart + map still rely on inline today.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://picsum.photos https://ui-avatars.com https://grainy-gradients.vercel.app https://basemaps.cartocdn.com",
    "font-src 'self' data:",
    "connect-src 'self' https://basemaps.cartocdn.com https://fonts.openmaptiles.org",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "frame-src 'self' https://www.google.com https://maps.google.com https://www.openstreetmap.org",
    "manifest-src 'self'",
    "media-src 'self' blob: data:",
    !isDev ? "upgrade-insecure-requests" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === API ENDPOINTS ===
  if (pathname.startsWith("/api")) {
    // Skip for /api/auth/* — better-auth handles its own CSRF
    if (!pathname.startsWith("/api/auth")) {
      if (!validateFetchMetadata(request)) {
        return new NextResponse(
          JSON.stringify({
            status: "error",
            message: "Cross-site unsafe request blocked",
            code: "FETCH_METADATA_BLOCKED",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (!validateCsrfOrigin(request)) {
        return new NextResponse(
          JSON.stringify({
            status: "error",
            message: "CSRF validation failed",
            code: "CSRF_ERROR",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    const ip = getClientIp(request);
    const { limiter } = getRateLimiter(pathname);
    const rateLimitResult = await limiter.check(ip);

    if (rateLimitResult.isRateLimited) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            ...createRateLimitHeaders(rateLimitResult),
            "Retry-After": rateLimitResult.retryAfter.toString(),
          },
        },
      );
    }

    const response = NextResponse.next();
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
    for (const [key, value] of Object.entries(rateLimitHeaders)) {
      response.headers.set(key, value);
    }
    return response;
  }

  // Skip proxy for static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // === ROUTE PROTECTION ===
  const hasSession = hasSessionCookie(request);

  // Redirect authenticated users away from auth pages
  if (hasSession && isPathMatching(pathname, authUiPaths)) {
    return NextResponse.redirect(new URL("/dashboard/profiles", request.url));
  }

  // Redirect unauthenticated users to sign-in for protected UI
  if (!hasSession && isPathMatching(pathname, protectedUiPaths)) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", contentSecurityPolicy);

  return response;
}

export const config = {
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
