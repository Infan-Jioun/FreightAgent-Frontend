/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Package, Radio } from "lucide-react";
import ShipmentRoute, { ShipmentRouteLabels } from "./ShipmentRoute";
import ShipmentStatusCard from "./ShipmentStatusCard";
import TrackingLocationCard from "./TrackingLocationCard";
import ContainerInfoCard from "./ContainerInfoCard";
import LoginSuccessAnimation from "./LoginSuccessAnimation";

// The 3D scene touches WebGL, so it must never be evaluated during SSR.
const ShipmentScene = dynamic(() => import("./ShipmentScene"), {
    ssr: false,
    loading: () => <ScenePlaceholder />,
});

function ScenePlaceholder() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="h-40 w-56 rounded-xl"
                style={{ background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.15)" }}
            />
        </div>
    );
}

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mq.matches);
        const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener("change", listener);
        return () => mq.removeEventListener("change", listener);
    }, []);
    return reduced;
}

/**
 * Compact, lightweight logistics summary for small screens where the full
 * WebGL scene is skipped for performance. Keeps the same information
 * (shipment, route, ETA) so mobile users get equivalent context.
 *
 * Rendered by the page only inside its mobile slot (wrapped in `lg:hidden`
 * by the caller) — it carries no responsive visibility classes itself so it
 * is never accidentally duplicated on desktop.
 */
export function MobileShipmentSummary() {
    return (
        <div
            className="w-full rounded-2xl px-5 py-4"
            style={{
                background: "linear-gradient(135deg, rgba(0,201,167,0.08), rgba(10,15,15,0.6))",
                border: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg p-1.5" style={{ background: "rgba(0,201,167,0.12)" }}>
                        <Package size={16} style={{ color: "#00C9A7" }} />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Live Tracking
                    </span>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase" style={{ color: "#00C9A7" }}>
                    <Radio size={10} />
                    Live
                </span>
            </div>
            <div className="mt-3 flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                        Dubai <span style={{ color: "#00C9A7" }}>→</span> Riyadh
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-500">Container FAZU 482913 · 40FT HC</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-gray-500">ETA</div>
                    <div className="text-sm font-bold" style={{ color: "#00C9A7" }}>18h 24m</div>
                </div>
            </div>
        </div>
    );
}

interface LoginVisualProps {
    /** Set true right after a successful login to play the success overlay. */
    showSuccess?: boolean;
    /** Display name to personalize the "Welcome back" beat, if available. */
    userName?: string;
    /** Called once the success overlay has finished playing — do the redirect here. */
    onSuccessComplete?: () => void;
}

/**
 * Full cinematic 3D visualization panel for the desktop right column.
 * The caller is responsible for the `hidden lg:flex` sizing wrapper — this
 * component fills whatever container it's given.
 *
 * The success overlay lives here (not as an external sibling in the page)
 * so it is always painted at this component's own topmost z-index — above
 * the 3D scene, the heading, and every floating card — instead of depending
 * on stacking order in whatever parent happens to render this component.
 */
export default function LoginVisual({
    showSuccess = false,
    userName,
    onSuccessComplete,
}: LoginVisualProps) {
    const reducedMotion = usePrefersReducedMotion();

    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
            {/* Base atmosphere */}
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        background:
                            "radial-gradient(ellipse at 50% 30%, #0d2a2a 0%, #0a1f1f 45%, #050a0a 100%)",
                    }}
                />

                {/* Subtle grid */}
                <div
                    className="absolute inset-0 z-0 opacity-[0.05]"
                    style={{
                        backgroundImage:
                            "linear-gradient(#00C9A7 1px, transparent 1px), linear-gradient(90deg, #00C9A7 1px, transparent 1px)",
                        backgroundSize: "44px 44px",
                    }}
                />

                {/* Route + nodes */}
                <ShipmentRoute reducedMotion={reducedMotion} />
                <ShipmentRouteLabels />

                {/* 3D hero scene */}
                <div className="absolute inset-0 z-4">
                    <Suspense fallback={<ScenePlaceholder />}>
                        <ShipmentScene reducedMotion={reducedMotion} />
                    </Suspense>
                </div>

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="pointer-events-none absolute top-12 left-0 right-0 z-10 px-12 text-center"
                >
                    <span
                        className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest"
                        style={{ background: "rgba(0,201,167,0.1)", border: "1px solid rgba(0,201,167,0.25)", color: "#00C9A7" }}
                    >
                        <Radio size={10} />
                        Live Global Tracking
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">
                        Global Freight Network
                    </h2>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-400">
                        Track every shipment. Move every mile with confidence.
                    </p>
                </motion.div>

                {/* Floating shipment UI */}
                <div className="pointer-events-none absolute bottom-10 left-8 z-10">
                    <ShipmentStatusCard reducedMotion={reducedMotion} className="pointer-events-auto w-64" />
                </div>
                <div className="pointer-events-none absolute top-28 right-10 z-10">
                    <TrackingLocationCard reducedMotion={reducedMotion} className="pointer-events-auto" />
                </div>
                <div className="pointer-events-none absolute bottom-14 right-10 z-10">
                    <ContainerInfoCard reducedMotion={reducedMotion} className="pointer-events-auto" />
                </div>

                {/* Success overlay — always on top, z-30, regardless of anything above */}
                {onSuccessComplete && (
                    <LoginSuccessAnimation
                        active={showSuccess}
                        reducedMotion={reducedMotion}
                        name={userName}
                        onComplete={onSuccessComplete}
                    />
                )}
        </div>
    );
}