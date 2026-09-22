/* eslint-disable @typescript-eslint/no-explicit-any */
import { API } from "../constants/api";
import {
    IRegisterInput,
    IRegisterAgentPayload,
    ILoginInput,
    IVerifyOtpInput,
    IVerifyOtpResponseData,
    IForgotPasswordInput,
    IResetPasswordInput,
    IChangePasswordInput,
    IUser,
    IApiResponse,
    ILoginResponseData,
} from "../types/auth.types";
import api from "../lib/api";
import { clearClientCookies, setAuthCookies } from "../lib/cookie";
import { useAuthStore } from "../store/authStore";
import { AppError, getErrorMessage } from "../errorHelper/appError";
import type { RateLimitInfo, IApiResponseWithRateLimit } from "@/app/types/interface";

export type { RateLimitInfo, IApiResponseWithRateLimit };

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

/**
 * Parses and persists authentication tokens and user info into browser cookies,
 * localStorage, and global Axios defaults so Next.js middleware and SSR can immediately recognize the session.
 */
export function saveAuthSession(resData: any): { user?: IUser; accessToken?: string } {
    if (typeof window === "undefined" || !resData) return {};

    const raw = resData?.data || resData;
    const accessToken =
        raw?.accessToken ||
        raw?.token ||
        raw?.access_token ||
        resData?.accessToken ||
        resData?.token;
    const refreshToken =
        raw?.refreshToken ||
        raw?.refresh_token ||
        resData?.refreshToken ||
        resData?.refresh_token;
    let user = raw?.user || resData?.user || (raw?.id && raw?.role ? (raw as IUser) : null);

    // Fallback: If user is missing from response payload, decode user claims from JWT accessToken
    if (!user && accessToken && typeof accessToken === "string") {
        try {
            const parts = accessToken.split(".");
            if (parts.length === 3) {
                let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                while (base64.length % 4) {
                    base64 += "=";
                }
                const payload = JSON.parse(decodeURIComponent(escape(atob(base64))));
                const jwtUser = payload?.data || payload?.user || payload;
                if (jwtUser && typeof jwtUser === "object" && (jwtUser.id || jwtUser.email || jwtUser.role)) {
                    user = jwtUser as IUser;
                }
            }
        } catch {
            // Ignore JWT decode errors
        }
    }

    if (accessToken && typeof accessToken === "string") {
        setAuthCookies({ accessToken, refreshToken });
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    }

    if (user) {
        useAuthStore.getState().setUser(user);
        try {
            localStorage.setItem(
                "auth-storage",
                JSON.stringify({ state: { user, isAuthenticated: true }, version: 0 })
            );
        } catch {}
    }

    return { user: user || undefined, accessToken };
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
    ): Promise<IApiResponseWithRateLimit<ILoginResponseData>> => {
        try {
            const res = await api.post<IApiResponse<ILoginResponseData>>(
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

    verifyOtp: async (
        payload: IVerifyOtpInput
    ): Promise<IApiResponse<IVerifyOtpResponseData>> => {
        const res = await api.post<IApiResponse<IVerifyOtpResponseData>>(
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
        phone: string,
        altPhone?: string
    ): Promise<{ available: boolean; message?: string }> => {
        const cleanPhone = phone.trim();
        const cleanAlt = altPhone?.trim();

        const checkSingle = async (targetPhone: string): Promise<{ available: boolean; message?: string }> => {
            try {
                // 1. Primary: POST /auth/check-phone
                const res = await api.post<IApiResponse<{ available?: boolean; exists?: boolean; inUse?: boolean }>>(
                    API.AUTH.CHECK_PHONE,
                    { phone: targetPhone }
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
                        data?: { message?: string; available?: boolean; exists?: boolean; inUse?: boolean };
                    };
                };
                const status = errObj?.response?.status;
                const resData = errObj?.response?.data;
                const msg = (resData?.message || "").toLowerCase();

                // Detect database conflict / already registered status
                if (
                    status === 409 ||
                    resData?.available === false ||
                    resData?.exists === true ||
                    resData?.inUse === true ||
                    msg.includes("already") ||
                    msg.includes("exist") ||
                    msg.includes("in use") ||
                    msg.includes("registered") ||
                    msg.includes("taken")
                ) {
                    return {
                        available: false,
                        message: resData?.message || "This phone number is already registered in database user records.",
                    };
                }

                // 2. Secondary fallback: GET /auth/check-phone?phone=...
                if (status === 404 || status === 405) {
                    try {
                        const getRes = await api.get<IApiResponse<{ available?: boolean; exists?: boolean }>>(
                            `${API.AUTH.CHECK_PHONE}?phone=${encodeURIComponent(targetPhone)}`
                        );
                        const getData = getRes.data?.data;
                        const isAvailable = getData?.available ?? (getData?.exists !== undefined ? !getData.exists : true);
                        return {
                            available: isAvailable,
                            message: getRes.data?.message,
                        };
                    } catch (getErr: unknown) {
                        const getErrObj = getErr as {
                            response?: {
                                status?: number;
                                data?: { message?: string; available?: boolean; exists?: boolean };
                            };
                        };
                        const getStatus = getErrObj?.response?.status;
                        const getMsg = (getErrObj?.response?.data?.message || "").toLowerCase();
                        if (
                            getStatus === 409 ||
                            getMsg.includes("already") ||
                            getMsg.includes("exist") ||
                            getMsg.includes("in use") ||
                            getMsg.includes("registered") ||
                            getMsg.includes("taken")
                        ) {
                            return {
                                available: false,
                                message: getErrObj?.response?.data?.message || "This phone number is already registered in database records.",
                            };
                        }
                    }
                }

                return {
                    available: true,
                    message: resData?.message,
                };
            }
        };

        const primaryResult = await checkSingle(cleanPhone);
        if (!primaryResult.available) {
            return primaryResult;
        }

        // If primary check passed but an alternate national number was provided (e.g. 01610240096 vs +8801610240096), check altPhone too
        if (cleanAlt && cleanAlt !== cleanPhone) {
            const altResult = await checkSingle(cleanAlt);
            if (!altResult.available) {
                return altResult;
            }
        }

        return primaryResult;
    },
};