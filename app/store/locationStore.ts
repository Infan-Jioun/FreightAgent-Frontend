import { create } from "zustand";
import { locationService } from "../services/location.service";
import { getErrorMessage } from "../errorHelper/appError";
import type {
    ILocation,
    ILocationOption,
    ICreateLocationPayload,
    IUpdateLocationPayload,
    IBlockLocationPayload,
    ILocationQuery,
    ILocationMeta,
    ILocationListResponse,
} from "../types/location.types";

interface LocationState {
    // ── State Variables ─────────────────────────────────────
    locations: ILocation[];
    meta: ILocationMeta | null;
    selectedLocation: ILocation | null;
    searchOptions: ILocationOption[];
    query: ILocationQuery;
    isLoading: boolean;
    isSearching: boolean;
    isSubmitting: boolean;
    error: string | null;

    // ── Actions ─────────────────────────────────────────────
    fetchLocations: (
        query?: ILocationQuery,
        bypassCache?: boolean
    ) => Promise<ILocationListResponse | undefined>;
    searchLocations: (
        searchTerm: string,
        limit?: number,
        bypassCache?: boolean
    ) => Promise<ILocationOption[]>;
    getLocationById: (id: string) => Promise<ILocation | null>;
    getLocationByCode: (code: string) => Promise<ILocation | null>;
    createLocation: (
        payload: ICreateLocationPayload
    ) => Promise<ILocation | null>;
    updateLocation: (
        id: string,
        payload: IUpdateLocationPayload
    ) => Promise<ILocation | null>;
    blockLocation: (
        id: string,
        payload?: IBlockLocationPayload
    ) => Promise<ILocation | null>;
    unblockLocation: (id: string) => Promise<ILocation | null>;
    deleteLocation: (id: string) => Promise<boolean>;
    restoreLocation: (id: string) => Promise<ILocation | null>;

    // ── State Modifiers & Utilities ─────────────────────────
    setQuery: (query: Partial<ILocationQuery>) => void;
    setSelectedLocation: (location: ILocation | null) => void;
    clearSearchOptions: () => void;
    clearError: () => void;
    resetState: () => void;
}

const initialQuery: ILocationQuery = {
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
};

const initialState = {
    locations: [],
    meta: null,
    selectedLocation: null,
    searchOptions: [],
    query: initialQuery,
    isLoading: false,
    isSearching: false,
    isSubmitting: false,
    error: null,
};

