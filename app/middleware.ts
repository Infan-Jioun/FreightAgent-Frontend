// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/tracking"];
const ADMIN_ROUTES = ["/admin"];
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    // Already logged in হলে dashboard এ redirect
    if (token && AUTH_ROUTES.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};