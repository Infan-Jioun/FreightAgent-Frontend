import { Suspense } from "react";
import GoogleSuccessContent from "./GoogleSuccessContent";

export default function GoogleSuccessPage() {
    return (
        <Suspense
            fallback={
                <div
                    className="min-h-screen flex items-center justify-center"
                    style={{ background: "var(--bg-primary)" }}
                >
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full border-2 animate-spin"
                            style={{
                                borderColor: "var(--border-primary)",
                                borderTopColor: "var(--accent-primary)",
                            }}
                        />
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Signing you in...
                        </p>
                    </div>
                </div>
            }
        >
            <GoogleSuccessContent />
        </Suspense>
    );
}