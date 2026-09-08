"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { CONTAINER_CLASS } from "./ContainsLayout";

const STATS = [
  { value: "Global", label: "Coverage" },
  { value: "24/7", label: "Live Tracking" },
  { value: "Multi-carrier", label: "Route Options" },
  { value: "Real-time", label: "Visibility" },
];

// stylized dot-map positions (percent-based) — purely decorative
const DOTS = [
  [12, 32], [18, 45], [22, 30], [30, 55], [34, 22], [40, 40],
  [46, 60], [52, 28], [58, 48], [64, 35], [70, 58], [76, 24],
  [82, 44], [88, 33], [25, 65], [58, 70], [8, 55], [92, 50],
];

const LINKS: [number, number][] = [
  [0, 4], [4, 8], [8, 12], [1, 6], [6, 10], [10, 15], [3, 9], [9, 13],
];

export function GlobalCoverage() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-14 md:py-20" style={{ background: "var(--bg-card)" }}>
      <div ref={ref} className={CONTAINER_CLASS}>
        <div className="text-center mb-10">
          <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "var(--accent-primary)" }}>
            Global coverage
          </p>
          <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
            Track shipments wherever they move.
          </h2>
          <p className="text-base md:text-lg max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            From Gulf ports to major hubs worldwide, FreightAgent gives you a
            single window into every lane your freight travels.
          </p>
        </div>

        {/* stylized network map */}
        <div
          className="relative h-72 md:h-96 rounded-3xl mb-14 overflow-hidden"
          style={{ background: "var(--bg-primary)", border: "1px solid var(--border-primary)" }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            {LINKS.map(([a, b], i) => (
              <motion.line
                key={i}
                x1={DOTS[a][0]}
                y1={DOTS[a][1]}
                x2={DOTS[b][0]}
                y2={DOTS[b][1]}
                stroke="var(--accent-primary)"
                strokeWidth="0.15"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 0.4 } : {}}
                transition={{ duration: 1.2, delay: 0.1 * i }}
              />
            ))}
            {DOTS.map(([x, y], i) => (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="0.6"
                fill="#00e5c0"
                initial={{ opacity: 0, scale: 0 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.05 * i }}
              />
            ))}
          </svg>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,15,15,0.75) 100%)" }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * i }}
              className="text-center p-6 rounded-2xl"
              style={{ background: "var(--gradient-card)", border: "1px solid var(--border-primary)" }}
            >
              <div className="text-xl md:text-2xl font-bold mb-1" style={{ color: "var(--accent-secondary)" }}>
                {s.value}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GlobalCoverage;
