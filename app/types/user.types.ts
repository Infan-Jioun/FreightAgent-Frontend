export interface IUserProfile {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "AGENT" | "CUSTOMER";
    image: string | null;
    phone: string | null;
    address: string | null;
    emailVerified: boolean;
    isBlocked: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt?: string;
    twoFactorEnabled?: boolean;
    lastLoginAt?: string | null;
    lastLoginIp?: string | null;
    shipments?: Array<{
        id: string;
        trackingId: string;
        origin: string;
        destination: string;
        weight: number | string;
        status: string;
        estimatedDate: string | null;
        createdAt: string;
    }>;
}

export interface IUpdateProfilePayload {
    name?: string;
    address?: string;
}

export interface IRequestPhonePayload {
    phone: string;
}

export interface IVerifyPhonePayload {
    phone: string;
    code: string;
}

export interface ISessionItem {
    id: string;
    deviceName: string | null;
    deviceType: string | null;
    browser: string | null;
    os: string | null;
    ipAddress: string | null;
    isCurrent: boolean;
    createdAt: string;
    expiresAt: string;
}

export interface ISessionsBreakdown {
    total: number;
    mobile: number;
    tablet: number;
    desktop: number;
}

export interface ISessionsData {
    sessions: ISessionItem[];
    breakdown: ISessionsBreakdown;
}
