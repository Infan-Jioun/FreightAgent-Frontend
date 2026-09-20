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

export function setClientCookie(name: string, value: string, days = 1): void {
    if (typeof document === "undefined") return;

    const maxAge = days * 24 * 60 * 60;
    const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
    const secureFlag = isSecure ? "; Secure" : "";

    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
}

export function getClientCookie(name: string): string | null {
    if (typeof document === "undefined") return null;

    const match = document.cookie.match(new RegExp(`(?:^|; )\\s*${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}
