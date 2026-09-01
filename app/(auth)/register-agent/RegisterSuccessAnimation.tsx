"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

interface RegisterSuccessAnimationProps {
    active: boolean;
    reducedMotion: boolean;
    /** Called once the sequence has finished playing — the caller then does its own routing. */
    onComplete: () => void;
}

/**
 * Purely presentational. Owns no business logic: it just plays a short
 * two-beat sequence (ACCOUNT CREATED -> WELCOME TO FREIGHTAGENT) and calls
 * onComplete when it's done, so the caller can proceed with its existing
 * router.push exactly as before, just slightly deferred for the visual beat.
 */
export default function RegisterSuccessAnimation({ active, reducedMotion, onComplete }: RegisterSuccessAnimationProps) {
    const [phase, setPhase] = useState<"created" | "welcome" | null>(null);

    useEffect(() => {
        if (!active) {
            setPhase(null);
            return;
        }

        if (reducedMotion) {
            // Skip the two-beat sequence, but still give a brief, calm
            // confirmation before handing back to the caller's redirect.
            setPhase("welcome");
            const t = setTimeout(onComplete, 500);
            return () => clearTimeout(t);
        }

        setPhase("created");
        const toWelcome = setTimeout(() => setPhase("welcome"), 900);
        const finish = setTimeout(onComplete, 1900);
        return () => {
            clearTimeout(toWelcome);
            clearTimeout(finish);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    return (
        <AnimatePresence>
            {active && phase && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center"
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
                            className="text-lg font-bold uppercase tracking-widest text-white"
                        >
                            {phase === "created" ? "Account Created" : "Welcome to FreightAgent"}
                        </motion.p>
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
