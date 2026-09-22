"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
    StatCardProps,
    StatCardVariant,
    StatCardTrend,
    StatCardsGridProps,
} from "@/app/types/interface";

export type { StatCardProps, StatCardVariant, StatCardTrend, StatCardsGridProps };

const VARIANT_CONFIGS: Record<
    StatCardVariant,
    {
        borderHover: string;
        iconBg: string;
        iconBorder: string;
        iconText: string;
        accentText: string;
        accentBadge: string;
        glowHover: string;
    }
> = {
    teal: {
        borderHover: "hover:border-[#00c9a7]/50",
        iconBg: "bg-[#00c9a7]/15",
        iconBorder: "border-[#00c9a7]/30",
        iconText: "text-[#00c9a7]",
        accentText: "text-[#00e5c0]",
        accentBadge: "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30",
        glowHover: "hover:shadow-[#00c9a7]/5",
    },
    cyan: {
        borderHover: "hover:border-[#00b4d8]/50",
        iconBg: "bg-[#00b4d8]/15",
        iconBorder: "border-[#00b4d8]/30",
        iconText: "text-[#00b4d8]",
        accentText: "text-[#00b4d8]",
        accentBadge: "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/30",
        glowHover: "hover:shadow-[#00b4d8]/5",
    },
    blue: {
        borderHover: "hover:border-blue-500/50",
        iconBg: "bg-blue-500/15",
        iconBorder: "border-blue-500/30",
        iconText: "text-blue-400",
        accentText: "text-blue-300",
        accentBadge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
        glowHover: "hover:shadow-blue-500/5",
    },
    purple: {
        borderHover: "hover:border-purple-500/50",
        iconBg: "bg-purple-500/15",
        iconBorder: "border-purple-500/30",
        iconText: "text-purple-400",
        accentText: "text-purple-300",
        accentBadge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        glowHover: "hover:shadow-purple-500/5",
    },
    amber: {
        borderHover: "hover:border-amber-500/50",
        iconBg: "bg-amber-500/15",
        iconBorder: "border-amber-500/30",
        iconText: "text-amber-400",
        accentText: "text-amber-400",
        accentBadge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        glowHover: "hover:shadow-amber-500/5",
    },
    orange: {
        borderHover: "hover:border-orange-500/50",
        iconBg: "bg-orange-500/15",
        iconBorder: "border-orange-500/30",
        iconText: "text-orange-400",
        accentText: "text-orange-400",
        accentBadge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
        glowHover: "hover:shadow-orange-500/5",
    },
    rose: {
        borderHover: "hover:border-rose-500/50",
        iconBg: "bg-rose-500/15",
        iconBorder: "border-rose-500/30",
        iconText: "text-rose-400",
        accentText: "text-rose-400",
        accentBadge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        glowHover: "hover:shadow-rose-500/5",
    },
    neutral: {
        borderHover: "hover:border-slate-500/50",
        iconBg: "bg-slate-800",
        iconBorder: "border-slate-700",
        iconText: "text-slate-300",
        accentText: "text-slate-200",
        accentBadge: "bg-slate-800 text-slate-300 border-slate-700",
        glowHover: "hover:shadow-slate-500/5",
    },
};

