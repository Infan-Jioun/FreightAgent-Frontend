import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/register-agent", "/forgot-password", "/reset-password", "/verify-email"];
const AUTH_ROUTES = ["/login", "/register", "/register-agent", "/forgot-password", "/reset-password", "/verify-email"];
const CUSTOMER_ROUTES = ["/dashboard", "/shipments", "/profile", "/settings", "/tracking"];
const AGENT_ROUTES = ["/dashboard", "/shipments", "/profile", "/tracking"];
const ADMIN_ROUTES = ["/dashboard", "/shipments", "/profile", "/settings", "/admin"];

function decodeJWT(token: string) {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
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
  if (role === "ADMIN") return ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  if (role === "AGENT") return AGENT_ROUTES.some((r) => pathname.startsWith(r));
  if (role === "CUSTOMER") return CUSTOMER_ROUTES.some((r) => pathname.startsWith(r));
  return false;
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  return response;
}

function clearAuthAndRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  response.cookies.delete("better-auth.session_token");
  return addSecurityHeaders(response);
}

export async function middleware(request: NextRequest) {
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

  const isPublicRoute = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  // ✅ accessToken নাও
  let accessToken =
    request.cookies.get("accessToken")?.value ||
    request.cookies.get("freightagent.accessToken")?.value;

  let payload = accessToken ? decodeJWT(accessToken) : null;

  // ✅ Token expired হলে refresh করার চেষ্টা করো
  if ((!accessToken || !payload || isTokenExpired(payload))) {
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      try {
        const backendUrl =
          process.env.BACKEND_API_URL ||
          "https://freight-agent-backend.vercel.app/api/v1";

        // Backend এ refresh token পাঠাও
        const refreshRes = await fetch(
          `${backendUrl}/auth/refresh-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              cookie: `refreshToken=${refreshToken}`,
            },
          }
        );

        if (refreshRes.ok) {
          // ✅ নতুন accessToken পাও
          const setCookies = refreshRes.headers.getSetCookie();
          const newAccessTokenCookie = setCookies.find((c) =>
            c.startsWith("accessToken=")
          );

          if (newAccessTokenCookie) {
            const newToken = newAccessTokenCookie.split(";")[0]?.split("=")[1];
            if (newToken) {
              accessToken = newToken;
              payload = decodeJWT(newToken);

              // ✅ নতুন token সহ continue করো
              const response = NextResponse.next();
              // নতুন cookie set করো
              setCookies.forEach((cookie) => {
                response.headers.append("set-cookie", cookie);
              });

              const role = getRole(payload);
              if (isAuthRoute) {
                return NextResponse.redirect(new URL("/dashboard", request.url));
              }
              if (!isPublicRoute && role && !hasAccess(role, pathname)) {
                return NextResponse.redirect(new URL("/dashboard", request.url));
              }
              return addSecurityHeaders(response);
            }
          }
        }
      } catch {
        // refresh failed — login এ redirect
      }
    }

    // ✅ refresh ও fail হলে
    if (!isPublicRoute) {
      return clearAuthAndRedirect(request);
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // ✅ Valid token আছে
  const role = getRole(payload);

  // Logged in — auth page এ যেতে চাইলে dashboard এ redirect
  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Role check
  if (!isPublicRoute && role && !hasAccess(role, pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.ico).*)",
  ],
};