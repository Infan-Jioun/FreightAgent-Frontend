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
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];
const AUTH_ROUTES = ["/login", "/register", "/register-agent", "/forgot-password", "/reset-password", "/verify-email"];
const CUSTOMER_ROUTES = ["/dashboard", "/shipments", "/profile", "/settings", "/tracking"];
const AGENT_ROUTES = ["/dashboard", "/shipments", "/profile", "/tracking"];
const ADMIN_ROUTES = ["/dashboard", "/shipments", "/profile", "/settings", "/admin"];

// ── JWT Decode (without library — Edge Runtime safe) ──────────────
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

function hasAccess(role: string, pathname: string): boolean {
  const path = "/" + pathname.split("/")[1]; // root segment only

  if (role === "ADMIN") {
    return ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  }
  if (role === "AGENT") {
    return AGENT_ROUTES.some((r) => pathname.startsWith(r));
  }
  if (role === "CUSTOMER") {
    return CUSTOMER_ROUTES.some((r) => pathname.startsWith(r));
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

  // ✅ Static files skip
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    /\.(png|jpg|jpeg|svg|ico|webp|woff2?)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ✅ Token নাও
  const token =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("freightagent.accessToken")?.value;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (r) => pathname === r || (r !== "/" && pathname.startsWith(r + "/"))
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (r) => pathname === r || (r !== "/" && pathname.startsWith(r + "/"))
  );

  // ── Case 1: No token ────────────────────────────────────────────
  if (!token) {
    // Public route — allow
    if (isPublicRoute) {
      return addSecurityHeaders(NextResponse.next());
    }
    // Protected route — redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname); // ← redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  // ── Case 2: Token exists — decode and validate ──────────────────
  const payload = decodeJWT(token);

  // Invalid or expired token
  if (!payload || isTokenExpired(payload)) {
    // If on a public route (e.g. Home page "/"), clear cookies and allow access without redirecting to login
    if (isPublicRoute) {
      const response = NextResponse.next();
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      response.cookies.delete("better-auth.session_token");
      return addSecurityHeaders(response);
    }

    // Protected route — clear cookie + redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    response.cookies.delete("better-auth.session_token");
    return addSecurityHeaders(response);
  }

  const role = getRole(payload);

  // ── Case 3: Logged in — trying to access auth pages ────────────
  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── Case 4: Role-based access check ────────────────────────────
  if (!isPublicRoute && role) {
    // Admin route — only ADMIN
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Check role has access
    if (!hasAccess(role, pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
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