"use client";

export default function GlobalError({
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en">
            <body style={{ margin: 0, padding: 0, background: "#050a0a", color: "#e0faf5", fontFamily: "sans-serif" }}>
                <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>Something went wrong!</h2>
                    <p style={{ color: "#7ecfc4", fontSize: "14px", marginBottom: "20px" }}>A critical unexpected error occurred.</p>
                    <button
                        type="button"
                        onClick={() => reset()}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "12px",
                            backgroundColor: "#00c9a7",
                            color: "#050a0a",
                            fontWeight: "bold",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </body>
        </html>
    );
}
