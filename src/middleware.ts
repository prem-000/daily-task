import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthUser } from "./lib/auth";

// Define protected and authenticated-only route groups
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/chat", "/notifications", "/settings"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Fetch authenticated session
  const user = await getAuthUser(request);

  // 2. Route Guards
  
  // A. Protect dashboard routes: Redirect to /login if user is not authenticated
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (isProtectedRoute && !user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // B. Protect login/register routes: Redirect authenticated users away to /dashboard
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow through if no match or authorized
  return NextResponse.next();
}

// Config to specify matching route paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder static files (e.g. svg, png)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)",
  ],
};
