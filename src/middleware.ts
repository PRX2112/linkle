import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "./lib/ratelimit";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Determine rate limiting group
  let limitType: "subscribe" | "analytics" | "auth" | null = null;

  if (path === "/api/subscribe") {
    limitType = "subscribe";
  } else if (path.startsWith("/api/analytics")) {
    limitType = "analytics";
  } else if (path === "/api/register" || path.startsWith("/api/auth")) {
    // Exclude NextAuth read-only/helper endpoints to prevent breaking active sessions
    const excludedAuthPaths = [
      "/api/auth/session",
      "/api/auth/csrf",
      "/api/auth/providers",
    ];
    if (!excludedAuthPaths.some(excluded => path.startsWith(excluded))) {
      limitType = "auth";
    }
  }

  // If the path matches one of our target routes, apply rate limiting
  if (limitType) {
    // Robust IP resolution prioritizes trusted proxy headers before x-forwarded-for
    const ip =
      request.headers.get("x-real-ip")?.trim() ||
      request.headers.get("cf-connecting-ip")?.trim() ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      (request as any).ip ||
      "127.0.0.1";

    const { success, limit, remaining, reset } = await checkRateLimit(ip, limitType);

    if (!success) {
      const errorMessages = {
        subscribe: "Too many subscription attempts. Please try again in a minute.",
        analytics: "Too many requests. Please slow down.",
        auth: "Too many authentication attempts. Please slow down and try again later.",
      };

      return new NextResponse(
        JSON.stringify({ error: errorMessages[limitType] }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

// Config to specify matching paths
export const config = {
  matcher: [
    "/api/subscribe",
    "/api/analytics/:path*",
    "/api/auth/:path*",
    "/api/register",
  ],
};

