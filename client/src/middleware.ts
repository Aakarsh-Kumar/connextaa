import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  
  console.log("Cookies:", request.cookies.getAll());
  const token = request.cookies.get("token")?.value;
  console.log("Token:", token);
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

  if (isProtectedRoute && !token) {
    const homeUrl = new URL("/", request.url);
    homeUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/onboarding"],
};
