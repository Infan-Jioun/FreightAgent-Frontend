export interface IUser {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "AGENT" | "CUSTOMER";
    image: string | null;
    phone?: string | null;
    address?: string | null;
    emailVerified: boolean;
    isBlocked?: boolean;
    twoFactorEnabled?: boolean;
    createdAt: string;
    updatedAt?: string;
}

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

export interface IApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
}