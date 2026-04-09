import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { rateLimit } from "@/lib/rate-limit";

// Rate limiter for general API endpoints
const apiLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

// Stricter rate limiter for auth operations
const authApiLimiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 200,
});

const authUiPaths = ["/sign-in", "/forgot-password"];
const protectedUiPaths = ["/dashboard"];

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

function validateCsrfOrigin(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

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
    const originHost = url.origin;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (baseUrl && originHost === new URL(baseUrl).origin) {
      return true;
    }

    if (process.env.NODE_ENV !== "production") {
      if (originHost.startsWith("http://localhost:")) return true;
    }

    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
    if (allowedOrigins.includes(originHost)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

function getRateLimiter(pathname: string): {
  limiter: ReturnType<typeof rateLimit>;
  limit: number;
} {
  if (pathname.startsWith("/api/auth")) {
    return { limiter: authApiLimiter, limit: 30 };
  }
  if (pathname.startsWith("/api/dashboard")) {
    return { limiter: apiLimiter, limit: 150 };
  }
  return { limiter: apiLimiter, limit: 100 };
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // === API ENDPOINTS ===
  if (pathname.startsWith("/api")) {
    // Skip for /api/auth/* — better-auth handles its own CSRF
    if (!pathname.startsWith("/api/auth")) {
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
    const { limiter, limit } = getRateLimiter(pathname);
    const { isRateLimited, remaining } = limiter.check(limit, ip);

    if (isRateLimited) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "Retry-After": "60",
          },
        },
      );
    }

    return NextResponse.next();
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

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next|_vercel|.*\\..*).*)",
};
