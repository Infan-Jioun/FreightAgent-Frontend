"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw, Plus } from "lucide-react";

import type {
    ILocation, ILocationQuery, ICreateLocationPayload,
    IUpdateLocationPayload, IBlockLocationPayload,
} from "../../../../../types/location.types";
import { useLocationStore } from "@/app/store/locationStore";

import { Icon } from "./Icons";
import { Badge, typeBadgeColor } from "./Badge";
import { detectLocationHint, LOCATION_HINTS } from "./location-hints";
import type { LocationHint } from "./location-hints";
import { Field } from "./Field";
import { Modal } from "./Modal";
import { ToastStack } from "./ToastStack";
import type { ToastItem, ToastType } from "./ToastStack";
import { ModalActions } from "./ModalActions";

// Centralized Reusable UI Components
import { PageHeader } from "@/components/ui/PageHeader";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterSelect } from "@/components/ui/FilterSelect";
import { CtaButton } from "@/components/ui/CtaButton";
import { ActionBtn } from "@/components/ui/ActionBtn";
import { DataTableWrapper } from "@/components/ui/DataTableWrapper";
import { PaginationBar } from "@/components/ui/PaginationBar";

// ─── Constants ────────────────────────────────────────────
const LOCATION_TYPES = ["SEA_PORT", "AIR_PORT", "INLAND_CONTAINER_DEPOT"];
const LOCATION_TYPE_OPTIONS = LOCATION_TYPES.map(t => ({
    label: t.replace(/_/g, " "),
    value: t,
}));
const STATUS_OPTIONS = [
    { label: "Active Only", value: "false" },
    { label: "Blocked Only", value: "true" },
];

// ─── Types ────────────────────────────────────────────────
type ModalMode = "create" | "edit" | "block" | "delete" | "restore" | null;

interface FormState {
    name: string; code: string; country: string; countryCode: string;
    city: string; region: string; latitude: string; longitude: string;
    type: string; blockedReason: string;
}

const emptyForm: FormState = {
    name: "", code: "", country: "", countryCode: "",
    city: "", region: "", latitude: "", longitude: "",
    type: "SEA_PORT", blockedReason: "",
};

// ─── Suggestion item derived from LOCATION_HINTS ──────────
interface SuggestionItem {
    key: string;
    hint: LocationHint;
}

function getSuggestions(input: string, field: "name" | "code"): SuggestionItem[] {
    if (!input || input.trim().length < 1) return [];
    const lower = input.trim().toLowerCase();
    const seen = new Set<string>();
    const results: SuggestionItem[] = [];

    for (const [key, hint] of Object.entries(LOCATION_HINTS)) {
        const isCodeLike = key.length <= 4;
        const matches = field === "code" ? isCodeLike : !isCodeLike;
        if (!matches) continue;

        const dedupeKey = `${hint.city}-${hint.type}`;
        if (seen.has(dedupeKey)) continue;

        if (key.startsWith(lower) || hint.city.toLowerCase().startsWith(lower) || key.includes(lower)) {
            seen.add(dedupeKey);
            results.push({ key, hint });
        }
    }
    return results.slice(0, 6);
}

// ─── TYPE badge colors ─────────────────────────────────────
const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
    SEA_PORT: { bg: "rgba(0,180,216,0.12)", text: "#00b4d8" },
    AIR_PORT: { bg: "rgba(0,229,192,0.12)", text: "#00e5c0" },
    INLAND_CONTAINER_DEPOT: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
};

// ─── SuggestInput ─────────────────────────────────────────
interface SuggestInputProps {
    label: string;
    name: "name" | "code";
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectSuggestion: (hint: LocationHint) => void;
    placeholder?: string;
    required?: boolean;
    half?: boolean;
}