export const useLocationStore = create<LocationState>()((set, get) => ({
    ...initialState,

    // ── 1. Fetch Locations (Paginated & Filtered) ────────────
    fetchLocations: async (queryOverride, bypassCache = false) => {
        const currentQuery = queryOverride
            ? { ...get().query, ...queryOverride }
            : get().query;

        set({ isLoading: true, error: null, query: currentQuery });

        try {
            const response = await locationService.getAll(currentQuery, bypassCache);
            const list = Array.isArray(response?.data)
                ? response.data
                : Array.isArray((response?.data as any)?.locations)
                ? (response.data as any).locations
                : Array.isArray(response)
                ? response
                : [];
            set({
                locations: list,
                meta: response?.meta ?? null,
                isLoading: false,
            });
            return response;
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to load locations");
            set({ error: message, isLoading: false });
        }
    },

    // ── 2. Autocomplete Search Locations ─────────────────────
    searchLocations: async (searchTerm, limit = 10, bypassCache = false) => {
        if (!searchTerm || searchTerm.trim().length < 2) {
            set({ searchOptions: [] });
            return [];
        }

        set({ isSearching: true, error: null });

        try {
            const options = await locationService.search(
                searchTerm,
                limit,
                bypassCache
            );
            set({ searchOptions: options, isSearching: false });
            return options;
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to search locations");
            set({ error: message, isSearching: false });
            return [];
        }
    },

    // ── 3. Get Location By ID ────────────────────────────────
    getLocationById: async (id) => {
        set({ isLoading: true, error: null });

        try {
            const location = await locationService.getById(id);
            set({ selectedLocation: location, isLoading: false });
            return location;
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to fetch location details");
            set({ error: message, isLoading: false });
            return null;
        }
    },

    // ── 4. Get Location By Code ──────────────────────────────
    getLocationByCode: async (code) => {
        set({ isLoading: true, error: null });

        try {
            const location = await locationService.getByCode(code);
            set({ selectedLocation: location, isLoading: false });
            return location;
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to fetch location by code");
            set({ error: message, isLoading: false });
            return null;
        }
    },

    // ── 5. Create Location ───────────────────────────────────
    createLocation: async (payload) => {
        set({ isSubmitting: true, error: null });

        try {
            const newLocation = await locationService.create(payload);
            set((state) => ({
                locations: [newLocation, ...state.locations],
                isSubmitting: false,
            }));

            // Refresh total count & pagination meta via service re-fetch
            get().fetchLocations(undefined, true);
            return newLocation;
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to create location");
            set({ error: message, isSubmitting: false });
            return null;
        }
    },

    // ── 6. Update Location ───────────────────────────────────
    updateLocation: async (id, payload) => {
        set({ isSubmitting: true, error: null });

        try {
            const updated = await locationService.update(id, payload);
            set((state) => ({
                locations: state.locations.map((loc) =>
                    loc.id === id ? updated : loc
                ),
                selectedLocation:
                    state.selectedLocation?.id === id
                        ? updated
                        : state.selectedLocation,
                isSubmitting: false,
            }));
            return updated;
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to update location");
            set({ error: message, isSubmitting: false });
            return null;
        }
    },

    // ── 7. Block Location ────────────────────────────────────
    blockLocation: async (id, payload = {}) => {
        set({ isSubmitting: true, error: null });

        try {
            const blocked = await locationService.block(id, payload);
            set((state) => ({
                locations: state.locations.map((loc) =>
                    loc.id === id ? blocked : loc
                ),
                selectedLocation:
                    state.selectedLocation?.id === id
                        ? blocked
                        : state.selectedLocation,
                isSubmitting: false,
            }));
            return blocked;
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to block location");
            set({ error: message, isSubmitting: false });
            return null;
        }
    },

    // ── 8. Unblock Location ──────────────────────────────────
    unblockLocation: async (id) => {
        set({ isSubmitting: true, error: null });

        try {
            const unblocked = await locationService.unblock(id);
            set((state) => ({
                locations: state.locations.map((loc) =>
                    loc.id === id ? unblocked : loc
                ),
                selectedLocation:
                    state.selectedLocation?.id === id
                        ? unblocked
                        : state.selectedLocation,
                isSubmitting: false,
            }));
            return unblocked;
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to unblock location");
            set({ error: message, isSubmitting: false });
            return null;
        }
    },

    // ── 9. Soft Delete Location ──────────────────────────────
    deleteLocation: async (id) => {
        set({ isSubmitting: true, error: null });

        try {
            await locationService.softDelete(id);
            set((state) => ({
                locations: state.locations.filter((loc) => loc.id !== id),
                selectedLocation:
                    state.selectedLocation?.id === id
                        ? null
                        : state.selectedLocation,
                isSubmitting: false,
            }));

            // Refresh list to update meta counts
            get().fetchLocations(undefined, true);
            return true;
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to delete location");
            set({ error: message, isSubmitting: false });
            return false;
        }
    },

    // ── 10. Restore Soft-Deleted Location ────────────────────
    restoreLocation: async (id) => {
        set({ isSubmitting: true, error: null });

        try {
            const restored = await locationService.restore(id);
            set((state) => ({
                locations: state.locations.map((loc) =>
                    loc.id === id ? restored : loc
                ),
                selectedLocation:
                    state.selectedLocation?.id === id
                        ? restored
                        : state.selectedLocation,
                isSubmitting: false,
            }));

            get().fetchLocations(undefined, true);
            return restored;
        } catch (err: unknown) {
            const message = getErrorMessage(err, "Failed to restore location");
            set({ error: message, isSubmitting: false });
            return null;
        }
    },

    // ── State Modifiers ─────────────────────────────────────
    setQuery: (newQuery) =>
        set((state) => ({
            query: { ...state.query, ...newQuery },
        })),

    setSelectedLocation: (location) =>
        set({ selectedLocation: location }),

    clearSearchOptions: () =>
        set({ searchOptions: [] }),

    clearError: () =>
        set({ error: null }),

    resetState: () =>
        set(initialState),
}));
