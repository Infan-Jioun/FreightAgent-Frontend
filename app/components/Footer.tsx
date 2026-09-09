"use client";

import Link from "next/link";
import { Anchor, ShieldCheck, Globe, ArrowUpRight } from "lucide-react";
import { ROUTES } from "@/app/constants/routes";
import { CONTAINER_CLASS } from "./ContainsLayout";

export function Footer() {
  return (
    <footer
      className="border-t border-[#1a4a4a] bg-[#070b0b] text-[#7ecfc4] pt-14 pb-8"
      style={{ borderTop: "1px solid var(--border-primary)" }}
    >
      <div className={`${CONTAINER_CLASS} space-y-12`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Overview */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#0a0f0f]"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Anchor className="h-4 w-4" />
              </div>
              <span className="text-base font-black tracking-tight text-[#e0faf5]">
                Freight<span className="text-[#00c9a7]">Agent</span>
              </span>
            </Link>

            <p className="text-xs text-[#7ecfc4]/80 max-w-sm leading-relaxed">
              The autonomous freight operating system connecting ocean container liners, priority air cargo, and cross-border drayage across 140+ countries.
            </p>

            <div className="flex items-center gap-2 text-[11px] font-mono text-[#00e5c0] bg-[#00c9a7]/10 px-3 py-1.5 rounded-xl border border-[#00c9a7]/20 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5c0] animate-ping" />
              <span>Global Dispatch Network Active</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#e0faf5]">
              Company & Network
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-[#00e5c0] transition-colors">
                  Home Operations
                </Link>
              </li>
              <li>
                <Link href={ROUTES.ABOUT} className="hover:text-[#00e5c0] transition-colors">
                  About FreightAgent
                </Link>
              </li>
              <li>
                <Link href={ROUTES.CONTACT} className="hover:text-[#00e5c0] transition-colors">
                  Strategic Port Desks
                </Link>
              </li>
              <li>
                <span className="text-[#3a6b66] cursor-not-allowed">
                  Global Careers <span className="text-[10px] text-[#00c9a7]">(Hiring)</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#e0faf5]">
              Logistics Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href={ROUTES.SERVICES} className="hover:text-[#00e5c0] transition-colors">
                  Ocean Container (FCL/LCL)
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SERVICES} className="hover:text-[#00e5c0] transition-colors">
                  Air Cargo Express & Charters
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SERVICES} className="hover:text-[#00e5c0] transition-colors">
                  Overland Drayage & Rail
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SERVICES} className="hover:text-[#00e5c0] transition-colors">
                  Customs Clearance & Brokerage
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools & Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#e0faf5]">
              Platform & Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href={ROUTES.QUOTE} className="hover:text-[#00e5c0] transition-colors flex items-center gap-1">
                  <span>Rate Calculator</span>
                  <ArrowUpRight size={11} className="text-[#00c9a7]" />
                </Link>
              </li>
              <li>
                <Link href={ROUTES.SHIPMENTS} className="hover:text-[#00e5c0] transition-colors">
                  Freigeht Shipments Explorer
                </Link>
              </li>
              <li>
                <Link href={ROUTES.DASHBOARD} className="hover:text-[#00e5c0] transition-colors font-semibold text-[#00e5c0]">
                  Logistics Dashboard
                </Link>
              </li>
              <li>
                <Link href={ROUTES.LOGIN} className="hover:text-[#00e5c0] transition-colors">
                  Customer Portal Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#1a4a4a]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#3a6b66]">
          <p>© {new Date().getFullYear()} FreightAgent Technologies Inc. All international rights reserved.</p>

          <div className="flex items-center gap-6">
            <span className="hover:text-[#7ecfc4] cursor-pointer transition-colors">FIATA / IATA Accredited</span>
            <span className="hover:text-[#7ecfc4] cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-[#7ecfc4] cursor-pointer transition-colors">Terms of Carriage</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
