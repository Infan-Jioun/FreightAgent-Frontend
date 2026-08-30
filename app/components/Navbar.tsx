"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { Anchor, Menu, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/app/constants/routes";

const NAV_LINKS = [
  { label: "Platform", href: "#platform", subtitle: "Freight intelligence" },
  { label: "Tracking", href: "#live-tracking", subtitle: "Live shipment visibility" },
  { label: "Global Network", href: "#global-network", subtitle: "Worldwide routes" },
  { label: "AI Logistics", href: "#ai-command-center", subtitle: "AI-powered operations" },
  { label: "Pricing", href: "#pricing", subtitle: "Plans for every operation" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("#platform");
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll progress for the thin indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Handle scroll detection for navbar morphing
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Intersection Observer for active sections
  useEffect(() => {
    const sectionIds = NAV_LINKS.map((link) => link.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(`#${id}`);
            }
          });
        },
        { threshold: 0.3, rootMargin: "-80px 0px -40% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-[60] px-4 pt-4 md:pt-6 pointer-events-none"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.nav
        className="pointer-events-auto mx-auto max-w-[1200px] flex items-center justify-between px-4 md:px-5 py-3 transition-all duration-400 relative overflow-hidden"
        style={{
          borderRadius: "18px",
          height: scrolled ? "64px" : "72px",
          background: scrolled
            ? "rgba(10, 15, 15, 0.75)"
            : "rgba(10, 15, 15, 0.45)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: scrolled
            ? "1px solid rgba(26, 74, 74, 0.7)"
            : "1px solid rgba(26, 74, 74, 0.35)",
          boxShadow: scrolled
            ? "0 10px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(0, 201, 167, 0.1)"
            : "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
        animate={{
          width: scrolled ? "92%" : "100%",
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Subtle Freight Network Pulse Line inside top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden opacity-40 pointer-events-none">
          <motion.div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
            }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-xl relative"
            style={{ background: "var(--gradient-brand)" }}
            whileHover={{ rotate: 10, scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                boxShadow: "0 0 15px rgba(0, 201, 167, 0.4)",
              }}
            />
            <Anchor className="h-4 w-4 relative z-10" style={{ color: "#0a0f0f" }} />
          </motion.div>
          <span
            className="text-base md:text-lg font-bold tracking-wider"
            style={{ color: "var(--text-primary)" }}
          >
            Freight<span style={{ color: "var(--accent-primary)" }}>Agent</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 relative">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <div
                key={link.label}
                className="relative px-3 py-1.5"
                onMouseEnter={() => setHoveredLink(link.label)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <a
                  href={link.href}
                  className="text-sm font-medium transition-colors duration-200 flex items-center gap-1.5"
                  style={{
                    color: isActive || hoveredLink === link.label ? "var(--text-primary)" : "var(--text-secondary)",
                    opacity: isActive ? 1 : 0.75,
                  }}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeDot"
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--accent-primary)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {link.label}
                </a>

                {/* Animated Underline */}
                {(isActive || hoveredLink === link.label) && (
                  <motion.div
                    layoutId="navbarUnderline"
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                    style={{ background: "var(--accent-primary)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Hover Micro Tooltip */}
                <AnimatePresence>
                  {hoveredLink === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap pointer-events-none z-50 shadow-lg"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {link.subtitle}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href={ROUTES.LOGIN}
            className="text-sm px-3.5 py-2 rounded-lg transition-colors relative group"
            style={{ color: "var(--text-secondary)" }}
          >
            <span className="relative z-10 group-hover:text-[var(--text-primary)] transition-colors">
              Sign In
            </span>
            <span
              className="absolute bottom-1.5 left-3.5 right-3.5 h-[1px] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200"
              style={{ background: "var(--accent-primary)" }}
            />
          </Link>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={ROUTES.REGISTER}
              className="text-sm px-4 py-2 rounded-[10px] font-semibold flex items-center gap-1.5 transition-all group"
              style={{
                background: "var(--gradient-brand)",
                color: "#0a0f0f",
                boxShadow: "0 0 0 rgba(0, 201, 167, 0)",
              }}
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Mobile Trigger */}
        <div className="lg:hidden flex items-center">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="rounded-xl"
                style={{ color: "var(--text-primary)" }}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-[380px] p-6 border-l flex flex-col justify-between"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-primary)",
              }}
            >
              {/* Mobile Control Panel Header */}
              <div>
                <div className="flex items-center justify-between pb-6 border-b" style={{ borderColor: "var(--border-primary)" }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      <Anchor className="h-4 w-4" style={{ color: "#0a0f0f" }} />
                    </div>
                    <span className="font-bold tracking-wider" style={{ color: "var(--text-primary)" }}>
                      Freight<span style={{ color: "var(--accent-primary)" }}>Agent</span>
                    </span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded" style={{ background: "var(--bg-card-hover)", color: "var(--accent-primary)" }}>
                    Control Panel
                  </span>
                </div>

                {/* Mobile Links */}
                <div className="flex flex-col gap-4 mt-8">
                  {NAV_LINKS.map((link, idx) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.25 }}
                    >
                      <SheetClose>
                        <a
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between group py-2"
                        >
                          <span
                            className="text-lg font-medium transition-colors group-hover:text-[var(--accent-primary)]"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {link.label}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {link.subtitle}
                          </span>
                        </a>
                      </SheetClose>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mobile Bottom Actions */}
              <div className="flex flex-col gap-3 pt-6 border-t" style={{ borderColor: "var(--border-primary)" }}>
                <SheetClose>
                  <Link
                    href={ROUTES.LOGIN}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: "var(--text-secondary)", background: "var(--bg-card-hover)" }}
                  >
                    Sign In
                  </Link>
                </SheetClose>
                <SheetClose>
                  <Link
                    href={ROUTES.REGISTER}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-3 rounded-[10px] font-semibold text-sm flex items-center justify-center gap-2"
                    style={{ background: "var(--gradient-brand)", color: "#0a0f0f" }}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Scroll Progress Indicator at bottom edge */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] z-50 origin-left"
          style={{
            scaleX,
            background: "var(--gradient-accent)",
          }}
        />
      </motion.nav>
    </motion.header>
  );
}

export default Navbar;