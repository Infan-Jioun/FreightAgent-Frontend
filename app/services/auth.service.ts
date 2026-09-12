/* eslint-disable @typescript-eslint/no-explicit-any */
import { API } from "../constants/api";
import {
    IRegisterInput,
    ILoginInput,
    IVerifyOtpInput,
    IForgotPasswordInput,
    IResetPasswordInput,
    IChangePasswordInput,
    IUser,
    IApiResponse,
} from "../types/auth.types";
import api from "../lib/api";
import { clearClientCookies } from "../lib/cookie";
import { AppError, getErrorMessage } from "../errorHelper/appError";

export interface RateLimitInfo {
    limit: number;
    remaining: number;
    resetSeconds: number;
}

// extend the shared response shape with optional rate-limit info
// so register()/login() callers can read it without a type cast
export type IApiResponseWithRateLimit<T> = IApiResponse<T> & {
    rateLimit?: RateLimitInfo | null;
};

function extractRateLimit(headers: any): RateLimitInfo | null {
    if (!headers) return null;
    const limit = headers["ratelimit-limit"];
    const remaining = headers["ratelimit-remaining"];
    const reset = headers["ratelimit-reset"]; // seconds, per standardHeaders spec
    if (limit == null || remaining == null || reset == null) return null;
    return {
        limit: Number(limit),
        remaining: Number(remaining),
        resetSeconds: Number(reset),
    };
}

export const authService = {
    register: async (
        payload: IRegisterInput
    ): Promise<IApiResponseWithRateLimit<{ user: IUser }>> => {
        try {
            const res = await api.post<IApiResponse<{ user: IUser }>>(
                API.AUTH.REGISTER,
                payload
            );
            return { ...res.data, rateLimit: extractRateLimit(res.headers) };
        } catch (err: any) {
            err.rateLimit = extractRateLimit(err?.response?.headers);
            throw err;
        }
    },

    registerAgent: async (payload: IRegisterInput) => {
        const res = await api.post<IApiResponse<{ user: IUser }>>(
            API.AUTH.REGISTER_AGENT,
            payload
        );
        return res.data;
    },

    login: async (
        payload: ILoginInput
    ): Promise<IApiResponseWithRateLimit<{ user: IUser }>> => {
        try {
            const res = await api.post<IApiResponse<{ user: IUser }>>(
                API.AUTH.LOGIN,
                payload
            );
            return { ...res.data, rateLimit: extractRateLimit(res.headers) };
        } catch (err: any) {
            err.rateLimit = extractRateLimit(err?.response?.headers);
            throw err;
        }
    },

    logout: async () => {
        try {
            // 1. Invalidate session and clear cookies on the backend
            await api.post<IApiResponse<null>>(API.AUTH.LOGOUT);
        } catch (e) {
            console.error("Backend logout error:", e);
        }

        try {
            // 2. Clear cookies on frontend domain via Next.js route handler
            if (typeof window !== "undefined") {
                await fetch(`${API.AUTH.LOGOUT}`, {
                    method: "POST",
                    credentials: "include",
                });
            }
        } catch (e) {
            console.error("Frontend cookie clearance error:", e);
        }

        // 3. Clear all auth cookies directly via document.cookie
        clearClientCookies();

        // 4. Remove local auth storage
        if (typeof window !== "undefined") {
            localStorage.removeItem("auth-storage");
        }

        return { success: true, message: "Logged out successfully" };
    },

    verifyOtp: async (payload: IVerifyOtpInput) => {
        const res = await api.post<IApiResponse<{ user: IUser }>>(
            API.AUTH.VERIFY_OTP,
            payload
        );
        return res.data;
    },

    sendOtp: async (email: string) => {
        const res = await api.post<IApiResponse<null>>(API.AUTH.SEND_OTP, {
            email,
        });
        return res.data;
    },

    forgotPassword: async (payload: IForgotPasswordInput) => {
        const res = await api.post<IApiResponse<null>>(
            API.AUTH.FORGOT_PASSWORD,
            payload
        );
        return res.data;
    },

    resetPassword: async (payload: IResetPasswordInput) => {
        const res = await api.post<IApiResponse<null>>(
            API.AUTH.RESET_PASSWORD,
            payload
        );
        return res.data;
    },

    getMe: async () => {
        const res = await api.get<IApiResponse<IUser>>(API.USER.ME, {
            skipAuthRedirect: true,
        });
        return res.data;
    },
    createAgent: async (payload: IRegisterInput) => {
        const res = await api.post<IApiResponse<{ user: IUser }>>(
            API.AUTH.REGISTER_AGENT,
            payload
        );
        return res.data;
    },

    sendChangePasswordOtp: async (payload?: { currentPassword?: string; email?: string }): Promise<{ message: string }> => {
        try {
            const res = await api.post<IApiResponse<null>>(
                API.AUTH.CHANGE_PASSWORD_OTP,
                payload || {}
            );
            return { message: res.data?.message || "Verification code sent to your email" };
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    changePassword: async (payload: IChangePasswordInput): Promise<{ message: string }> => {
        try {
            const body = {
                currentPassword: payload.currentPassword || payload.oldPassword,
                oldPassword: payload.oldPassword || payload.currentPassword,
                newPassword: payload.newPassword,
                otp: payload.otp.trim(),
            };
            const res = await api.post<IApiResponse<any>>(
                API.AUTH.CHANGE_PASSWORD,
                body
            );
            return { message: res.data?.message || "Password changed successfully" };
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },
};