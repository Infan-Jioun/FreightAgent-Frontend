/**
 * Admin Domain Types & Generic API Response Contracts
 * Production-ready definitions for system administration, user management, and API handling.
 */

// ── Role & Status Enums / Union Types ────────────────────────────────
export type UserRole = "ADMIN" | "AGENT" | "CUSTOMER";

export type UserStatus = "ACTIVE" | "PENDING_KYC" | "SUSPENDED" | string;

// ── Generic Pagination & Meta ───────────────────────────────────────
export interface IPaginationMeta {
    page?: number;
    limit?: number;
    total?: number;
    totalPage?: number;
    count?: number;
}

// ── Standard Generic API Response Wrapper ───────────────────────────
export interface IApiResponse<T = unknown> {
    statusCode?: number;
    success: boolean;
    message: string;
    meta?: IPaginationMeta;
    data: T;
}

// ── Admin User Entity ───────────────────────────────────────────────
export interface IAdminUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status?: UserStatus;
    image?: string | null;
    isBlocked?: boolean;
    blockedReason?: string | null;
    blockedAt?: string | null;
    emailVerified?: boolean;
    lastLoginAt?: string | null;
    phone?: string | null;
    address?: string | null;
    shipmentsCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

// ── Admin User Detailed Shipments ──────────────────────────────────
export interface IAdminUserShipment {
    id: string;
    trackingId: string;
    origin: string;
    destination: string;
    status: string;
    createdAt: string;
}

export interface IAdminUserDetail extends IAdminUser {
    shipments?: IAdminUserShipment[];
}

// ── Request Payloads ────────────────────────────────────────────────
export interface ICreateUserPayload {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
}

export interface IUpdateUserRolePayload {
    id?: string;
    role: UserRole;
}

export interface IRoleUpdatePayload {
    role: UserRole;
}

export interface IUserStatusUpdatePayload {
    isBlocked: boolean;
    status?: "ACTIVE" | "SUSPENDED" | string;
    reason?: string;
    blockedReason?: string;
}

export interface IAdminUserQueryParams {
    page?: number;
    limit?: number;
    searchTerm?: string;
    search?: string;
    role?: UserRole | "ALL";
    verified?: "ALL" | "VERIFIED" | "UNVERIFIED";
    status?: "ALL" | "ACTIVE" | "SUSPENDED" | string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

// ── Pre-composed Generic Response Aliases ───────────────────────────
export interface IAdminUsersResult {
    users: IAdminUser[];
    meta?: IPaginationMeta;
}

export type IAdminUsersResponse = IApiResponse<IAdminUser[]>;
export type IAdminUserResponse = IApiResponse<IAdminUser>;
export type IAdminUserDetailResponse = IApiResponse<IAdminUserDetail>;
export type IAdminDeleteResponse = IApiResponse<null>;

