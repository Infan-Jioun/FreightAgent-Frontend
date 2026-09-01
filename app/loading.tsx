
"use client";

import Loader8D from "@/components/ui/common/Loader8D";


export default function RootLoading() {
    return (
        <div
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
            style={{
                background: "radial-gradient(ellipse at 50% 40%, #0d2a2a 0%, #0a1f1f 45%, #050a0a 100%)",
            }}
        >
            {/* subtle grid backdrop, consistent with the rest of the app */}
            <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage:
                        "linear-gradient(#00C9A7 1px, transparent 1px), linear-gradient(90deg, #00C9A7 1px, transparent 1px)",
                    backgroundSize: "44px 44px",
                }}
            />

            <div className="relative flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold tracking-wide text-white">
                        Freight<span style={{ color: "#00C9A7" }}>Agent</span>
                    </span>
                </div>

                <Loader8D size={140} label="Loading…" />
            </div>
        </div>
    );
}