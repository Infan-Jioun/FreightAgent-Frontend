"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Bot, TrendingDown, Route, Clock, AlertTriangle } from "lucide-react";

const INSIGHTS = [
  { icon: TrendingDown, label: "Delay Risk", value: "Low", tint: "var(--accent-secondary)" },
  { icon: Route, label: "Route Optimization", value: "Active", tint: "var(--accent-blue)" },
  { icon: Clock, label: "ETA Prediction", value: "14h 32m", tint: "var(--accent-secondary)" },
  { icon: AlertTriangle, label: "Shipment Anomaly", value: "None", tint: "var(--text-secondary)" },
];

export function AICommandCenter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="ai-command-center" className="relative px-6 py-28 md:py-36 animate-fade-in" style={{ background: "var(--bg-primary)", animationDelay: "100ms" }}>
      <div ref={ref} className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "var(--accent-primary)" }}>
            AI logistics command center
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: "var(--text-primary)" }}>
            Ask your freight
            <br />
            anything.
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-md" style={{ color: "var(--text-secondary)" }}>
            FreightAgent&#39;s AI monitors every active shipment, flags delay
            risk before it happens, and answers questions in plain language —
            so your team spends less time chasing status updates.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--gradient-card)", border: "1px solid var(--border-accent)" }}
        >
          <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
            <Bot className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
            <span className="text-xs tracking-widest font-semibold" style={{ color: "var(--text-primary)" }}>
              FREIGHT AI
            </span>
          </div>

          <div className="p-6">
            <div
              className="text-sm mb-5 p-3 rounded-xl w-fit max-w-[85%] ml-auto"
              style={{ background: "var(--bg-input)", color: "var(--text-primary)" }}
            >
              Where is shipment FA-20491?
            </div>

            <div className="text-sm mb-6 p-4 rounded-xl" style={{ background: "rgba(0,201,167,0.06)", border: "1px solid var(--border-primary)" }}>
              <p className="flex items-center gap-2 mb-1" style={{ color: "var(--accent-secondary)" }}>
                ● In transit
              </p>
              <p style={{ color: "var(--text-primary)" }}>Shanghai → Rotterdam</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>ETA: 14h 32m · Delay risk: Low</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {INSIGHTS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="p-3 rounded-xl"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-primary)" }}
                  >
                    <Icon className="h-3.5 w-3.5 mb-2" style={{ color: item.tint }} />
                    <p className="text-[10px] tracking-wide" style={{ color: "var(--text-muted)" }}>{item.label}</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{item.value}</p>
                  </div>
                );
              })}
            </div>

            <div
              className="text-sm px-4 py-3 rounded-xl opacity-60"
              style={{ border: "1px dashed var(--border-primary)", color: "var(--text-muted)" }}
            >
              Ask about another shipment...
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AICommandCenter;
