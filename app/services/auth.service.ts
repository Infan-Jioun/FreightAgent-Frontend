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

export const authService = {
    register: async (payload: IRegisterInput) => {
        const res = await api.post<IApiResponse<{ user: IUser }>>(
            API.AUTH.REGISTER,
            payload
        );
        return res.data;
    },

    registerAgent: async (payload: IRegisterInput) => {
        const res = await api.post<IApiResponse<{ user: IUser }>>(
            API.AUTH.REGISTER_AGENT,
            payload
        );
        return res.data;
    },

    login: async (payload: ILoginInput) => {
        const res = await api.post<IApiResponse<{ user: IUser }>>(
            API.AUTH.LOGIN,
            payload
        );
        return res.data;
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
};