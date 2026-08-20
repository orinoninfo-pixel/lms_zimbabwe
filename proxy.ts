import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE_NAME } from "@/lib/auth"

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])
const SERVER_CALLBACK_PATHS = new Set(["/api/payments/paynow/callback"])

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/api/") &&
    MUTATING_METHODS.has(request.method) &&
    !SERVER_CALLBACK_PATHS.has(request.nextUrl.pathname) &&
    request.cookies.has(SESSION_COOKIE_NAME)
  ) {
    const origin = request.headers.get("origin")
    const allowedOrigins = new Set([request.nextUrl.origin])
    const configuredUrl = process.env.NEXT_PUBLIC_APP_URL
    if (configuredUrl) {
      try {
        allowedOrigins.add(new URL(configuredUrl).origin)
      } catch {
        // Environment validation reports malformed configuration separately.
      }
    }

    if (origin && !allowedOrigins.has(origin)) {
      return NextResponse.json({ error: "Cross-origin request rejected" }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = { matcher: "/api/:path*" }
