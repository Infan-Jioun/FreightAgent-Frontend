"use client";

import { useState, useEffect } from "react";
import { Icon } from "./Icons";


export type ToastType = "success" | "error" | "info";

export interface ToastItem {
    id: number;
    msg: string;
    type: ToastType;
}

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; color: string }> = {
    success: { bg: "rgba(0,229,192,0.10)", border: "rgba(0,229,192,0.35)", color: "#00e5c0" },
    error: { bg: "rgba(255,107,107,0.10)", border: "rgba(255,107,107,0.35)", color: "#ff6b6b" },
    info: { bg: "rgba(0,180,216,0.10)", border: "rgba(0,180,216,0.35)", color: "#00b4d8" },
};

const TOAST_ICONS: Record<ToastType, React.ReactNode> = {
    success: <Icon.CheckCircle />,
    error: <Icon.AlertCircle />,
    info: <Icon.Info />,
};

function ToastItemComponent({ item, onRemove }: { item: ToastItem; onRemove: (id: number) => void }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const t = setTimeout(() => {
            setVisible(false);
            setTimeout(() => onRemove(item.id), 300);
        }, 3500);
        return () => clearTimeout(t);
    }, [item.id, onRemove]);

    const s = TOAST_STYLES[item.type];
    return (
        <div style={{
            background: s.bg, border: `1px solid ${s.border}`, color: s.color,
            padding: "12px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 500,
            boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
            display: "flex", alignItems: "flex-start", gap: "10px",
            transform: visible ? "translateX(0)" : "translateX(110%)",
            opacity: visible ? 1 : 0,
            transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
        }}>
            <span style={{ flexShrink: 0, marginTop: "1px" }}>{TOAST_ICONS[item.type]}</span>
            <span style={{ flex: 1, lineHeight: "1.45" }}>{item.msg}</span>
            <button
                onClick={() => { setVisible(false); setTimeout(() => onRemove(item.id), 300); }}
                style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", opacity: 0.6, padding: "0", flexShrink: 0, display: "flex" }}
            >
                <Icon.Close />
            </button>
        </div>
    );
}

export function ToastStack({ items, onRemove }: { items: ToastItem[]; onRemove: (id: number) => void }) {
    if (items.length === 0) return null;
    return (
        <div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 200, display: "flex", flexDirection: "column", gap: "10px", minWidth: "300px", maxWidth: "380px" }}>
            {items.map(item => (
                <ToastItemComponent key={item.id} item={item} onRemove={onRemove} />
            ))}
        </div>
    );
}