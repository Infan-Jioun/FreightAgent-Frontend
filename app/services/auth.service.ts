/* eslint-disable @typescript-eslint/no-explicit-any */
import { API } from "../constants/api";
import {
    IRegisterInput,
    IRegisterAgentPayload,
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

    registerAgent: async (payload: IRegisterAgentPayload) => {
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
    createAgent: async (payload: IRegisterAgentPayload) => {
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

    checkPhoneAvailability: async (
        phone: string
    ): Promise<{ available: boolean; message?: string }> => {
        const cleanPhone = phone.trim();
        try {
            // Check Redis/user data via backend endpoint
            const res = await api.post<IApiResponse<{ available?: boolean; exists?: boolean; inUse?: boolean }>>(
                API.AUTH.CHECK_PHONE,
                { phone: cleanPhone }
            );
            const data = res.data?.data;
            let isAvailable = true;
            if (data?.available !== undefined) {
                isAvailable = Boolean(data.available);
            } else if (data?.exists !== undefined) {
                isAvailable = !data.exists;
            } else if (data?.inUse !== undefined) {
                isAvailable = !data.inUse;
            }
            return {
                available: isAvailable,
                message: res.data?.message,
            };
        } catch (err: unknown) {
            const errObj = err as {
                response?: {
                    status?: number;
                    data?: { message?: string; available?: boolean; exists?: boolean };
                };
            };
            const status = errObj?.response?.status;
            const resData = errObj?.response?.data;
            const msg = resData?.message?.toLowerCase() || "";

            // If 404 (route not found on /auth/check-phone), try fallback to /user/check-phone
            if (status === 404) {
                try {
                    const fallbackRes = await api.post<IApiResponse<{ available?: boolean; exists?: boolean }>>(
                        "/user/check-phone",
                        { phone: cleanPhone }
                    );
                    const fbData = fallbackRes.data?.data;
                    const isAvailable = fbData?.available ?? (fbData?.exists !== undefined ? !fbData.exists : true);
                    return {
                        available: isAvailable,
                        message: fallbackRes.data?.message,
                    };
                } catch (fbErr: unknown) {
                    const fbErrObj = fbErr as {
                        response?: {
                            status?: number;
                            data?: { message?: string; available?: boolean; exists?: boolean };
                        };
                    };
                    const fbMsg = fbErrObj?.response?.data?.message?.toLowerCase() || "";
                    if (
                        fbErrObj?.response?.status === 409 ||
                        fbMsg.includes("already") ||
                        fbMsg.includes("exist") ||
                        fbMsg.includes("in use") ||
                        fbMsg.includes("registered") ||
                        fbMsg.includes("taken")
                    ) {
                        return {
                            available: false,
                            message: fbErrObj?.response?.data?.message || "This mobile number is already registered in Redis user records.",
                        };
                    }
                }
            }

            // Detect if backend returned conflict / already registered in Redis user data
            if (
                status === 409 ||
                resData?.available === false ||
                resData?.exists === true ||
                msg.includes("already") ||
                msg.includes("exist") ||
                msg.includes("in use") ||
                msg.includes("registered") ||
                msg.includes("redis") ||
                msg.includes("taken")
            ) {
                return {
                    available: false,
                    message: resData?.message || "This mobile number is already registered in Redis user records.",
                };
            }

            return {
                available: true,
                message: resData?.message,
            };
        }
    },
};