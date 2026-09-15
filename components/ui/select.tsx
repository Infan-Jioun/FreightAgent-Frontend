"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    iconClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, iconClassName, ...props }, ref) => {
        return (
            <div className="relative w-full">
                <select
                    ref={ref}
                    className={cn(
                        "w-full appearance-none rounded-xl border border-[#1a4a4a] bg-[#0d1f1f] px-3.5 py-2.5 pr-10 text-xs font-medium text-[#e0faf5] transition-all focus:border-[#00c9a7] focus:outline-hidden focus:ring-3 focus:ring-[#00c9a7]/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-xs",
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown
                    size={15}
                    className={cn(
                        "pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7ecfc4]",
                        iconClassName
                    )}
                />
            </div>
        );
    }
);

Select.displayName = "Select";

export { Select };
