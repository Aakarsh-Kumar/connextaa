import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
  const isAuthRoute = pathname.startsWith("/login");

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    // Keep track of original target url to redirect back after login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/onboarding", "/login"],
};
