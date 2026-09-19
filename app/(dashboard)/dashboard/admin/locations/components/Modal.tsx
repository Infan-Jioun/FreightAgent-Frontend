"use client";

import { Icon } from "./Icons";


export function Modal({ title, onClose, children, width = 560 }: {
    title: string; onClose: () => void; children: React.ReactNode; width?: number;
}) {
    return (
        <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", borderRadius: "14px", width: "100%", maxWidth: `${width}px`, boxShadow: "0 0 60px rgba(0,200,180,0.12)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--border-primary)", flexShrink: 0 }}>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{title}</span>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px", borderRadius: "6px", display: "flex" }}>
                        <Icon.Close />
                    </button>
                </div>
                <div style={{ overflowY: "auto", padding: "22px" }} className="custom-modal-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}