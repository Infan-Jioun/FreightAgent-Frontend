"use client";

export function Field({
    label, name, value, onChange, type = "text",
    placeholder, required, half, as, options, step, autoFilled,
}: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    type?: string; placeholder?: string; required?: boolean;
    half?: boolean; as?: "select" | "textarea"; options?: string[]; step?: string;
    autoFilled?: boolean;
}) {
    const inputStyle: React.CSSProperties = {
        width: "100%",
        background: autoFilled ? "rgba(0,201,167,0.06)" : "var(--bg-input)",
        border: `1px solid ${autoFilled ? "rgba(0,201,167,0.4)" : "var(--border-primary)"}`,
        borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px",
        padding: "9px 12px", outline: "none", boxSizing: "border-box",
        transition: "border-color 0.2s, background 0.2s",
    };

    return (
        <div style={{ width: half ? "calc(50% - 6px)" : "100%", display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500, display: "flex", alignItems: "center", gap: "5px" }}>
                {label}
                {required && <span style={{ color: "var(--danger)" }}>*</span>}
                {autoFilled && (
                    <span style={{ fontSize: "10px", color: "#00c9a7", background: "rgba(0,201,167,0.1)", borderRadius: "10px", padding: "1px 6px", fontWeight: 600 }}>
                        auto
                    </span>
                )}
            </label>
            {as === "select" ? (
                <select name={name} value={value} onChange={onChange} style={inputStyle}>
                    {options?.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : as === "textarea" ? (
                <textarea name={name} value={value} onChange={onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
                    placeholder={placeholder} rows={3}
                    style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
            ) : (
                <input name={name} value={value} onChange={onChange as React.ChangeEventHandler<HTMLInputElement>}
                    type={type} placeholder={placeholder} step={step} style={inputStyle} />
            )}
        </div>
    );
}