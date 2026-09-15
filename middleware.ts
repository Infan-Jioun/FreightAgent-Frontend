/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Route Definitions ──────────────────────────────────────────────
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/quote",
  "/contact",
  "/login",
  "/register",
  "/register-agent",
  "/register/agent",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/tracking",
];
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/register-agent",
  "/register/agent",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// ── JWT Decode (without external library — Edge Runtime safe) ───────
function decodeJWT(token: string) {
  try {
    const base64 = token.split(".")[1];
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(payload: any): boolean {
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

function getRole(payload: any): string | null {
  return payload?.role || null;
}

function getRoleDashboard(role: string | null): string {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "AGENT") return "/dashboard/agent";
  return "/dashboard/customer";
}

function hasRoleAccess(role: string, pathname: string): boolean {
  if (role === "ADMIN") {
    return true;
  }
  if (role === "AGENT") {
    if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin")) return false;
    return true;
  }
  if (role === "CUSTOMER") {
    if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin")) return false;
    if (pathname.startsWith("/dashboard/agent")) return false;
    return true;
  }
  return false;
}

// ── Security Headers ───────────────────────────────────────────────
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set(
    "Content-Security-Policy",
    "frame-ancestors 'none';"
  );
  return response;
}

// ── Middleware ─────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files skip
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    /\.(png|jpg|jpeg|svg|ico|webp|woff2?)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Token extraction
  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("freightagent.accessToken")?.value ||
    request.cookies.get("better-auth.session_token")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (r) => pathname === r || (r !== "/" && pathname.startsWith(r + "/"))
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (r) => pathname === r || (r !== "/" && pathname.startsWith(r + "/"))
  );

  // ── Case 1: No token ────────────────────────────────────────────
  if (!token) {
    if (isPublicRoute) {
      return addSecurityHeaders(NextResponse.next());
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Case 2: Token exists — decode and validate ──────────────────
  const payload = decodeJWT(token);

  if (!payload || isTokenExpired(payload)) {
    if (isPublicRoute) {
      const response = NextResponse.next();
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      response.cookies.delete("better-auth.session_token");
      return addSecurityHeaders(response);
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("better-auth.session_token");
    return addSecurityHeaders(response);
  }

  const role = getRole(payload) || "CUSTOMER";

  // ── Case 3: Logged in — trying to access auth pages ────────────
  if (isAuthRoute) {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  // ── Case 4: Visiting bare /dashboard route ─────────────────────
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
  }

  // ── Case 5: Role-based access enforcement ──────────────────────
  if (!isPublicRoute) {
    if (!hasRoleAccess(role, pathname)) {
      return NextResponse.redirect(new URL(getRoleDashboard(role), request.url));
    }
  }

  // ── Allow ──────────────────────────────────────────────────────
  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.ico).*)",
  ],
};
