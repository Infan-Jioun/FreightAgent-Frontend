"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns 0→1 progress of how far the given section has scrolled through
 * the viewport, plus a boolean for prefers-reduced-motion.
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null);
 *   const { progress, reducedMotion } = useScrollProgress(ref);
 */
export function useScrollProgress(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener?.("change", onChange);

    function measure() {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when section top hits bottom of viewport, 1 when section bottom hits top
      const total = rect.height + vh;
      const passed = vh - rect.top;
      const p = Math.min(1, Math.max(0, passed / total));
      setProgress(p);
    }

    function onScroll() {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        measure();
        rafId.current = null;
      });
    }

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mq.removeEventListener?.("change", onChange);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [ref]);

  return { progress, reducedMotion };
}

/** Simple pointer position hook, normalized -1..1, SSR safe. */
export function usePointerParallax(disabled = false) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (disabled) return;
    function onMove(e: PointerEvent) {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setPointer({ x, y });
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [disabled]);

  return pointer;
}
