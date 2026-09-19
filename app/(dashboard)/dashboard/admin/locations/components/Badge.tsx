type BadgeColor = "green" | "red" | "blue" | "amber" | "gray";

const COLOR_MAP: Record<BadgeColor, { bg: string; border: string; text: string }> = {
    green: { bg: "rgba(0,229,192,0.1)", border: "rgba(0,229,192,0.3)", text: "#00e5c0" },
    red: { bg: "rgba(255,107,107,0.1)", border: "rgba(255,107,107,0.3)", text: "#ff6b6b" },
    blue: { bg: "rgba(0,180,216,0.1)", border: "rgba(0,180,216,0.3)", text: "#00b4d8" },
    amber: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", text: "#f59e0b" },
    gray: { bg: "rgba(126,207,196,0.08)", border: "rgba(126,207,196,0.2)", text: "#7ecfc4" },
};

export function typeBadgeColor(t: string): BadgeColor {
    if (t === "SEA_PORT") return "blue";
    if (t === "AIR_PORT") return "green";
    if (t === "INLAND_CONTAINER_DEPOT") return "amber";
    return "gray";
}

export function Badge({ label, color }: { label: string; color: BadgeColor }) {
    const c = COLOR_MAP[color];
    return (
        <span style={{
            background: c.bg, border: `1px solid ${c.border}`, color: c.text,
            padding: "2px 8px", borderRadius: "20px", fontSize: "11px",
            fontWeight: 600, letterSpacing: "0.02em", whiteSpace: "nowrap",
        }}>
            {label}
        </span>
    );
}