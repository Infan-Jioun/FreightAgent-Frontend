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
    emailVerified?: boolean;
    createdAt?: string;
    updatedAt?: string;
    phone?: string;
    shipmentsCount?: number;
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
    id: string;
    role: UserRole;
}

export interface IAdminUserQueryParams {
    page?: number;
    limit?: number;
    searchTerm?: string;
    role?: UserRole | "ALL";
    verified?: "ALL" | "VERIFIED" | "UNVERIFIED";
    status?: UserStatus;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}

// ── Pre-composed Generic Response Aliases ───────────────────────────
export type IAdminUsersResponse = IApiResponse<IAdminUser[]>;
export type IAdminUserResponse = IApiResponse<IAdminUser>;
export type IAdminDeleteResponse = IApiResponse<null>;
