/**
 * Admin Domain Types & Generic API Response Contracts
 * Production-ready definitions for system administration, user management, and API handling.
 */

// ── Role & Status Enums / Union Types ────────────────────────────────
export type {
    UserRole,
    UserStatus,
    IPaginationMeta,
    IApiResponse,
    IAdminUser,
    IAdminUserShipment,
    ISessionItem,
    ISessionsData,
    ISessionsBreakdown,
} from "./interface";

import type {
    UserRole,
    IAdminUser,
    IAdminUserShipment,
    IApiResponse,
    IPaginationMeta,
    ISessionItem,
} from "./interface";

export interface IAdminUserDetail extends IAdminUser {
    shipments?: IAdminUserShipment[];
    assignedShipments?: IAdminUserShipment[];
    corridors?: string[];
    locations?: unknown[];
    sessions?: ISessionItem[];
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
    assignedArea?: string;
}

export interface IRoleUpdatePayload {
    role: UserRole;
    assignedArea?: string;
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

