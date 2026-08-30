"use client";

import { Anchor } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="px-8 py-8 flex flex-col sm:flex-row items-center justify-between"
      style={{ borderTop: "1px solid var(--border-primary)", color: "var(--text-muted)" }}
    >
      <div className="flex items-center gap-2 mb-4 sm:mb-0">
        <Anchor className="h-4 w-4" style={{ color: "var(--accent-primary)" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
          FreightAgent
        </span>
      </div>
      <p className="text-xs">© 2026 FreightAgent. A global freight platform.</p>
      <div className="flex items-center gap-6 mt-4 sm:mt-0">
        {["Privacy", "Terms", "Support"].map((item) => (
          <span key={item} className="text-xs cursor-pointer hover:opacity-80 transition-opacity">
            {item}
          </span>
        ))}
      </div>
    </footer>
  );
}

export default Footer;
