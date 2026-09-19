"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

export default function LenisProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.55,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            smoothWheel: true,
            touchMultiplier: 1.2,
            allowNestedScroll: true,
            prevent: (node) =>
                node.hasAttribute?.("data-lenis-prevent") ||
                node.closest?.("[data-lenis-prevent]") !== null,
        });

        lenisRef.current = lenis;

        let animationFrame: number;

        const raf = (time: number) => {
            lenis.raf(time);
            animationFrame = requestAnimationFrame(raf);
        };

        animationFrame = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(animationFrame);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}