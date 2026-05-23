// proxy.ts — Disabled for static export (output: 'export') / Capacitor APK build.
// Next.js 16 renamed "middleware" to "proxy". This file is a no-op pass-through.
// Auth protection is handled client-side via useAuth() + useEffect redirects
// in NavigationWrapper, analytics/page, profile/page, login/page, and register/page.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16 requires the exported function to be named "proxy"
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

// Empty matcher — proxy never intercepts any route
export const config = {
  matcher: [],
};
