/* eslint-disable @typescript-eslint/no-explicit-any */
import { API } from "../constants/api";
import {
    IRegisterInput,
    ILoginInput,
    IVerifyOtpInput,
    IForgotPasswordInput,
    IResetPasswordInput,
    IUser,
    IApiResponse,
} from "../types/auth.types";
import api from "../lib/api";

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
        const res = await api.post<IApiResponse<null>>(API.AUTH.LOGOUT);
        return res.data;
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
        const res = await api.get<IApiResponse<IUser>>(API.AUTH.ME);
        return res.data;
    },
    createAgent: async (payload: IRegisterInput) => {
        const res = await api.post<IApiResponse<{ user: IUser }>>(
            API.AUTH.REGISTER_AGENT,
            payload
        );
        return res.data;
    }
};