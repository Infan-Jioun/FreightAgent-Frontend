// app/(auth)/google/success/GoogleSuccessContent.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/app/services/auth.service";
import { useAuthStore } from "@/app/store/authStore";
import { useLocationStore } from "@/app/store/locationStore";
import { toast } from "sonner";
import api from "@/app/lib/api";
import { API } from "@/app/constants/api";
import type { IUser } from "@/app/types/auth.types";
import type { ILocation } from "@/app/types/location.types";
import {
    Compass,
    Search,
    Check,
    X,
    Loader2,
    AlertCircle,
    ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/** Derive a flag emoji from an ISO 3166-1 alpha-2 country code */
function countryFlag(countryCode: string): string {
    const code = (countryCode || "").toUpperCase().trim();
    if (code.length !== 2) return "🚢";
    try {
        return String.fromCodePoint(
            ...code.split("").map((c) => 0x1f1e0 - 65 + c.charCodeAt(0))
        );
    } catch {
        return "🚢";
    }
}

const REGION_FILTERS = [
    "All",
    "Bangladesh",
    "Middle East",
    "Asia",
    "Europe",
    "Americas",
] as const;

export default function GoogleSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUser } = useAuthStore();
    const { fetchLocations, locations: storeLocations, isLoading: locationsLoading } = useLocationStore();

    // Agent corridor configuration modal state
    const [showAgentCorridorModal, setShowAgentCorridorModal] = useState(false);
    const [selectedCorridors, setSelectedCorridors] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [regionFilter, setRegionFilter] = useState<string>("All");
    const [isSavingCorridors, setIsSavingCorridors] = useState(false);

    // Failure / Error state
    const [authFailed, setAuthFailed] = useState<string | null>(null);

    // Load locations from store when the agent corridor modal is shown
    const loadLocations = useCallback(async () => {
        try {
            const res = await fetchLocations({ page: 1, limit: 200 }, true);
            if (res?.meta?.total && res.meta.total > 200) {
                await fetchLocations({ page: 1, limit: Math.min(res.meta.total, 500) }, true);
            }
        } catch {
            // Soft fail — UI shows empty state gracefully
        }
    }, [fetchLocations]);

    useEffect(() => {
        if (showAgentCorridorModal) {
            loadLocations();
        }
    }, [showAgentCorridorModal, loadLocations]);

    // Derive the active, deduplicated location list from the store
    const locations = useMemo<ILocation[]>(() => {
        const raw = Array.isArray(storeLocations) ? storeLocations : [];
        const active = raw.filter((l) => l && l.isBlocked !== true && l.isDeleted !== true);
        const seen = new Set<string>();
        return active.filter((l) => {
            const key = l.code?.toUpperCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        }).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }, [storeLocations]);

    useEffect(() => {
        let cancelled = false;

        const setBrowserCookie = (name: string, value: string, days: number) => {
            if (typeof document === "undefined") return;
            const maxAge = days * 24 * 60 * 60;
            const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
            const secureFlag = isSecure ? "; Secure" : "";
            document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
        };

        const getCookie = (name: string): string | null => {
            if (typeof document === "undefined") return null;
            const match = document.cookie.match(new RegExp(`(?:^|; )\\s*${name}=([^;]*)`));
            return match ? decodeURIComponent(match[1]) : null;
        };

        const decodeBase64Url = (str: string) => {
            try {
                let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
                while (base64.length % 4) {
                    base64 += "=";
                }
                return JSON.parse(decodeURIComponent(escape(atob(base64))));
            } catch {
                try {
                    return JSON.parse(atob(str.replace(/-/g, "+").replace(/_/g, "/")));
                } catch {
                    return null;
                }
            }
        };

        const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
            try {
                const parts = token.split(".");
                if (parts.length < 2) return null;
                let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                while (base64.length % 4) {
                    base64 += "=";
                }
                return JSON.parse(decodeURIComponent(escape(atob(base64))));
            } catch {
                return null;
            }
        };

        /**
         * Robustly parse token or payload from any parameter format
         */
        const extractTokensAndUser = (rawStr: string) => {
            if (!rawStr) return {};

            const trimmed = rawStr.trim();

            // 1. Is rawStr a direct JWT (e.g. eyJ... with 3 dot-separated parts)?
            const dotParts = trimmed.split(".");
            if (dotParts.length === 3 && dotParts[0].startsWith("ey")) {
                const jwtPayload = decodeJwtPayload(trimmed);
                const rawUser = (jwtPayload?.data || jwtPayload?.user || jwtPayload) as Record<string, unknown> | null;
                const user =
                    rawUser && typeof rawUser === "object" && (rawUser.id || rawUser.email || rawUser.role)
                        ? (rawUser as unknown as IUser)
                        : null;
                return {
                    accessToken: trimmed,
                    refreshToken: undefined,
                    user,
                };
            }

            // 2. Is rawStr a base64-encoded JSON object?
            const decoded = decodeBase64Url(trimmed);
            if (decoded && typeof decoded === "object") {
                const accessToken = (decoded.accessToken || decoded.token || decoded.access_token) as string | undefined;
                const refreshToken = (decoded.refreshToken || decoded.refresh_token) as string | undefined;
                let user = (decoded.user || decoded.userData || decoded.data) as IUser | undefined;

                if (!user && accessToken && accessToken.split(".").length === 3) {
                    const jwtPayload = decodeJwtPayload(accessToken);
                    user = (jwtPayload?.data || jwtPayload?.user || jwtPayload) as IUser | undefined;
                }

                return { accessToken, refreshToken, user };
            }

            // 3. Is rawStr plain JSON?
            try {
                const parsed = JSON.parse(trimmed);
                if (parsed && typeof parsed === "object") {
                    const accessToken = (parsed.accessToken || parsed.token || parsed.access_token) as string | undefined;
                    const refreshToken = (parsed.refreshToken || parsed.refresh_token) as string | undefined;
                    const user = (parsed.user || parsed.userData || parsed.data) as IUser | undefined;
                    return { accessToken, refreshToken, user };
                }
            } catch {}

            // Fallback: treat raw string as an accessToken directly
            return { accessToken: trimmed, refreshToken: undefined, user: undefined };
        };

        const verify = async () => {
            try {
                // Collect token candidate from all possible query parameters
                let rawTokenCandidate =
                    searchParams.get("t") ||
                    searchParams.get("token") ||
                    searchParams.get("accessToken") ||
                    searchParams.get("access_token") ||
                    searchParams.get("jwt") ||
                    searchParams.get("data");

                // Check URL hash if not in query parameters (OAuth fragment mode e.g. #token=... or #access_token=...)
                if (!rawTokenCandidate && typeof window !== "undefined" && window.location.hash) {
                    const hashStr = window.location.hash.replace(/^#/, "");
                    const hashParams = new URLSearchParams(hashStr);
                    rawTokenCandidate =
                        hashParams.get("t") ||
                        hashParams.get("token") ||
                        hashParams.get("accessToken") ||
                        hashParams.get("access_token") ||
                        hashParams.get("jwt");
                }

                // Check URL search directly as secondary fallback
                if (!rawTokenCandidate && typeof window !== "undefined" && window.location.search) {
                    const directParams = new URLSearchParams(window.location.search);
                    rawTokenCandidate =
                        directParams.get("t") ||
                        directParams.get("token") ||
                        directParams.get("accessToken") ||
                        directParams.get("access_token");
                }

                let accessToken: string | undefined;
                let refreshToken: string | undefined;
                let userData: IUser | null = null;

                if (rawTokenCandidate) {
                    const extracted = extractTokensAndUser(rawTokenCandidate);
                    accessToken = extracted.accessToken;
                    refreshToken =
                        extracted.refreshToken ||
                        searchParams.get("refreshToken") ||
                        searchParams.get("refresh_token") ||
                        undefined;
                    userData = extracted.user || null;
                }

                // If tokens weren't in URL, check if cookies were already set by backend redirect
                if (!accessToken) {
                    const cookieToken =
                        getCookie("accessToken") ||
                        getCookie("freightagent.accessToken") ||
                        getCookie("token");
                    if (cookieToken) {
                        accessToken = cookieToken;
                        const jwtPayload = decodeJwtPayload(cookieToken);
                        userData = ((jwtPayload?.data || jwtPayload?.user || jwtPayload) as IUser) || null;
                    }
                }

                // Set browser cookies and authorization header if accessToken was resolved
                if (accessToken) {
                    setBrowserCookie("accessToken", accessToken, 1);
                    setBrowserCookie("freightagent.accessToken", accessToken, 1);
                    api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
                }

                if (refreshToken) {
                    setBrowserCookie("refreshToken", refreshToken, 7);
                }

                // Call backend /auth/google/set-cookie if token candidate exists
                if (rawTokenCandidate) {
                    try {
                        const res = await api.post("/auth/google/set-cookie", { token: rawTokenCandidate });
                        if (res.data?.data) {
                            userData = res.data.data as IUser;
                        }
                        if (res.data?.accessToken) {
                            accessToken = res.data.accessToken;
                            setBrowserCookie("accessToken", res.data.accessToken, 1);
                            api.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;
                        }
                        if (res.data?.refreshToken) {
                            setBrowserCookie("refreshToken", res.data.refreshToken, 7);
                        }
                    } catch {
                        // Soft fail: continue with existing parsed tokens
                    }
                }

                if (cancelled) return;

                // If userData is still missing, attempt getMe()
                if (!userData) {
                    try {
                        const meRes = await authService.getMe();
                        if (meRes?.data) {
                            userData = meRes.data as IUser;
                        }
                    } catch {
                        // Soft fail
                    }
                }

                // If still missing but accessToken is a JWT, decode it
                if (!userData && accessToken && accessToken.split(".").length === 3) {
                    const jwtPayload = decodeJwtPayload(accessToken);
                    userData = ((jwtPayload?.data || jwtPayload?.user || jwtPayload) as IUser) || null;
                }

                if (!userData) {
                    console.error("[GoogleSuccess] Unable to retrieve user credentials or token from Google callback.");
                    setAuthFailed("Unable to retrieve your Google credentials or authentication token. Please try again.");
                    return;
                }

                // Save user into Zustand store and localStorage
                setUser(userData);
                try {
                    localStorage.setItem(
                        "auth-storage",
                        JSON.stringify({ state: { user: userData, isAuthenticated: true }, version: 0 })
                    );
                } catch {}

                const isWelcome = searchParams.get("welcome") === "true";
                if (isWelcome) {
                    toast.success(`Welcome to FreightAgent, ${userData.name || "User"}! 🎉`, {
                        description: "Your account has been created with Google.",
                        duration: 5000,
                    });
                } else {
                    toast.success(`Welcome back, ${userData.name || "User"}! ✅`, {
                        description: "Signed in with Google.",
                        duration: 3000,
                    });
                }

                // If user registered/logged in as AGENT, require corridor configuration before dashboard access
                const isAgent = userData.role?.toUpperCase() === "AGENT";
                if (isAgent) {
                    let initial: string[] = [];
                    try {
                        const stored = sessionStorage.getItem("agent_pending_corridors");
                        if (stored) initial = JSON.parse(stored);
                    } catch {}
                    if (initial.length > 0) setSelectedCorridors(initial);
                    setShowAgentCorridorModal(true);
                    return;
                }

                // Clean up URL parameter and navigate to dashboard
                window.history.replaceState({}, "", "/google/success");
                router.replace("/dashboard");

            } catch (err: unknown) {
                console.error("[GoogleSuccess] Unexpected error during verification:", err);
                if (cancelled) return;
                setAuthFailed("An unexpected error occurred during Google authentication. Please try logging in again.");
            }
        };

        verify();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter locations for Agent Corridor Modal
    const filteredPorts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return locations.filter((loc: ILocation) => {
            const locRegion = (loc.region || "").toLowerCase();
            const locCountry = (loc.country || "").toLowerCase();
            const matchesRegion =
                regionFilter === "All" ||
                locRegion === regionFilter.toLowerCase() ||
                locRegion.includes(regionFilter.toLowerCase()) ||
                (regionFilter === "Bangladesh" && locCountry === "bangladesh");

            const matchesSearch =
                !query ||
                loc.name.toLowerCase().includes(query) ||
                loc.code.toLowerCase().includes(query) ||
                locCountry.includes(query) ||
                locRegion.includes(query) ||
                (loc.city || "").toLowerCase().includes(query);

            return matchesRegion && matchesSearch;
        });
    }, [locations, regionFilter, searchQuery]);

    const isAllFilteredSelected = useMemo(() => {
        return (
            filteredPorts.length > 0 &&
            filteredPorts.every((loc) => selectedCorridors.includes(loc.code))
        );
    }, [filteredPorts, selectedCorridors]);

    const toggleCorridor = (code: string) => {
        const isSelected = selectedCorridors.includes(code);
        const next = isSelected
            ? selectedCorridors.filter((c) => c !== code)
            : [...selectedCorridors, code];
        setSelectedCorridors(next);
    };

    const removeCorridor = (code: string) => {
        setSelectedCorridors(selectedCorridors.filter((c) => c !== code));
    };

    const clearAllCorridors = () => {
        setSelectedCorridors([]);
    };

    const toggleSelectAllFiltered = () => {
        if (isAllFilteredSelected) {
            const filteredCodes = new Set(filteredPorts.map((p) => p.code));
            setSelectedCorridors(selectedCorridors.filter((code) => !filteredCodes.has(code)));
        } else {
            const filteredCodes = filteredPorts.map((p) => p.code);
            const set = new Set([...selectedCorridors, ...filteredCodes]);
            setSelectedCorridors(Array.from(set));
        }
    };

    const handleConfirmCorridorsAndAccess = async () => {
        if (selectedCorridors.length === 0) {
            toast.error("Please select at least one operational location corridor before accessing the dashboard.");
            return;
        }

        setIsSavingCorridors(true);
        try {
            const selectedNames = selectedCorridors.map((code) => {
                const loc = locations.find((l) => l.code === code);
                return loc ? `${loc.name} (${loc.code})` : code;
            });
            const areaString = selectedNames.join(", ");

            // Update user profile with operational area
            try {
                await api.patch(API.USER.UPDATE_PROFILE, {
                    address: areaString,
                });
            } catch {
                // Continue even if address patch fails
            }

            sessionStorage.removeItem("agent_pending_corridors");
            toast.success("Operational corridors confirmed!", {
                description: "Welcome to your FreightAgent Agent Dashboard.",
            });
            window.history.replaceState({}, "", "/google/success");
            router.replace("/dashboard");
        } catch {
            router.replace("/dashboard");
        } finally {
            setIsSavingCorridors(false);
        }
    };

    // If authentication failed, display user-friendly card instead of abrupt redirect
    if (authFailed) {
        return (
            <div
                className="min-h-screen flex items-center justify-center p-4 sm:p-8"
                style={{ background: "var(--bg-primary)" }}
            >
                <div
                    className="w-full max-w-md p-6 rounded-3xl border border-rose-900/40 shadow-2xl flex flex-col items-center text-center gap-4"
                    style={{ background: "var(--bg-card)" }}
                >
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white tracking-tight">
                            Google Authentication Notice
                        </h2>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            {authFailed}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.replace("/login")}
                        className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
                        style={{
                            background: "var(--gradient-brand)",
                            color: "#0a0f0f",
                        }}
                    >
                        <span>Return to Sign In</span>
                        <ArrowRight size={14} className="cursor-pointer" />
                    </button>
                </div>
            </div>
        );
    }

    // Render Corridor Modal if Agent logged in via Google
    if (showAgentCorridorModal) {
        return (
            <div
                className="min-h-screen flex items-center justify-center p-4"
                style={{ background: "var(--bg-primary)" }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="w-full max-w-2xl rounded-2xl overflow-hidden border border-teal-800/60 shadow-2xl p-5 sm:p-6 flex flex-col gap-4 max-h-[90vh]"
                    style={{
                        background: "var(--bg-card)",
                        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)",
                    }}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
                                <Compass size={20} />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-white tracking-tight">
                                    Configure Your Operational Corridors
                                </h2>
                                <p className="text-xs text-gray-400">
                                    Select your agency&apos;s commercial seaports before entering the Agent Dashboard.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Region Filters (Horizontal Pills) */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-modal-scrollbar">
                        {REGION_FILTERS.map((reg) => {
                            const isActive = regionFilter === reg;
                            return (
                                <button
                                    key={reg}
                                    type="button"
                                    onClick={() => setRegionFilter(reg)}
                                    className="text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all border cursor-pointer"
                                    style={{
                                        background: isActive ? "var(--accent-primary)" : "var(--bg-input)",
                                        color: isActive ? "#0a0f0f" : "var(--text-secondary)",
                                        borderColor: isActive ? "var(--accent-primary)" : "var(--border-primary)",
                                    }}
                                >
                                    {reg}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search & Select/Deselect All in Modal */}
                    <div
                        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-gray-800"
                        style={{ background: "var(--bg-input)" }}
                    >
                        <Search size={15} style={{ color: "var(--text-muted)" }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search seaports by name, country, or UN/LOCODE (e.g. Chattogram, SGSIN, Rotterdam)..."
                            className="flex-1 bg-transparent text-xs outline-hidden text-gray-200 placeholder:text-gray-500"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="text-gray-400 hover:text-gray-200 cursor-pointer p-0.5"
                                aria-label="Clear search"
                            >
                                <X size={14} className="cursor-pointer" />
                            </button>
                        )}
                        {filteredPorts.length > 0 && (
                            <button
                                type="button"
                                onClick={toggleSelectAllFiltered}
                                className={`text-xs font-semibold border-l border-gray-700 pl-3 ml-1 cursor-pointer shrink-0 transition-colors ${
                                    isAllFilteredSelected
                                        ? "text-rose-400 hover:text-rose-300"
                                        : "text-teal-400 hover:text-teal-300"
                                }`}
                            >
                                {isAllFilteredSelected
                                    ? `Deselect All (${filteredPorts.length})`
                                    : `Select All (${filteredPorts.length})`}
                            </button>
                        )}
                    </div>

                    {/* Active Chips in Modal */}
                    {selectedCorridors.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-teal-950/25 border border-teal-800/40 max-h-20 overflow-y-auto custom-modal-scrollbar">
                            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider mr-1">
                                Selected ({selectedCorridors.length}):
                            </span>
                            {selectedCorridors.map((code) => {
                                const loc = locations.find((l) => l.code === code);
                                const flag = loc ? countryFlag(loc.countryCode) : "🚢";
                                return (
                                    <span
                                        key={code}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-teal-500/20 text-teal-200 border border-teal-500/40"
                                    >
                                        <span className="text-xs select-none">{flag}</span>
                                        <span className="font-mono text-[10px] text-teal-300 font-bold">{code}</span>
                                        <span>{loc ? loc.name : code}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeCorridor(code)}
                                            className="hover:text-rose-400 text-teal-300 transition-colors ml-0.5 cursor-pointer"
                                        >
                                            <X size={11} className="cursor-pointer" />
                                        </button>
                                    </span>
                                );
                            })}
                            <button
                                type="button"
                                onClick={clearAllCorridors}
                                className="text-xs text-gray-400 hover:text-rose-400 underline ml-auto cursor-pointer"
                            >
                                Deselect All
                            </button>
                        </div>
                    )}

                    {/* Seaports Grid (Fixed container height with high-visibility custom draggable scrollbar) */}
                    <div className="h-[340px] overflow-y-auto pr-2 custom-modal-scrollbar">
                        {locationsLoading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                                <Loader2 size={24} className="animate-spin text-teal-400" />
                                <p className="text-xs text-gray-400">Loading shipping hubs...</p>
                            </div>
                        ) : filteredPorts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl border border-gray-800/60 bg-black/20">
                                <Search size={28} className="text-gray-600 mb-2" />
                                <p className="text-xs text-gray-300 font-medium">
                                    No maritime seaports found matching &quot;{searchQuery}&quot;
                                </p>
                                <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
                                    Search using port name, country, or UN/LOCODE (e.g. BDCGP, SGSIN).
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="mt-3 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-teal-300 text-xs font-semibold cursor-pointer border border-gray-700 transition-colors"
                                >
                                    Reset Search
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {filteredPorts.map((loc: ILocation) => {
                                    const isSelected = selectedCorridors.includes(loc.code);
                                    const flag = countryFlag(loc.countryCode);
                                    return (
                                        <button
                                            key={loc.code}
                                            type="button"
                                            onClick={() => toggleCorridor(loc.code)}
                                            className={`group relative flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                isSelected
                                                    ? "bg-teal-500/15 border-teal-400 text-teal-100 shadow-xs shadow-teal-500/15"
                                                    : "bg-[#0b1b1b] hover:bg-[#0f2424] border-gray-800 hover:border-teal-500/40"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                <span
                                                    className="text-xl shrink-0 select-none leading-none p-1 rounded-lg bg-black/40 border border-gray-800"
                                                    role="img"
                                                    aria-label={loc.country}
                                                >
                                                    {flag}
                                                </span>
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-xs font-bold text-gray-100 truncate group-hover:text-white">
                                                            {loc.name}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-black/60 text-teal-300 border border-teal-500/30">
                                                            {loc.code}
                                                        </span>
                                                        <span className="text-[11px] text-gray-400 truncate">
                                                            {loc.city ? `${loc.city}, ` : ""}{loc.country} · {loc.region}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-teal-400 border-teal-300 text-black"
                                                        : "border-gray-700 bg-black/40 group-hover:border-teal-500/50"
                                                }`}
                                            >
                                                {isSelected && <Check size={13} strokeWidth={3} className="cursor-pointer" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                        <span className="text-xs text-gray-400 font-mono">
                            {selectedCorridors.length} seaport(s) selected
                        </span>
                        <button
                            type="button"
                            disabled={isSavingCorridors || selectedCorridors.length === 0}
                            onClick={handleConfirmCorridorsAndAccess}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center gap-2"
                            style={{
                                background: "var(--gradient-brand)",
                                color: "#0a0f0f",
                            }}
                        >
                            {isSavingCorridors ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Activating Corridors...
                                </>
                            ) : (
                                `Confirm Corridors & Enter Dashboard (${selectedCorridors.length})`
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // Default loading view while validating Google OAuth session
    return (
        <div
            className="min-h-screen flex items-center justify-center"
            style={{ background: "var(--bg-primary)" }}
        >
            <div className="flex flex-col items-center gap-3">
                <div
                    className="w-10 h-10 rounded-full border-2 animate-spin"
                    style={{
                        borderColor: "var(--border-primary)",
                        borderTopColor: "var(--accent-primary)",
                    }}
                />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Signing you in with Google...
                </p>
            </div>
        </div>
    );
}
