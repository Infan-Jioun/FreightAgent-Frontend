"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import type { SearchBarProps } from "@/app/types/interface";

export type { SearchBarProps };

export function SearchBar({
    value,
    onChange,
    placeholder = "Search…",
    debounceMs = 350,
    className = "",
}: SearchBarProps) {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, debounceMs);

        return () => clearTimeout(handler);
    }, [localValue, value, debounceMs, onChange]);

    const handleClear = () => {
        setLocalValue("");
        onChange("");
    };

    return (
        <div className={`relative flex-1 sm:w-64 min-w-[200px] ${className}`}>
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66] pointer-events-none flex">
                <Search size={15} />
            </span>
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:border-[#00c9a7] focus:outline-hidden transition-colors"
            />
            {localValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7ecfc4] hover:text-[#e0faf5] cursor-pointer"
                    title="Clear search"
                >
                    <X size={13} />
                </button>
            )}
        </div>
    );
}

export default SearchBar;
