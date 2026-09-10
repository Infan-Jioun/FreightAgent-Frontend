/* eslint-disable @next/next/no-location-assign-relative-destination */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { envConfig } from "../config/env";
import status from "http-status";
import { clearClientCookies } from "./cookie";

const api = axios.create({
    baseURL: envConfig.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (typeof document !== "undefined") {
        const match = document.cookie.match(/(^|;)\s*(?:accessToken|freightagent\.accessToken)=([^;]+)/);
        if (match && match[2]) {
            const token = decodeURIComponent(match[2]);
            if (token && !config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    }
    return config;
});

declare module "axios" {
    export interface AxiosRequestConfig {
        skipAuthRedirect?: boolean;
    }
}

interface RetryConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    skipAuthRedirect?: boolean;
}

const PUBLIC_PATHS = [
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

function isPublicPath(pathname: string): boolean {
    if (!pathname || pathname === "/" || pathname === "") return true;
    return PUBLIC_PATHS.some(
        (p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/"))
    );
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryConfig | undefined;

        if (
            error.response?.status === status.UNAUTHORIZED &&
            originalRequest &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/auth/refresh-token")
        ) {
            originalRequest._retry = true;

            try {
                await axios.post(
                    `${envConfig.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                return api(originalRequest);
            } catch {
                if (typeof window !== "undefined") {
                    localStorage.removeItem("auth-storage");
                    clearClientCookies();
                    const currentPath = window.location.pathname;
                    // Do not redirect to login if the user is on the home page, public route, or skipAuthRedirect is set
                    if (!originalRequest.skipAuthRedirect && !isPublicPath(currentPath)) {
                        window.location.href = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
                    }
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;