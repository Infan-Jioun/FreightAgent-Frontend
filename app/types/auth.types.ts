export interface IUser {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "AGENT" | "CUSTOMER";
    image: string | null;
    emailVerified: boolean;
    createdAt: string;
}

export interface IRegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface ILoginInput {
    email: string;
    password: string;
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