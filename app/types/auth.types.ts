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
}

export interface ILoginInput {
    email: string;
    password: string;
    revokeOthers?: boolean;
}

export interface IVerifyOtpInput {
    email: string;
    otp: string;
}

export interface IForgotPasswordInput {
    email: string;
}

export interface IResetPasswordInput {
    email: string;
    otp: string;
    newPassword: string;
}

export interface IApiResponse<T> {
    success: boolean;
    message: string;
    data: T | null;
}