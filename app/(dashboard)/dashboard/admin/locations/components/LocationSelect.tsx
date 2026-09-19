"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "./Icons";

interface LocationOption {
    id: string;
    name: string;
    code: string;
    city: string;
    country: string;
    countryCode: string;
    type: string;
}

interface LocationSelectProps {
    label: string;
    value: string;           // selected location id
    onChange: (id: string, location: LocationOption) => void;
    onSearch: (q: string) => Promise<LocationOption[]>;
    placeholder?: string;
    required?: boolean;
    half?: boolean;
    selectedLocation?: LocationOption | null;
}

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
    SEA_PORT: { bg: "rgba(0,180,216,0.12)", text: "#00b4d8" },
    AIR_PORT: { bg: "rgba(0,229,192,0.12)", text: "#00e5c0" },
    INLAND_CONTAINER_DEPOT: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b" },
};

export function LocationSelect({
    label, value, onChange, onSearch,
    placeholder = "Search location…", required, half, selectedLocation,
}: LocationSelectProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<LocationOption[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [highlighted, setHighlighted] = useState(-1);

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const runSearch = useCallback(async (q: string) => {
        if (q.trim().length < 2) { setResults([]); setOpen(false); return; }
        setLoading(true);
        try {
            const res = await onSearch(q);
            setResults(res);
            setOpen(true);
            setHighlighted(-1);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [onSearch]);

    const handleInput = (v: string) => {
        setQuery(v);
        if (v === "") { setResults([]); setOpen(false); return; }
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => runSearch(v), 300);
    };

    const select = (loc: LocationOption) => {
        onChange(loc.id, loc);
        setQuery("");
        setResults([]);
        setOpen(false);
    };

    const clear = () => {
        onChange("", {} as LocationOption);
        setQuery("");
        setResults([]);
        inputRef.current?.focus();
    };

    // keyboard nav
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open || results.length === 0) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted(h => Math.min(h + 1, results.length - 1)); }
        if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)); }
        if (e.key === "Enter" && highlighted >= 0) { e.preventDefault(); select(results[highlighted]); }
        if (e.key === "Escape") { setOpen(false); }
    };

    const typeStyle = selectedLocation ? TYPE_COLOR[selectedLocation.type] ?? TYPE_COLOR["SEA_PORT"] : null;

    return (
        <div
            ref={wrapperRef}
            style={{ width: half ? "calc(50% - 6px)" : "100%", display: "flex", flexDirection: "column", gap: "5px", position: "relative" }}
        >
            {/* Label */}
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                {label}
                {required && <span style={{ color: "var(--danger)" }}>*</span>}
            </label>

            {/* Selected pill OR search input */}
            {value && selectedLocation?.id ? (
                // ── Selected state ──
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "var(--bg-input)", border: "1px solid var(--border-primary)",
                    borderRadius: "8px", padding: "8px 10px", gap: "8px",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                        {/* type badge */}
                        <span style={{
                            fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em",
                            padding: "2px 6px", borderRadius: "6px",
                            background: typeStyle?.bg, color: typeStyle?.text,
                            whiteSpace: "nowrap", flexShrink: 0,
                        }}>
                            {selectedLocation.type === "INLAND_CONTAINER_DEPOT" ? "ICD" : selectedLocation.type.replace("_", " ")}
                        </span>
                        {/* code */}
                        <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: "var(--accent-primary)", flexShrink: 0 }}>
                            {selectedLocation.code}
                        </span>
                        {/* name + city */}
                        <span style={{ fontSize: "13px", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {selectedLocation.name}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", flexShrink: 0 }}>
                            {selectedLocation.city}, {selectedLocation.countryCode}
                        </span>
                    </div>
                    {/* Clear */}
                    <button
                        onClick={clear}
                        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", flexShrink: 0, padding: "2px", borderRadius: "4px" }}
                    >
                        <Icon.Close />
                    </button>
                </div>
            ) : (
                // ── Search input ──
                <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", display: "flex", pointerEvents: "none" }}>
                        {loading ? <Spinner /> : <Icon.Search />}
                    </span>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => handleInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => { if (results.length > 0) setOpen(true); }}
                        placeholder={placeholder}
                        style={{
                            width: "100%", background: "var(--bg-input)",
                            border: `1px solid ${open ? "var(--accent-primary)" : "var(--border-primary)"}`,
                            borderRadius: open && results.length > 0 ? "8px 8px 0 0" : "8px",
                            color: "var(--text-primary)", fontSize: "13px",
                            padding: "9px 12px 9px 34px", outline: "none", boxSizing: "border-box",
                            transition: "border-color 0.2s",
                        }}
                    />
                </div>
            )}

            {/* ── Dropdown ── */}
            {open && results.length > 0 && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
                    background: "var(--bg-card)", border: "1px solid var(--accent-primary)",
                    borderTop: "none", borderRadius: "0 0 10px 10px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                    maxHeight: "240px", overflowY: "auto",
                }} className="custom-modal-scrollbar">
                    {results.map((loc, i) => {
                        const tc = TYPE_COLOR[loc.type] ?? TYPE_COLOR["SEA_PORT"];
                        return (
                            <div
                                key={loc.id}
                                onClick={() => select(loc)}
                                onMouseEnter={() => setHighlighted(i)}
                                style={{
                                    display: "flex", alignItems: "center", gap: "10px",
                                    padding: "10px 14px", cursor: "pointer",
                                    background: highlighted === i ? "var(--bg-card-hover)" : "transparent",
                                    borderBottom: i < results.length - 1 ? "1px solid rgba(26,74,74,0.35)" : "none",
                                    transition: "background 0.1s",
                                }}
                            >
                                {/* type badge */}
                                <span style={{
                                    fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em",
                                    padding: "2px 6px", borderRadius: "6px",
                                    background: tc.bg, color: tc.text,
                                    whiteSpace: "nowrap", flexShrink: 0, minWidth: "52px", textAlign: "center",
                                }}>
                                    {loc.type === "INLAND_CONTAINER_DEPOT" ? "ICD" : loc.type.replace("_", " ")}
                                </span>

                                {/* code */}
                                <span style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: 700, color: "var(--accent-primary)", flexShrink: 0, minWidth: "40px" }}>
                                    {loc.code}
                                </span>

                                {/* name */}
                                <span style={{ fontSize: "13px", color: "var(--text-primary)", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {loc.name}
                                </span>

                                {/* city, country */}
                                <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap", flexShrink: 0 }}>
                                    {loc.city}, {loc.countryCode}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* No results */}
            {open && !loading && results.length === 0 && query.trim().length >= 2 && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
                    background: "var(--bg-card)", border: "1px solid var(--border-primary)",
                    borderTop: "none", borderRadius: "0 0 10px 10px",
                    padding: "14px", textAlign: "center",
                    fontSize: "13px", color: "var(--text-muted)",
                }}>
                    No locations found for "{query}"
                </div>
            )}
        </div>
    );
}

// ── Tiny spinner ──────────────────────────────────────────
function Spinner() {
    return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: "spin 0.8s linear infinite" }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </svg>
    );
}