export type {
    IUser,
    UserRole,
    RateLimitInfo,
    IApiResponseWithRateLimit,
} from "./interface";

import type { IUser } from "./interface";

export interface IRegisterInput {
    name: string;
    email: string;
    password: string;
    phone?: string;
    assignedArea?: string;
    corridors?: string[];
}

export interface IRegisterAgentPayload extends Omit<IRegisterInput, "phone"> {
    phone: string;
    assignedArea?: string;
    corridors?: string[];
}

export interface IAgentRegisterResponse {
    success: boolean;
    message: string;
    data: {
        user: IUser;
    } | null;
}

export interface ILoginInput {
    email: string;
    password: string;
    revokeOthers?: boolean;
}

export interface ILoginResponseData {
    user: IUser;
    accessToken?: string;
    refreshToken?: string;
    token?: string;
    access_token?: string;
    refresh_token?: string;
}

export interface IVerifyOtpInput {
    email: string;
    otp: string;
}

export interface IVerifyOtpResponseData {
    user: IUser;
    accessToken?: string;
    refreshToken?: string;
    token?: string;
}

export interface IForgotPasswordInput {
    email: string;
}

export interface IResetPasswordInput {
    email: string;
    otp: string;
    newPassword: string;
}

export interface IChangePasswordInput {
    currentPassword?: string;
    oldPassword?: string;
    newPassword: string;
    otp: string;
}

export type { IApiResponse } from "./interface";