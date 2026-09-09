/**
 * Utility to manage and clear browser cookies on the client side.
 */

export const AUTH_COOKIE_NAMES = [
    "accessToken",
    "refreshToken",
    "freightagent.accessToken",
    "better-auth.session_token",
] as const;

export function clearClientCookies(): void {
    if (typeof document === "undefined") return;

    const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
    const secureFlag = isSecure ? "; Secure" : "";

    const cookiesToClear = new Set<string>(AUTH_COOKIE_NAMES);

    // Also pick up any existing cookies from document.cookie
    document.cookie.split(";").forEach((cookieStr) => {
        const name = cookieStr.split("=")[0]?.trim();
        if (name) {
            cookiesToClear.add(name);
        }
    });

    cookiesToClear.forEach((name) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; SameSite=Lax${secureFlag}`;
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0;`;
    });
}
