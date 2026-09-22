/**
 * Admin User Session & Device Management Contracts
 * Fully typed contracts for multi-device auditing, breakdown stats, and session revocation.
 */

export interface IUserSession {
    id: string;
    deviceName: string;
    deviceType: "desktop" | "mobile" | "tablet" | string;
    browser: string;
    os: string;
    ipAddress: string;
    userAgent?: string | null;
    isCurrent?: boolean;
    createdAt: string;
    expiresAt: string;
    lastActiveAt?: string;
}

export interface IDeviceBreakdown {
    total: number;
    mobile: number;
    tablet: number;
    desktop: number;
}

export interface IUserSessionUserInfo {
    id: string;
    name: string;
    email: string;
    role: string;
    isBlocked?: boolean;
    image?: string | null;
    lastLoginAt?: string | null;
    lastLoginIp?: string | null;
}

export interface IUserSessionData {
    user?: IUserSessionUserInfo;
    sessions: IUserSession[];
    breakdown: IDeviceBreakdown;
}

export interface ApiResponse<T> {
    httpStatusCode?: number;
    success: boolean;
    message: string;
    data: T;
}
