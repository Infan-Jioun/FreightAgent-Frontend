"use client";

import React from "react";
import type { FilterSelectOption, FilterSelectProps } from "@/app/types/interface";

export type { FilterSelectOption, FilterSelectProps };

export function FilterSelect({
    value,
    onChange,
    options,
    placeholder,
    title,
    className = "",
}: FilterSelectProps) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            title={title}
            className={`px-3 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00c9a7] focus:outline-hidden cursor-pointer ${className}`}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
}

export default FilterSelect;
