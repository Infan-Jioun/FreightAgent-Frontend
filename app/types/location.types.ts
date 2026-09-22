// ─── Shared Interfaces from interface.ts ──────────────────────
export type {
    LocationType,
    ILocation,
    ILocationOption,
    LocationOption,
    LocationHint,
} from "./interface";

import type { LocationType, ILocation, ILocationOption } from "./interface";

// ─── Create Payload ───────────────────────────────────────
export interface ICreateLocationPayload {
    name: string;
    code: string;
    country: string;
    countryCode: string;
    city: string;
    region: string;
    latitude: number;
    longitude: number;
    type?: LocationType;
}

// ─── Update Payload ───────────────────────────────────────
export interface IUpdateLocationPayload {
    name?: string;
    country?: string;
    countryCode?: string;
    city?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
    type?: LocationType;
}

// ─── Block Payload ────────────────────────────────────────
export interface IBlockLocationPayload {
    blockedReason?: string;
}

// ─── Query Params ─────────────────────────────────────────
export interface ILocationQuery {
    search?: string;
    country?: string;
    countryCode?: string;
    region?: string;
    type?: LocationType;
    isBlocked?: boolean;
    isDeleted?: boolean;
    page?: number;
    limit?: number;
    sortBy?: "name" | "code" | "country" | "createdAt";
    sortOrder?: "asc" | "desc";
}

// ─── API Response ─────────────────────────────────────────
export interface ILocationMeta {
    total: number;
    page: number;
    limit: number;
    totalPage: number;
}

export interface ILocationListResponse {
    success: boolean;
    message: string;
    data: ILocation[];
    meta: ILocationMeta;
}

export interface ILocationResponse {
    success: boolean;
    message: string;
    data: ILocation;
}

export interface ILocationSearchResponse {
    success: boolean;
    message: string;
    data: ILocationOption[];
}