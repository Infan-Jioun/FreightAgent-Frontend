"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CONTAINER_CLASS } from "./ContainsLayout";

const ROUTE = ["Shanghai", "Singapore", "Dubai", "Rotterdam"];

const CHECKPOINTS = [
  { label: "Pickup", state: "done" as const },
  { label: "Loaded", state: "done" as const },
  { label: "In Transit", state: "active" as const },
  { label: "Customs", state: "pending" as const },
  { label: "Delivered", state: "pending" as const },
];

function StatusDot({ state }: { state: "done" | "active" | "pending" }) {
  if (state === "done")
    return (
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
        style={{ background: "var(--accent-primary)", color: "#0a0f0f" }}
      >
        ✓
      </span>
    );
  if (state === "active")
    return (
      <span
        className="relative flex h-5 w-5 items-center justify-center rounded-full"
        style={{ background: "var(--accent-secondary)" }}
      >
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50" style={{ background: "var(--accent-secondary)" }} />
      </span>
    );
  return (
    <span
      className="h-5 w-5 rounded-full"
      style={{ border: "2px solid var(--border-primary)" }}
    />
  );
}

export function LiveTracking() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-14 md:py-20" style={{ background: "var(--bg-card)" }}>
      <div ref={ref} className={`${CONTAINER_CLASS} grid md:grid-cols-2 gap-12 items-center`}>
        {/* Left: tracking panel */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="rounded-2xl p-8"
          style={{ background: "var(--gradient-card)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                Tracking ID
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                FA-20491
              </p>
            </div>
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: "rgba(0,229,192,0.1)", color: "var(--accent-secondary)" }}
            >
              ● IN TRANSIT
            </span>
          </div>

          <div className="flex items-center gap-2 mb-8 flex-wrap">
            {ROUTE.map((stop, i) => (
              <div key={stop} className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: i <= 1 ? "var(--text-primary)" : "var(--text-muted)" }}>
                  {stop}
                </span>
                {i < ROUTE.length - 1 && (
                  <span style={{ color: "var(--border-primary)" }}>→</span>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6 py-4 border-y" style={{ borderColor: "var(--border-primary)" }}>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>ETA</span>
            <span className="text-lg font-semibold" style={{ color: "var(--accent-secondary)" }}>14h 32m</span>
          </div>

          <div className="flex flex-col gap-4">
            {CHECKPOINTS.map((cp) => (
              <div key={cp.label} className="flex items-center gap-3">
                <StatusDot state={cp.state} />
                <span
                  className="text-sm"
                  style={{ color: cp.state === "pending" ? "var(--text-muted)" : "var(--text-primary)" }}
                >
                  {cp.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: copy */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "var(--accent-primary)" }}>
            Live tracking
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: "var(--text-primary)" }}>
            Know exactly where
            <br />
            every shipment stands.
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-md mb-8" style={{ color: "var(--text-secondary)" }}>
            Track any shipment by ID — no login required. Every checkpoint,
            every port, every handoff, visible the moment it happens.
          </p>
          <a
            href="#"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: "var(--gradient-brand)", color: "#0a0f0f" }}
          >
            Track a Shipment
          </a>
        </motion.div>
      </div>
    </section>
  );
}

export default LiveTracking;
