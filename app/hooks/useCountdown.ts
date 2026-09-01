"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function formatDuration(totalSeconds: number) {
    const s = Math.max(0, totalSeconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const mm = String(m).padStart(2, "0");
    const ss = String(sec).padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Countdown backed by an absolute "retry at" timestamp in localStorage
 * (per storageKey), instead of plain component state.
 *
 * - Survives refresh/remount — a rate-limited user can't just reload the
 *   page to make the button re-enable early.
 * - Stays correct across tabs, since every tick re-reads the same key.
 */
export function useCountdown(storageKey: string) {
    const [secondsLeft, setSecondsLeft] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const tick = useCallback(() => {
        if (typeof window === "undefined") return;
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) {
            setSecondsLeft(0);
            return;
        }
        const retryAt = Number(raw);
        const diff = Math.max(0, Math.round((retryAt - Date.now()) / 1000));
        setSecondsLeft(diff);
        if (diff <= 0) {
            window.localStorage.removeItem(storageKey);
        }
    }, [storageKey]);

    useEffect(() => {
        tick(); // in case a countdown is already in flight on mount
        intervalRef.current = setInterval(tick, 1000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [tick]);

    const start = useCallback(
        (seconds: number) => {
            if (typeof window === "undefined" || seconds <= 0) return;
            window.localStorage.setItem(storageKey, String(Date.now() + seconds * 1000));
            tick();
        },
        [storageKey, tick]
    );

    const clear = useCallback(() => {
        if (typeof window === "undefined") return;
        window.localStorage.removeItem(storageKey);
        setSecondsLeft(0);
    }, [storageKey]);

    return {
        secondsLeft,
        isActive: secondsLeft > 0,
        formatted: formatDuration(secondsLeft),
        start,
        clear,
    };
}