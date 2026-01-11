import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = ["/", "/login"];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login"];

export function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // Check for session cookie (NextAuth v5 uses authjs.session-token)
  const sessionCookie = request.cookies.get("authjs.session-token") ||
                        request.cookies.get("__Secure-authjs.session-token");
  const isLoggedIn = !!sessionCookie;

  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isApiRoute = nextUrl.pathname.startsWith("/api");

  // Allow API routes to pass through (they have their own auth)
  if (isApiRoute) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth routes to dashboard
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
