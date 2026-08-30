"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Anchor, Package, Radio, ChevronDown } from "lucide-react";
import LiveShipmentCard from "./LiveShipmentCard";
import ContainerInfoCard from "./ContainerInfoCard";
import NetworkStatusCard from "./NetworkStatusCard";
import RegisterSuccessAnimation from "./RegisterSuccessAnimation";

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

export interface PasswordStrength {
    score: number;
    label: string;
    color: string;
}

interface RegisterVisualProps {
    name?: string;
    email?: string;
    passwordStrength?: PasswordStrength;
    /** True once registration has succeeded; plays the success sequence. */
    success?: boolean;
    /** Called when the success sequence finishes — caller does its own redirect. */
    onSuccessComplete?: () => void;
}

/**
 * Compact mobile fallback — no WebGL, just enough motion to feel alive.
 * Rendered by the page only inside its own `lg:hidden` slot, so it carries
 * no responsive visibility classes itself.
 */
export function MobileRegisterSummary() {
    return (
        <div
            className="w-full rounded-2xl px-5 py-4"
            style={{
                background: "linear-gradient(135deg, rgba(0,201,167,0.08), rgba(10,15,15,0.6))",
                border: "1px solid rgba(255,255,255,0.08)",
            }}
        >
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    <Radio size={10} style={{ color: "#00C9A7" }} />
                    Live Network
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold uppercase" style={{ color: "#00C9A7" }}>
                    ● Shipment Active
                </span>
            </div>

            <div className="mt-3 flex items-center justify-center gap-3 py-2">
                <div className="rounded-xl p-3" style={{ background: "rgba(0,201,167,0.1)", border: "1px solid rgba(0,201,167,0.25)" }}>
                    <Package size={22} style={{ color: "#00C9A7" }} />
                </div>
            </div>

            <div className="flex flex-col items-center gap-0.5 text-sm font-semibold text-white">
                <span>Dubai</span>
                <ChevronDown size={12} className="text-gray-500" />
                <span>Riyadh</span>
            </div>
            <div className="mt-2 text-center text-[11px] text-gray-500">Container FA-20491</div>
        </div>
    );
}

/**
 * Full cinematic 3D visualization panel for the desktop left column.
 * The caller supplies the sizing wrapper — this component fills it.
 */
export default function RegisterVisual({ name, email, passwordStrength, success, onSuccessComplete }: RegisterVisualProps) {
    const reducedMotion = usePrefersReducedMotion();

    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
            {/* Base atmosphere */}
            <div
                className="absolute inset-0 z-0"
                style={{ background: "radial-gradient(ellipse at 50% 30%, #0d2a2a 0%, #0a1f1f 45%, #050a0a 100%)" }}
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

            {/* 3D hero scene */}
            <div className="absolute inset-0 z-[4]">
                <Suspense fallback={<ScenePlaceholder />}>
                    <ShipmentScene reducedMotion={reducedMotion} success={success} />
                </Suspense>
            </div>

            {/* Brand + heading, reactive to form state */}
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="pointer-events-none absolute top-10 left-0 right-0 z-10 px-10 text-center"
            >
                <div className="mb-3 flex items-center justify-center gap-2">
                    <Anchor size={18} style={{ color: "#00C9A7" }} />
                    <span className="text-sm font-extrabold tracking-wide text-white">
                        Freight<span style={{ color: "#00C9A7" }}>Agent</span>
                    </span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.h2
                        key={name ? "welcome" : email ? "identified" : "default"}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.3 }}
                        className="text-2xl font-extrabold tracking-tight text-white drop-shadow-lg"
                    >
                        {name ? `Welcome, ${name.split(" ")[0]}` : email ? "Account Identified" : "Join the Network"}
                    </motion.h2>
                </AnimatePresence>

                <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-gray-400">
                    Create your account and connect to real-time freight tracking across the Gulf.
                </p>

                {passwordStrength && passwordStrength.score > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto mt-3 flex max-w-[180px] items-center gap-2"
                    >
                        <div className="flex h-1 flex-1 gap-1">
                            {[1, 2, 3, 4].map((s) => (
                                <div
                                    key={s}
                                    className="h-full flex-1 rounded-full transition-all duration-300"
                                    style={{
                                        background: passwordStrength.score >= s ? passwordStrength.color : "rgba(255,255,255,0.1)",
                                    }}
                                />
                            ))}
                        </div>
                        <span className="text-[9px] font-medium uppercase tracking-wide" style={{ color: passwordStrength.color }}>
                            {passwordStrength.label}
                        </span>
                    </motion.div>
                )}
            </motion.div>

            {/* Floating shipment UI */}
            <div className="pointer-events-none absolute bottom-8 left-6 z-10">
                <LiveShipmentCard reducedMotion={reducedMotion} success={success} className="pointer-events-auto w-56" />
            </div>
            <div className="pointer-events-none absolute top-32 right-6 z-10">
                <ContainerInfoCard reducedMotion={reducedMotion} className="pointer-events-auto" />
            </div>
            <div className="pointer-events-none absolute bottom-8 right-6 z-10">
                <NetworkStatusCard reducedMotion={reducedMotion} className="pointer-events-auto" />
            </div>

            {/* Cinematic success sequence */}
            <RegisterSuccessAnimation
                active={!!success}
                reducedMotion={reducedMotion}
                onComplete={() => onSuccessComplete?.()}
            />
        </div>
    );
}
