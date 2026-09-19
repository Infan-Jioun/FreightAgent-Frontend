/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../lib/api";
import { AppError } from "../errorHelper/appError";
import { API } from "../constants/api";
import type {
    ILocation,
    ILocationOption,
    ICreateLocationPayload,
    IUpdateLocationPayload,
    IBlockLocationPayload,
    ILocationQuery,
    ILocationListResponse,
    ILocationResponse,
    ILocationSearchResponse,
} from "../types/location.types";

// ─── Client-side cache (mirrors Redis TTL = 20 min) ───────
// Prevents redundant API calls within the same browser session.
// On any mutation the relevant keys are purged so next read is fresh.

const CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
}

class LocationCache {
    private store = new Map<string, CacheEntry<any>>();

    get<T>(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.data as T;
    }

    set<T>(key: string, data: T): void {
        this.store.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    }

    delete(key: string): void {
        this.store.delete(key);
    }

    invalidateLists(): void {
        for (const key of this.store.keys()) {
            if (key.startsWith("list:") || key.startsWith("search:")) {
                this.store.delete(key);
            }
        }
    }

    invalidateById(id: string): void {
        this.store.delete(`id:${id}`);
    }

    invalidateByCode(code: string): void {
        this.store.delete(`code:${code.toUpperCase()}`);
    }
}

const cache = new LocationCache();

// ─── Service ──────────────────────────────────────────────
export const locationService = {

    // ── 1. Create ─────────────────────────────────────────
    create: async (payload: ICreateLocationPayload): Promise<ILocation> => {
        try {
            const res = await api.post<ILocationResponse>(
                API.LOCATION.CREATE,
                payload
            );
            cache.invalidateLists();
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    // ── 2. Get All (paginated + filtered) ─────────────────
    getAll: async (query: ILocationQuery = {}): Promise<ILocationListResponse> => {
        const key = `list:${JSON.stringify(query)}`;
        const cached = cache.get<ILocationListResponse>(key);
        if (cached) return cached;

        try {
            const params = new URLSearchParams();
            Object.entries(query).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== "") {
                    params.set(k, String(v));
                }
            });

            const res = await api.get<ILocationListResponse>(
                `${API.LOCATION.GET_ALL}?${params.toString()}`
            );
            cache.set(key, res.data);
            return res.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    // ── 3. Search (autocomplete) ───────────────────────────
    search: async (q: string, limit = 10): Promise<ILocationOption[]> => {
        if (!q || q.trim().length < 2) return [];

        const key = `search:${q.trim().toLowerCase()}:${limit}`;
        const cached = cache.get<ILocationOption[]>(key);
        if (cached) return cached;

        try {
            const res = await api.get<ILocationSearchResponse>(
                `${API.LOCATION.SEARCH}?q=${encodeURIComponent(q)}&limit=${limit}`
            );
            cache.set(key, res.data.data);
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    // ── 4. Get By ID ──────────────────────────────────────
    getById: async (id: string): Promise<ILocation> => {
        const key = `id:${id}`;
        const cached = cache.get<ILocation>(key);
        if (cached) return cached;

        try {
            const res = await api.get<ILocationResponse>(
                API.LOCATION.GET_BY_ID(id)
            );
            cache.set(key, res.data.data);
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    // ── 5. Get By Code ────────────────────────────────────
    getByCode: async (code: string): Promise<ILocation> => {
        const upperCode = code.toUpperCase();
        const key = `code:${upperCode}`;
        const cached = cache.get<ILocation>(key);
        if (cached) return cached;

        try {
            const res = await api.get<ILocationResponse>(
                API.LOCATION.GET_BY_CODE(upperCode)
            );
            cache.set(key, res.data.data);
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    // ── 6. Update ─────────────────────────────────────────
    update: async (
        id: string,
        payload: IUpdateLocationPayload
    ): Promise<ILocation> => {
        try {
            const res = await api.patch<ILocationResponse>(
                API.LOCATION.UPDATE(id),
                payload
            );
            cache.invalidateById(id);
            cache.invalidateLists();
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    // ── 7. Block ──────────────────────────────────────────
    block: async (
        id: string,
        payload: IBlockLocationPayload = {}
    ): Promise<ILocation> => {
        try {
            const res = await api.patch<ILocationResponse>(
                API.LOCATION.BLOCK(id),
                payload
            );
            cache.invalidateById(id);
            cache.invalidateLists();
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    // ── 8. Unblock ────────────────────────────────────────
    unblock: async (id: string): Promise<ILocation> => {
        try {
            const res = await api.patch<ILocationResponse>(
                API.LOCATION.UNBLOCK(id)
            );
            cache.invalidateById(id);
            cache.invalidateLists();
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    // ── 9. Soft Delete ────────────────────────────────────
    softDelete: async (id: string): Promise<void> => {
        try {
            await api.delete(API.LOCATION.DELETE(id));
            cache.invalidateById(id);
            cache.invalidateLists();
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },

    // ── 10. Restore ───────────────────────────────────────
    restore: async (id: string): Promise<ILocation> => {
        try {
            const res = await api.patch<ILocationResponse>(
                API.LOCATION.RESTORE(id)
            );
            cache.invalidateById(id);
            cache.invalidateLists();
            return res.data.data;
        } catch (err: unknown) {
            throw AppError.fromAxios(err);
        }
    },
};