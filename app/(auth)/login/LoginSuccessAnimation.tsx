/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/refs */
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface LoginSuccessAnimationProps {
    active: boolean;
    reducedMotion: boolean;
    /** Optional first name / display name to personalize the welcome beat. */
    name?: string;
    /** Called once the sequence has finished playing — the caller then does its own routing. */
    onComplete: () => void;
}

/**
 * Purely presentational. Owns no business logic: it just plays a short
 * two-beat sequence (SIGNED IN -> WELCOME BACK) and calls onComplete when
 * it's done, so the caller can proceed with its existing router.push
 * exactly as before, just slightly deferred for the visual beat.
 *
 * The overlay is shown the instant `active` becomes true — the phase
 * ("signedIn" -> "welcome") only controls which line of text is shown, it
 * never gates whether the overlay itself is visible. That's what caused it
 * to silently not render before: `phase` started as null and was only set
 * inside a useEffect, so `active && phase` was false for the very first
 * render after `active` flipped true.
 */
export default function LoginSuccessAnimation({
    active,
    reducedMotion,
    name,
    onComplete,
}: LoginSuccessAnimationProps) {
    const [phase, setPhase] = useState<"signedIn" | "welcome">(
        reducedMotion ? "welcome" : "signedIn"
    );

    // Keep the latest onComplete without re-triggering the timer effect.
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
        if (!active) return;

        if (reducedMotion) {
            setPhase("welcome");
            const t = setTimeout(() => onCompleteRef.current(), 500);
            return () => clearTimeout(t);
        }

        setPhase("signedIn");
        const toWelcome = setTimeout(() => setPhase("welcome"), 800);
        const finish = setTimeout(() => onCompleteRef.current(), 1700);
        return () => {
            clearTimeout(toWelcome);
            clearTimeout(finish);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active, reducedMotion]);

    const welcomeText = name ? `Welcome back, ${name}` : "Welcome back to FreightAgent";

    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center"
                    style={{ background: "rgba(5, 10, 10, 0.55)", backdropFilter: "blur(2px)" }}
                >
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="rounded-full p-3 mb-4"
                        style={{ background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.3)" }}
                    >
                        <CheckCircle2 size={28} style={{ color: "#00C9A7" }} />
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.p
                            key={phase}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3 }}
                            className="text-lg font-bold uppercase tracking-widest text-white text-center px-6"
                        >
                            {phase === "signedIn" ? "Signed In" : welcomeText}
                        </motion.p>
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}