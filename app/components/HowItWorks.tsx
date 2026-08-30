"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Link2, Radar, PackageCheck } from "lucide-react";

const STEPS = [
  {
    n: "01",
    title: "Create",
    desc: "Create a shipment in seconds — origin, destination, weight, and you're done.",
    icon: PlusCircle,
  },
  {
    n: "02",
    title: "Connect",
    desc: "Assign your logistics agent and route across the global network.",
    icon: Link2,
  },
  {
    n: "03",
    title: "Track",
    desc: "Monitor every checkpoint in real time, from any device.",
    icon: Radar,
  },
  {
    n: "04",
    title: "Deliver",
    desc: "Receive updates automatically until the shipment arrives.",
    icon: PackageCheck,
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative px-6 py-28 md:py-36" style={{ background: "var(--bg-card)" }}>
      <div ref={ref} className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "var(--accent-primary)" }}>
            Simple process
          </p>
          <h2 className="text-3xl md:text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
            How it works
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
          <div
            className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-[1px]"
            style={{ background: "var(--border-primary)" }}
          />
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <Card style={{ background: "var(--gradient-card)", borderColor: "var(--border-primary)" }}>
                  <CardContent className="p-6 relative z-10">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl mb-5"
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border-accent)" }}
                    >
                      <Icon className="h-5 w-5" style={{ color: "var(--accent-primary)" }} />
                    </div>
                    <span className="text-xs font-semibold tracking-widest" style={{ color: "var(--text-muted)" }}>
                      {step.n}
                    </span>
                    <h3 className="text-lg font-semibold mt-1 mb-2" style={{ color: "var(--text-primary)" }}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {step.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
