"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Warehouse, Anchor, Ship, Truck, ShieldCheck, PackageCheck } from "lucide-react";

const STAGES = [
  { n: "01", label: "Booked", icon: PackageCheck },
  { n: "02", label: "Picked Up", icon: Warehouse },
  { n: "03", label: "Loaded", icon: Anchor },
  { n: "04", label: "In Transit", icon: Ship },
  { n: "05", label: "Customs", icon: ShieldCheck },
  { n: "06", label: "Delivered", icon: Truck },
];

export function ShipmentLifecycle() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const containerX = useTransform(scrollYProgress, [0, 1], ["0%", "84%"]);
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative px-6 py-28 md:py-36 overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "var(--accent-primary)" }}>
            Shipment lifecycle
          </p>
          <h2 className="text-3xl md:text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
            From pickup to delivery,
            <br />
            nothing disappears from view.
          </h2>
        </div>

        <div className="relative pt-10 pb-4">
          {/* track line */}
          <div
            className="absolute top-[52px] left-0 right-0 h-[2px]"
            style={{ background: "var(--border-primary)" }}
          />
          <motion.div
            className="absolute top-[52px] left-0 h-[2px]"
            style={{ width: lineWidth, background: "var(--gradient-brand)" }}
          />

          {/* traveling container marker */}
          <motion.div
            className="absolute top-[36px] flex h-8 w-10 items-center justify-center rounded-md"
            style={{
              left: containerX,
              background: "var(--accent-primary)",
              boxShadow: "0 0 24px rgba(0,201,167,0.6)",
            }}
          >
            <Ship className="h-4 w-4" style={{ color: "#0a0f0f" }} />
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 relative">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div key={stage.n} className="flex flex-col items-center text-center">
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-full mb-4"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
                  >
                    <Icon className="h-5 w-5" style={{ color: "var(--accent-secondary)" }} />
                  </span>
                  <span className="text-[10px] tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
                    {stage.n}
                  </span>
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShipmentLifecycle;