export function StatCard({
    title,
    value,
    icon,
    subtitle,
    variant = "teal",
    trend,
    badge,
    loading = false,
    href,
    onClick,
    className = "",
    ariaLabel,
}: StatCardProps): React.JSX.Element {
    const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.teal;

    // Render Icon element safely (handles component type, forwardRef component, or JSX node)
    const renderIcon = () => {
        if (!icon) return null;
        if (React.isValidElement(icon)) {
            return icon;
        }
        if (
            typeof icon === "function" ||
            (typeof icon === "object" && icon !== null && "$$typeof" in icon)
        ) {
            const IconComponent = icon as React.ComponentType<{
                size?: number;
                className?: string;
                strokeWidth?: number;
            }>;
            return <IconComponent size={20} strokeWidth={2.2} />;
        }
        if (typeof icon === "string" || typeof icon === "number") {
            return icon;
        }
        return null;
    };

    // Render trend indicator or badge
    const renderTrendOrBadge = () => {
        if (badge) {
            return (
                <span
                    className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 shrink-0",
                        config.accentBadge
                    )}
                >
                    {badge}
                </span>
            );
        }

        if (!trend) return null;

        if (typeof trend === "string") {
            return (
                <span
                    className={cn(
                        "text-xs font-semibold flex items-center gap-0.5 shrink-0",
                        config.accentText
                    )}
                >
                    {trend}
                </span>
            );
        }

        const isPos = trend.isPositive ?? true;
        const TrendIcon = trend.neutral
            ? null
            : isPos
            ? TrendingUp
            : TrendingDown;
        const trendColor = trend.neutral
            ? config.accentText
            : isPos
            ? "text-[#00e5c0]"
            : "text-[#ff6b6b]";

        return (
            <span
                className={cn(
                    "text-xs font-semibold flex items-center gap-1 shrink-0",
                    trendColor
                )}
            >
                {TrendIcon && <TrendIcon size={14} className="shrink-0" />}
                <span>{trend.value}</span>
                {trend.label && (
                    <span className="text-[10px] text-[#7ecfc4]/70 font-normal">
                        {trend.label}
                    </span>
                )}
            </span>
        );
    };

    const cardContent = (
        <>
            {/* Top Row: Title & Uniform Icon Badge */}
            <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-[#7ecfc4] uppercase tracking-wider line-clamp-1">
                    {title}
                </span>
                {icon && (
                    <div
                        className={cn(
                            "w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105",
                            config.iconBg,
                            config.iconBorder,
                            config.iconText
                        )}
                    >
                        {renderIcon()}
                    </div>
                )}
            </div>

            {/* Middle Row: Metric Value + Trend/Badge */}
            <div className="mt-3.5">
                {loading ? (
                    <div className="h-8 w-24 bg-[#1a4a4a]/40 rounded-lg animate-pulse" />
                ) : (
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#e0faf5] tracking-tight leading-none">
                            {value ?? "—"}
                        </span>
                        {renderTrendOrBadge()}
                        {href && (
                            <span className="ml-auto text-xs font-semibold text-[#00c9a7] flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight size={14} />
                            </span>
                        )}
                    </div>
                )}

                {/* Bottom Row: Subtitle */}
                {loading ? (
                    <div className="h-3.5 w-36 bg-[#1a4a4a]/30 rounded mt-2 animate-pulse" />
                ) : subtitle ? (
                    <p className="text-[11px] text-[#7ecfc4]/70 mt-1.5 line-clamp-1">
                        {subtitle}
                    </p>
                ) : null}
            </div>
        </>
    );

    const baseClasses = cn(
        "group h-full min-h-[148px] p-5 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-md shadow-black/20 flex flex-col justify-between transition-all duration-200",
        config.borderHover,
        config.glowHover,
        (href || onClick) && "cursor-pointer hover:-translate-y-0.5",
        className
    );

    if (href) {
        return (
            <Link
                href={href}
                className={baseClasses}
                aria-label={ariaLabel || (typeof title === "string" ? title : "Dashboard Metric Card")}
            >
                {cardContent}
            </Link>
        );
    }

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={cn(baseClasses, "text-left w-full")}
                aria-label={ariaLabel || (typeof title === "string" ? title : "Dashboard Metric Card")}
            >
                {cardContent}
            </button>
        );
    }

    return (
        <div
            className={baseClasses}
            role="region"
            aria-label={ariaLabel || (typeof title === "string" ? title : "Dashboard Metric Card")}
        >
            {cardContent}
        </div>
    );
}

export function StatCardsGrid({
    children,
    columns = 4,
    className = "",
}: StatCardsGridProps): React.JSX.Element {
    const gridColsClass =
        columns === 1
            ? "grid-cols-1"
            : columns === 2
            ? "grid-cols-1 sm:grid-cols-2"
            : columns === 3
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

    return (
        <div className={cn("grid gap-4", gridColsClass, className)}>
            {children}
        </div>
    );
}

export default StatCard;