function SuggestInput({
    label, name, value, onChange, onSelectSuggestion,
    placeholder, required, half,
}: SuggestInputProps) {
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const s = getSuggestions(value, name);
        setSuggestions(s);
        setOpen(s.length > 0 && value.length > 0);
        setHighlighted(-1);
    }, [value, name]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const select = (hint: LocationHint) => {
        onSelectSuggestion(hint);
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, suggestions.length - 1)); }
        if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
        if (e.key === "Enter" && highlighted >= 0) { e.preventDefault(); select(suggestions[highlighted].hint); }
        if (e.key === "Escape") setOpen(false);
    };

    const width = half ? "calc(50% - 6px)" : "100%";

    return (
        <div ref={wrapRef} style={{ width, position: "relative", display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                {label}
                {required && <span style={{ color: "var(--danger)" }}>*</span>}
            </label>
            <input
                name={name}
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
                placeholder={placeholder}
                autoComplete="off"
                style={{
                    width: "100%", boxSizing: "border-box",
                    background: "var(--bg-input)", border: `1px solid ${open ? "var(--accent-primary)" : "var(--border-primary)"}`,
                    borderRadius: open && suggestions.length > 0 ? "8px 8px 0 0" : "8px",
                    color: "var(--text-primary)", fontSize: "13px",
                    padding: "9px 12px", outline: "none", transition: "border-color 0.15s",
                }}
            />
            {open && suggestions.length > 0 && (
                <div style={{
                    position: "absolute", top: "calc(100% - 0px)", left: 0, right: 0, zIndex: 200,
                    background: "var(--bg-card)", border: "1px solid var(--accent-primary)",
                    borderTop: "none", borderRadius: "0 0 10px 10px",
                    boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
                    maxHeight: "220px", overflowY: "auto",
                }} className="custom-modal-scrollbar">
                    {suggestions.map(({ key, hint }, i) => {
                        const tc = TYPE_COLOR[hint.type] ?? TYPE_COLOR["SEA_PORT"];
                        const typeLabel = hint.type === "INLAND_CONTAINER_DEPOT" ? "ICD" : hint.type.replace("_", " ");
                        return (
                            <div
                                key={key}
                                onMouseEnter={() => setHighlighted(i)}
                                onMouseDown={(e) => { e.preventDefault(); select(hint); }}
                                style={{
                                    display: "flex", alignItems: "center", gap: "10px",
                                    padding: "9px 14px", cursor: "pointer",
                                    background: highlighted === i ? "var(--bg-card-hover)" : "transparent",
                                    borderBottom: i < suggestions.length - 1 ? "1px solid rgba(26,74,74,0.3)" : "none",
                                    transition: "background 0.1s",
                                }}
                            >
                                <span style={{
                                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em",
                                    padding: "2px 7px", borderRadius: "6px",
                                    background: tc.bg, color: tc.text,
                                    whiteSpace: "nowrap", flexShrink: 0, minWidth: "52px", textAlign: "center",
                                }}>
                                    {typeLabel}
                                </span>
                                <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 700, color: "var(--accent-primary)", flexShrink: 0, minWidth: "36px", textTransform: "uppercase" }}>
                                    {key.toUpperCase()}
                                </span>
                                <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {hint.city}
                                </span>
                                <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
                                    {hint.countryCode} · {hint.country}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════
export default function LocationsPageClient() {
    const {
        locations,
        meta,
        isLoading: loading,
        query,
        isSubmitting: submitting,
        fetchLocations,
        createLocation,
        updateLocation,
        blockLocation,
        unblockLocation,
        deleteLocation,
        restoreLocation,
        setQuery,
    } = useLocationStore();

    const [searchInput, setSearchInput] = useState("");
    const [showDeleted, setShowDeleted] = useState(false);
    const toastCounter = useRef(0);

    const [modal, setModal] = useState<ModalMode>(null);
    const [selected, setSelected] = useState<ILocation | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    // ── Toast helpers ──────────────────────────────────────
    const addToast = useCallback((msg: string, type: ToastType = "success") => {
        const id = ++toastCounter.current;
        setToasts(prev => [...prev, { id, msg, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Initial load & query sync
    useEffect(() => {
        fetchLocations();
    }, [fetchLocations, query]);

    // ── Search handler (Debounced via SearchBar) ───────────
    const handleSearch = (v: string) => {
        setSearchInput(v);
        setQuery({ search: v || undefined, page: 1 });
    };

    const toggleDeleted = () => {
        const next = !showDeleted;
        setShowDeleted(next);
        setQuery({ isDeleted: next, page: 1 });
    };

    // ── Auto-detect ────────────────────────────────────────
    const applyHint = useCallback((hint: LocationHint, triggeredBy: string[]) => {
        setForm(prev => ({
            ...prev,
            country: hint.country, countryCode: hint.countryCode,
            city: hint.city, region: hint.region,
            latitude: hint.lat, longitude: hint.lng, type: hint.type,
        }));
        setAutoFilledFields(new Set(["country", "countryCode", "city", "region", "latitude", "longitude", "type"]));
        addToast(`Auto-filled from "${triggeredBy[0]}" — verify before saving.`, "info");
    }, [addToast]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setAutoFilledFields(prev => { const n = new Set(prev); n.delete(name); return n; });
        if (name === "name" || name === "code") {
            const hint = detectLocationHint(value);
            if (hint) applyHint(hint, [value]);
        }
    };

    // ── Suggestion select (from SuggestInput dropdown) ─────
    const handleSuggestionSelect = (hint: LocationHint, field: "name" | "code") => {
        const fieldValue = field === "code" ? hint.city.slice(0, 3).toUpperCase() : hint.city;
        setForm(prev => ({
            ...prev,
            [field]: fieldValue,
            country: hint.country, countryCode: hint.countryCode,
            city: hint.city, region: hint.region,
            latitude: hint.lat, longitude: hint.lng, type: hint.type,
        }));
        setAutoFilledFields(new Set(["country", "countryCode", "city", "region", "latitude", "longitude", "type"]));
        addToast(`Auto-filled from "${hint.city}" — verify before saving.`, "info");
    };

    // ── Modal openers ──────────────────────────────────────
    const openCreate = () => { setSelected(null); setForm(emptyForm); setAutoFilledFields(new Set()); setModal("create"); };
    const openEdit = (loc: ILocation) => {
        setSelected(loc);
        setForm({
            name: loc.name, code: loc.code, country: loc.country,
            countryCode: loc.countryCode, city: loc.city, region: loc.region,
            latitude: String(loc.latitude ?? ""), longitude: String(loc.longitude ?? ""),
            type: loc.type ?? "SEA_PORT", blockedReason: "",
        });
        setAutoFilledFields(new Set());
        setModal("edit");
    };
    const openBlock = (loc: ILocation) => { setSelected(loc); setForm({ ...emptyForm }); setAutoFilledFields(new Set()); setModal("block"); };
    const openUnblock = (loc: ILocation) => { setSelected(loc); setModal("block"); };
    const openDelete = (loc: ILocation) => { setSelected(loc); setModal("delete"); };
    const openRestore = (loc: ILocation) => { setSelected(loc); setModal("restore"); };
    const closeModal = () => { setModal(null); setSelected(null); setForm(emptyForm); setAutoFilledFields(new Set()); };

    // ── Submissions via useLocationStore ──────────────────
    const handleCreate = async () => {
        const payload: ICreateLocationPayload = {
            name: form.name, code: form.code, country: form.country,
            countryCode: form.countryCode, city: form.city, region: form.region,
            latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude),
            type: form.type as ICreateLocationPayload["type"],
        };
        const created = await createLocation(payload);
        if (created) {
            addToast("Location created successfully", "success");
            closeModal();
        } else {
            const err = useLocationStore.getState().error;
            addToast(err || "Create failed", "error");
        }
    };

    const handleUpdate = async () => {
        if (!selected) return;
        const payload: IUpdateLocationPayload = {};
        if (form.name !== selected.name) payload.name = form.name;
        if (form.country !== selected.country) payload.country = form.country;
        if (form.countryCode !== selected.countryCode) payload.countryCode = form.countryCode;
        if (form.city !== selected.city) payload.city = form.city;
        if (form.region !== selected.region) payload.region = form.region;
        if (form.latitude !== String(selected.latitude ?? "")) payload.latitude = parseFloat(form.latitude);
        if (form.longitude !== String(selected.longitude ?? "")) payload.longitude = parseFloat(form.longitude);
        if (form.type !== selected.type) payload.type = form.type as IUpdateLocationPayload["type"];

        const updated = await updateLocation(selected.id, payload);
        if (updated) {
            addToast("Location updated", "success");
            closeModal();
        } else {
            const err = useLocationStore.getState().error;
            addToast(err || "Update failed", "error");
        }
    };

    const handleBlock = async () => {
        if (!selected) return;
        if (selected.isBlocked) {
            const unblocked = await unblockLocation(selected.id);
            if (unblocked) {
                addToast("Location unblocked", "success");
                closeModal();
            } else {
                const err = useLocationStore.getState().error;
                addToast(err || "Action failed", "error");
            }
        } else {
            const payload: IBlockLocationPayload = {};
            if (form.blockedReason) payload.blockedReason = form.blockedReason;
            const blocked = await blockLocation(selected.id, payload);
            if (blocked) {
                addToast("Location blocked", "success");
                closeModal();
            } else {
                const err = useLocationStore.getState().error;
                addToast(err || "Action failed", "error");
            }
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        const success = await deleteLocation(selected.id);
        if (success) {
            addToast("Location deleted", "success");
            closeModal();
        } else {
            const err = useLocationStore.getState().error;
            addToast(err || "Delete failed", "error");
        }
    };

    const handleRestore = async () => {
        if (!selected) return;
        const restored = await restoreLocation(selected.id);
        if (restored) {
            addToast("Location restored", "success");
            closeModal();
        } else {
            const err = useLocationStore.getState().error;
            addToast(err || "Restore failed", "error");
        }
    };

    const goPage = (p: number) => setQuery({ page: p });

    // ─────────────────────────────────────────────────────
    return (
        <div className="space-y-6 pb-8">

            {/* ── Reusable PageHeader ── */}
            <PageHeader
                title="Locations Directory"
                subtitle="Ports, airports, and freight terminals used across routes and shipments."
                badge="ADMIN CONSOLE"
                badgeColor="red"
                actions={
                    <>
                        <button
                            type="button"
                            onClick={() => fetchLocations(query)}
                            disabled={loading}
                            className="p-2.5 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-all disabled:opacity-50 cursor-pointer"
                            title="Refresh locations"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin text-[#00c9a7]" : ""} />
                        </button>

                        <CtaButton
                            onClick={openCreate}
                            icon={<Plus size={15} />}
                        >
                            Add Location
                        </CtaButton>
                    </>
                }
            />

            {/* ── Filter Toolbar Card ── */}
            <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col lg:flex-row items-center justify-between gap-4 shadow-lg shadow-black/20">
                {/* Reusable SearchBar */}
                <SearchBar
                    value={searchInput}
                    onChange={handleSearch}
                    placeholder="Search by name, code, city…"
                    className="w-full lg:w-auto"
                />

                {/* Filters, Soft-Delete Toggle & Count Badge */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
                    {/* Reusable FilterSelect for Type */}
                    <FilterSelect
                        value={query.type || ""}
                        onChange={(v) => setQuery(p => ({ ...p, type: (v || undefined) as ILocationQuery["type"], page: 1 }))}
                        options={LOCATION_TYPE_OPTIONS}
                        placeholder="All Types"
                        title="Filter by location type"
                    />

                    {/* Reusable FilterSelect for Status */}
                    <FilterSelect
                        value={query.isBlocked === undefined ? "" : String(query.isBlocked)}
                        onChange={(v) => setQuery(p => ({ ...p, isBlocked: v === "" ? undefined : v === "true", page: 1 }))}
                        options={STATUS_OPTIONS}
                        placeholder="All Statuses"
                        title="Filter by active or blocked status"
                    />

                    {/* Deleted Filter Toggle */}
                    <button
                        type="button"
                        onClick={toggleDeleted}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                            showDeleted
                                ? "bg-[#e11d48]/15 text-[#f43f5e] border-[#e11d48]/30 hover:bg-[#e11d48]/25"
                                : "bg-[#0a1a1a] text-[#7ecfc4] border-[#1a4a4a] hover:text-[#e0faf5] hover:bg-[#112a2a]"
                        }`}
                        title="Toggle deleted locations"
                    >
                        <Icon.Filter />
                        <span>{showDeleted ? "Showing Deleted" : "Show Deleted"}</span>
                    </button>

                    {/* Locations Count Badge */}
                    <span className="text-[11px] font-bold text-[#7ecfc4] px-2.5 py-1 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a]">
                        {meta?.total ?? 0} locations
                    </span>
                </div>
            </div>

            {/* ── Reusable DataTableWrapper ── */}
            <DataTableWrapper>
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-[#1a4a4a] bg-[#0a1a1a]/50 text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider">
                            <th className="py-3.5 px-4">Code</th>
                            <th className="py-3.5 px-4">Name</th>
                            <th className="py-3.5 px-4">City / Country</th>
                            <th className="py-3.5 px-4">Type</th>
                            <th className="py-3.5 px-4">Created By</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a4a4a]/40">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="py-3.5 px-4">
                                        <div className="w-14 h-4 rounded-sm bg-[#1a4a4a]/40" />
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="w-28 h-4 rounded-sm bg-[#1a4a4a]/40" />
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="w-24 h-4 rounded-sm bg-[#1a4a4a]/30" />
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="w-16 h-5 rounded-full bg-[#1a4a4a]/30" />
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="w-28 h-4 rounded-sm bg-[#1a4a4a]/30" />
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="w-16 h-5 rounded-full bg-[#1a4a4a]/30" />
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="w-24 h-7 rounded-lg bg-[#1a4a4a]/30 ml-auto" />
                                    </td>
                                </tr>
                            ))
                        ) : locations.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Icon.MapPin />
                                        <p className="text-xs font-bold text-[#e0faf5]">No locations found</p>
                                        {!showDeleted && (
                                            <button
                                                onClick={openCreate}
                                                className="text-xs font-semibold text-[#00c9a7] hover:underline cursor-pointer"
                                            >
                                                Add a new location
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : locations.map((loc) => (
                            <tr
                                key={loc.id}
                                className="hover:bg-[#112a2a]/40 transition-colors group"
                                style={{ opacity: loc.isBlocked ? 0.75 : 1 }}
                            >
                                <td className="py-3 px-4 font-mono font-bold text-xs text-[#00e5c0] tracking-wider">
                                    {loc.code}
                                </td>
                                <td className="py-3 px-4 font-semibold text-[#e0faf5]">
                                    {loc.name}
                                </td>
                                <td className="py-3 px-4 text-[#7ecfc4]">
                                    <span>{loc.city}</span>
                                    <span className="text-[#3a6b66] ml-1.5 text-[11px] font-semibold">{loc.countryCode}</span>
                                </td>
                                <td className="py-3 px-4">
                                    <Badge label={loc.type ?? "—"} color={typeBadgeColor(loc.type ?? "")} />
                                </td>
                                <td className="py-3 px-4">
                                    {loc.createdBy ? (
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-[#e0faf5]">{loc.createdBy.name}</span>
                                            <span className="text-[11px] text-[#7ecfc4]/70">{loc.createdBy.email}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[#3a6b66]">—</span>
                                    )}
                                </td>
                                <td className="py-3 px-4">
                                    {showDeleted ? (
                                        <Badge label="Deleted" color="red" />
                                    ) : loc.isBlocked ? (
                                        <Badge label="Blocked" color="red" />
                                    ) : (
                                        <Badge label="Active" color="green" />
                                    )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        {showDeleted ? (
                                            <ActionBtn
                                                icon={<Icon.Restore />}
                                                label="Restore location"
                                                variant="success"
                                                onClick={() => openRestore(loc)}
                                            />
                                        ) : (
                                            <>
                                                <ActionBtn
                                                    icon={<Icon.Edit />}
                                                    label="Edit location"
                                                    variant="info"
                                                    onClick={() => openEdit(loc)}
                                                />
                                                {loc.isBlocked ? (
                                                    <ActionBtn
                                                        icon={<Icon.Unblock />}
                                                        label="Unblock location"
                                                        variant="success"
                                                        onClick={() => openUnblock(loc)}
                                                    />
                                                ) : (
                                                    <ActionBtn
                                                        icon={<Icon.Ban />}
                                                        label="Block location"
                                                        variant="warning"
                                                        onClick={() => openBlock(loc)}
                                                    />
                                                )}
                                                <ActionBtn
                                                    icon={<Icon.Trash />}
                                                    label="Delete location"
                                                    variant="danger"
                                                    onClick={() => openDelete(loc)}
                                                />
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ── Reusable PaginationBar ── */}
                <PaginationBar
                    currentPage={meta?.page ?? 1}
                    totalPages={meta?.totalPage ?? 1}
                    totalCount={meta?.total ?? 0}
                    pageSize={meta?.limit ?? 20}
                    itemName="locations"
                    onPageChange={goPage}
                />
            </DataTableWrapper>

            {/* ══ Modals ══ */}

            {/* Create */}
            {modal === "create" && (
                <Modal title="Add Location" onClose={closeModal} width={600}>
                    {autoFilledFields.size > 0 && (
                        <div className="bg-[#00c9a7]/10 border border-[#00c9a7]/30 rounded-xl p-3 mb-4 flex items-center gap-2 text-xs text-[#00e5c0]">
                            <Icon.Sparkle />
                            <span>Location auto-detected — fields highlighted in teal were filled automatically. Review before saving.</span>
                        </div>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                        <SuggestInput
                            label="Name"
                            name="name"
                            value={form.name}
                            onChange={handleFormChange}
                            onSelectSuggestion={(hint) => handleSuggestionSelect(hint, "name")}
                            placeholder="e.g. Chittagong Port"
                            required
                        />
                        <SuggestInput
                            label="Code"
                            name="code"
                            value={form.code}
                            onChange={handleFormChange}
                            onSelectSuggestion={(hint) => handleSuggestionSelect(hint, "code")}
                            placeholder="e.g. CGP"
                            required
                            half
                        />
                        <Field label="Type" name="type" value={form.type} onChange={handleFormChange} as="select" options={LOCATION_TYPES} half autoFilled={autoFilledFields.has("type")} />
                        <Field label="Country" name="country" value={form.country} onChange={handleFormChange} placeholder="Bangladesh" required half autoFilled={autoFilledFields.has("country")} />
                        <Field label="Country Code (ISO)" name="countryCode" value={form.countryCode} onChange={handleFormChange} placeholder="BD" required half autoFilled={autoFilledFields.has("countryCode")} />
                        <Field label="City" name="city" value={form.city} onChange={handleFormChange} placeholder="Chittagong" required half autoFilled={autoFilledFields.has("city")} />
                        <Field label="Region" name="region" value={form.region} onChange={handleFormChange} placeholder="Chittagong Division" required half autoFilled={autoFilledFields.has("region")} />
                        <Field label="Latitude" name="latitude" value={form.latitude} onChange={handleFormChange} type="number" placeholder="22.3475" step="any" half autoFilled={autoFilledFields.has("latitude")} />
                        <Field label="Longitude" name="longitude" value={form.longitude} onChange={handleFormChange} type="number" placeholder="91.8123" step="any" half autoFilled={autoFilledFields.has("longitude")} />
                    </div>
                    <ModalActions onCancel={closeModal} onConfirm={handleCreate} loading={submitting} confirmLabel="Create" confirmColor="#00c9a7" />
                </Modal>
            )}

            {/* Edit */}
            {modal === "edit" && selected && (
                <Modal title={`Edit — ${selected.code}`} onClose={closeModal} width={600}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                        <Field label="Name" name="name" value={form.name} onChange={handleFormChange} />
                        <Field label="Type" name="type" value={form.type} onChange={handleFormChange} as="select" options={LOCATION_TYPES} half />
                        <Field label="Country Code" name="countryCode" value={form.countryCode} onChange={handleFormChange} half />
                        <Field label="Country" name="country" value={form.country} onChange={handleFormChange} half />
                        <Field label="City" name="city" value={form.city} onChange={handleFormChange} half />
                        <Field label="Region" name="region" value={form.region} onChange={handleFormChange} half />
                        <Field label="Latitude" name="latitude" value={form.latitude} onChange={handleFormChange} type="number" step="any" half />
                        <Field label="Longitude" name="longitude" value={form.longitude} onChange={handleFormChange} type="number" step="any" half />
                    </div>
                    <ModalActions onCancel={closeModal} onConfirm={handleUpdate} loading={submitting} confirmLabel="Save changes" confirmColor="#00b4d8" />
                </Modal>
            )}

            {/* Block / Unblock */}
            {modal === "block" && selected && (
                <Modal title={selected.isBlocked ? `Unblock — ${selected.code}` : `Block — ${selected.code}`} onClose={closeModal} width={460}>
                    {selected.isBlocked ? (
                        <p className="text-sm text-[#7ecfc4] mb-5">
                            Unblocking will allow new shipments to use <strong className="text-[#e0faf5]">{selected.name}</strong> again.
                        </p>
                    ) : (
                        <>
                            <p className="text-sm text-[#7ecfc4] mb-4">
                                Blocking will prevent new shipments from using <strong className="text-[#e0faf5]">{selected.name}</strong>. Existing active shipments will still proceed.
                            </p>
                            <Field label="Reason (optional)" name="blockedReason" value={form.blockedReason} onChange={handleFormChange} as="textarea" placeholder="e.g. Port under maintenance until Q3 2026" />
                        </>
                    )}
                    <ModalActions onCancel={closeModal} onConfirm={handleBlock} loading={submitting} confirmLabel={selected.isBlocked ? "Unblock" : "Block"} confirmColor={selected.isBlocked ? "#00e5c0" : "#f59e0b"} />
                </Modal>
            )}

            {/* Delete */}
            {modal === "delete" && selected && (
                <Modal title={`Delete — ${selected.code}`} onClose={closeModal} width={440}>
                    <p className="text-sm text-[#7ecfc4] mb-1.5">
                        Soft-delete <strong className="text-[#e0faf5]">{selected.name}</strong>?
                    </p>
                    <p className="text-xs text-[#7ecfc4]/70 mb-5">
                        The location will be hidden from routes and shipment forms. You can restore it later.
                        Deletion will fail if active shipments or corridors are still using this location.
                    </p>
                    <ModalActions onCancel={closeModal} onConfirm={handleDelete} loading={submitting} confirmLabel="Delete" confirmColor="#ff6b6b" />
                </Modal>
            )}

            {/* Restore */}
            {modal === "restore" && selected && (
                <Modal title={`Restore — ${selected.code}`} onClose={closeModal} width={440}>
                    <p className="text-sm text-[#7ecfc4] mb-5">
                        Restore <strong className="text-[#e0faf5]">{selected.name}</strong>? It will become active and visible in route and shipment forms again.
                    </p>
                    <ModalActions onCancel={closeModal} onConfirm={handleRestore} loading={submitting} confirmLabel="Restore" confirmColor="#00e5c0" />
                </Modal>
            )}

            <ToastStack items={toasts} onRemove={removeToast} />
        </div>
    );
}