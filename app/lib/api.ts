/* eslint-disable @next/next/no-location-assign-relative-destination */
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { envConfig } from "../config/env";
import status from "http-status";

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

interface RetryConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryConfig;

        if (
            error.response?.status === status.UNAUTHORIZED &&
            !originalRequest._retry
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
                    window.location.href = "/login";
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;