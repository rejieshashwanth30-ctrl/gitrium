import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/repositories",
  "/contributions",
  "/skills",
  "/evidence",
  "/integrity",
  "/analysis",
  "/career",
  "/reports",
  "/settings",
  "/github-connect",
  "/select-repositories",
];

const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Fast-path: Let API routes perform their own direct authentication without duplicate middleware session roundtrips
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 2. Refresh Supabase auth session and update cookies for pages
  const { supabaseResponse, user } = await updateSession(request);

  // 2. Exact match for own profile: /profile is protected, but /profile/:username is public
  const isOwnProfile = pathname === "/profile";
  const isProtected =
    isOwnProfile ||
    PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

  // 3. Handle unauthenticated access to protected routes
  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Handle authenticated users visiting login/signup
  const isAuthPage = AUTH_PAGES.includes(pathname);
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, logos, svg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

