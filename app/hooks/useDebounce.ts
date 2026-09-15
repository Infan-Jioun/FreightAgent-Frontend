import { useState, useEffect } from "react";

/**
 * useDebounce Hook
 * Defers updating a value until a specified delay has elapsed without new changes.
 * Essential for query inputs to protect backend rate limits (e.g. 30 requests/min).
 */
export function useDebounce<T>(value: T, delay = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}
