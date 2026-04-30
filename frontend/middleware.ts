import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED = [
  "/dashboard",
  "/applications",
  "/professors",
  "/email",
  "/statement",
  "/fellowships",
  "/briefing",
  "/calendar",
  "/drive",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some((route) => pathname.startsWith(route))

  if (isProtected && !request.cookies.get("pilotphd_logged_in")) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/applications/:path*",
    "/professors/:path*",
    "/email/:path*",
    "/statement/:path*",
    "/fellowships/:path*",
    "/briefing/:path*",
    "/calendar/:path*",
    "/drive/:path*",
  ],
}
