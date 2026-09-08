"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import {
  Anchor,
  Menu,
  ArrowRight,
  LayoutDashboard,
  Home,
  Info,
  Layers,
  Package,
  Calculator,
  PhoneCall,
  User as UserIcon,
  LogOut,
  Settings,
  ChevronDown,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/app/constants/routes";
import { useAuthStore } from "@/app/store/authStore";
import { authService } from "@/app/services/auth.service";
import { gsap } from "@/app/lib/gsap";
import { toast } from "sonner";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home, subtitle: "Autonomous freight" },
  { label: "About", href: "/about", icon: Info, subtitle: "Global presence & vision" },
  { label: "Services", href: "/services", icon: Layers, subtitle: "Ocean, air & ground" },
  { label: "All Shipments", href: "/shipments", icon: Package, subtitle: "Live cargo telemetry" },
  { label: "Quote", href: "/quote", icon: Calculator, subtitle: "Instant rate calculator" },
  { label: "Contact", href: "/contact", icon: PhoneCall, subtitle: "24/7 Dispatch desk" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, setUser, clearUser } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Scroll progress for the thin indicator
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  // Handle scroll detection for navbar styling
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // GSAP entrance animation on mount
  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }
      );
    }
  }, []);

  // Active session check on mount across all pages
  useEffect(() => {
    let cancelled = false;
    const verifySession = async () => {
      try {
        const res = await authService.getMe();
        if (!cancelled && res?.data) {
          setUser(res.data);
        }
      } catch {
        if (!cancelled) {
          clearUser();
        }
      }
    };
    verifySession();
    return () => {
      cancelled = true;
    };
  }, [setUser, clearUser]);

  // Click outside to close avatar dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    try {
      await authService.logout();
    } catch {
      // Continue client cleanup even if request fails
    } finally {
      clearUser();
      localStorage.removeItem("auth-storage");
      toast.success("Logged out successfully");
      router.push(ROUTES.LOGIN);
    }
  };

  const displayName = user?.name || "Member";
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-[60] px-3 sm:px-4 pt-3 md:pt-4 pointer-events-none"
    >
      <nav
        className="pointer-events-auto mx-auto max-w-[1240px] flex items-center justify-between gap-2 px-3.5 sm:px-5 py-2 transition-all duration-300 relative overflow-visible rounded-2xl border"
        style={{
          height: scrolled ? "60px" : "66px",
          background: scrolled
            ? "rgba(10, 15, 15, 0.92)"
            : "rgba(10, 15, 15, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderColor: scrolled
            ? "rgba(0, 201, 167, 0.35)"
            : "rgba(26, 74, 74, 0.5)",
          boxShadow: scrolled
            ? "0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 201, 167, 0.1)"
            : "0 6px 24px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Glowing border scan line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden opacity-50 pointer-events-none rounded-t-2xl">
          <motion.div
            className="w-full h-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--accent-primary), var(--accent-blue), transparent)",
            }}
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {/* Brand Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
          <motion.div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl relative shadow-md shadow-[#00c9a7]/20"
            style={{ background: "var(--gradient-brand)" }}
            whileHover={{ rotate: 12, scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Anchor className="h-4 w-4 relative z-10 text-[#0a0f0f]" />
          </motion.div>
          <div className="flex flex-col">
            <span className="whitespace-nowrap text-sm sm:text-base font-black tracking-tight text-[#e0faf5]">
              Freight<span className="text-[#00c9a7]">Agent</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest uppercase text-[#3a6b66] -mt-1 hidden sm:block">
              Autonomous Logistics
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 flex-1 justify-center min-w-0 px-2">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <div
                key={link.label}
                className="relative px-2.5 xl:px-3 py-1.5"
                onMouseEnter={() => setHoveredLink(link.label)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <Link
                  href={link.href}
                  className={`text-xs xl:text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? "text-[#00e5c0] font-semibold"
                      : "text-[#7ecfc4]/80 hover:text-[#e0faf5]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="navActiveDot"
                      className="w-1.5 h-1.5 rounded-full bg-[#00c9a7] shadow-[0_0_8px_#00c9a7]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  {link.label}
                </Link>

                {/* Animated active/hover underline */}
                {(isActive || hoveredLink === link.label) && (
                  <motion.div
                    layoutId="navUnderline"
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-[#00c9a7] to-[#00b4d8]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Micro Tooltip */}
                <AnimatePresence>
                  {hoveredLink === link.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap pointer-events-none z-50 bg-[#0d1f1f] border border-[#1a4a4a] text-[#7ecfc4] shadow-xl"
                    >
                      {link.subtitle}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Right CTA Actions: Conditional on Auth Session */}
        <div className="hidden lg:flex shrink-0 items-center gap-3">
          {isAuthenticated && user ? (
            /* User is LOGGED IN: Show Dashboard Button & Avatar Dropdown */
            <div className="flex items-center gap-2.5">
              <Link
                href={ROUTES.DASHBOARD}
                className="whitespace-nowrap text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all border border-[#00c9a7]/50 bg-[#00c9a7]/10 text-[#00e5c0] hover:bg-[#00c9a7]/20 shadow-sm"
              >
                <LayoutDashboard size={14} className="text-[#00c9a7]" />
                <span>Dashboard</span>
                <span className="w-2 h-2 rounded-full bg-[#00e5c0] animate-pulse" />
              </Link>

              {/* Avatar Dropdown Trigger */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a] hover:border-[#00c9a7]/60 transition-all text-xs text-[#e0faf5]"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-black flex items-center justify-center text-xs shadow-md">
                    {userInitials}
                  </div>
                  <span className="max-w-[80px] truncate text-xs font-bold text-[#e0faf5]">
                    {displayName}
                  </span>
                  <ChevronDown
                    size={13}
                    className={`text-[#7ecfc4] transition-transform duration-200 ${
                      userDropdownOpen ? "rotate-180 text-[#00e5c0]" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] p-2 shadow-2xl z-50 overflow-hidden"
                    >
                      {/* User Header */}
                      <div className="p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a]/60 mb-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#e0faf5] truncate block">
                            {user.name}
                          </span>
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30">
                            {user.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#7ecfc4]/70 truncate block">
                          {user.email}
                        </span>
                      </div>

                      {/* Dropdown Links */}
                      <div className="space-y-1 text-xs">
                        <Link
                          href={ROUTES.DASHBOARD}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#7ecfc4] hover:text-[#00e5c0] hover:bg-[#112a2a] transition-colors"
                        >
                          <LayoutDashboard size={14} className="text-[#00c9a7]" />
                          <span>Fleet Dashboard</span>
                        </Link>

                        <Link
                          href={ROUTES.PROFILE}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#7ecfc4] hover:text-[#00e5c0] hover:bg-[#112a2a] transition-colors"
                        >
                          <UserIcon size={14} className="text-[#00c9a7]" />
                          <span>My Profile</span>
                        </Link>

                        <Link
                          href={ROUTES.SHIPMENTS}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#7ecfc4] hover:text-[#00e5c0] hover:bg-[#112a2a] transition-colors"
                        >
                          <Package size={14} className="text-[#00c9a7]" />
                          <span>Active Shipments</span>
                        </Link>

                        <Link
                          href={ROUTES.SETTINGS}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#7ecfc4] hover:text-[#00e5c0] hover:bg-[#112a2a] transition-colors"
                        >
                          <Settings size={14} className="text-[#00c9a7]" />
                          <span>Account Settings</span>
                        </Link>
                      </div>

                      {/* Divider & Sign Out */}
                      <div className="pt-2 mt-1 border-t border-[#1a4a4a]">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* User is NOT logged in: Show Sign In & Get Started only (NO Dashboard) */
            <div className="flex items-center gap-2">
              <Link
                href={ROUTES.LOGIN}
                className="whitespace-nowrap text-xs font-semibold text-[#7ecfc4] hover:text-[#e0faf5] px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href={ROUTES.REGISTER}
                className="whitespace-nowrap text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all text-[#0a0f0f] shadow-md shadow-[#00c9a7]/20 hover:opacity-95 hover:scale-105"
                style={{ background: "var(--gradient-brand)" }}
              >
                <span>Get Started</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile / Tablet Menu Trigger */}
        <div className="lg:hidden flex shrink-0 items-center gap-2 pointer-events-auto">
          {isAuthenticated && user && (
            <Link
              href={ROUTES.DASHBOARD}
              className="p-2 rounded-xl border border-[#00c9a7]/40 bg-[#00c9a7]/10 text-[#00e5c0] hover:bg-[#00c9a7]/20 transition-all"
              title="Go to Dashboard"
            >
              <LayoutDashboard size={16} />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#00c9a7]/50 bg-[#0d1f1f] hover:bg-[#112a2a] text-[#00e5c0] transition-all cursor-pointer shadow-sm group"
          >
            <div className="w-4 h-3.5 flex flex-col justify-between items-center">
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 5.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-[2px] bg-[#00e5c0] rounded-full origin-center"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="w-4 h-[2px] bg-[#00e5c0] rounded-full"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-[2px] bg-[#00e5c0] rounded-full origin-center"
              />
            </div>
          
          </button>
        </div>

        {/* Scroll Progress line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] z-50 origin-left"
          style={{
            scaleX,
            background: "linear-gradient(90deg, #00c9a7, #00e5c0, #00b4d8)",
          }}
        />
      </nav>

      {/* Mobile Navigation Drawer with Pure Framer Motion via Portal to document.body */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <div className="fixed inset-0 z-[99999] lg:hidden flex">
                {/* Full Screen Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 bg-[#0a0f0f]/80 backdrop-blur-md"
                  onClick={() => setMobileMenuOpen(false)}
                />

                {/* Drawer Container */}
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  className="relative ml-auto w-full sm:w-[380px] max-w-[85vw] h-full bg-[#0d1f1f] border-l border-[#1a4a4a] shadow-2xl z-10 flex flex-col justify-between p-5 sm:p-6 overflow-y-auto"
                >
                  {/* Glowing vertical scanline on the left border */}
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#00c9a7] via-[#00e5c0]/60 to-transparent pointer-events-none" />

                  {/* Ambient radial glow */}
                  <div className="absolute top-12 right-0 w-64 h-64 bg-[#00c9a7]/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 space-y-4">
                    {/* Drawer Header with Close (X) button */}
                    <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#1a4a4a]">
                      <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2.5"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] shadow-md shadow-[#00c9a7]/20">
                          <Anchor size={16} />
                        </div>
                        <div>
                          <span className="font-black text-sm tracking-tight text-[#e0faf5]">
                            Freight<span className="text-[#00c9a7]">Agent</span>
                          </span>
                          <span className="block text-[9px] font-mono text-[#3a6b66]">
                            Global Telemetry
                          </span>
                        </div>
                      </Link>

                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2 rounded-xl border border-[#1a4a4a] bg-[#0a1a1a] text-[#7ecfc4] hover:text-[#e0faf5] hover:border-[#00c9a7] transition-all cursor-pointer"
                        aria-label="Close menu"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Live Fleet Telemetry Ribbon */}
                    <div className="px-3 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a]/80 flex items-center justify-between text-[10px] font-mono text-[#7ecfc4]">
                      <span className="flex items-center gap-1.5 text-[#00e5c0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#00e5c0] animate-ping" />
                        Fleet Grid Active
                      </span>
                      <span className="text-[#3a6b66]">140+ Nodes</span>
                    </div>

                    {/* User Card if Authenticated */}
                    {isAuthenticated && user && (
                      <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-black text-xs flex items-center justify-center flex-shrink-0">
                            {userInitials}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-[#e0faf5] truncate block">
                              {user.name}
                            </span>
                            <span className="text-[10px] text-[#3a6b66] truncate block">
                              {user.email}
                            </span>
                          </div>
                        </div>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30">
                          {user.role}
                        </span>
                      </div>
                    )}

                    {/* Navigation Links - Clear & Prominent */}
                    <div className="flex flex-col gap-2 pt-1">
                      {NAV_LINKS.map((link, idx) => {
                        const isActive =
                          link.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(link.href);
                        const IconComponent = link.icon;

                        return (
                          <motion.div
                            key={link.label}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 350,
                              damping: 26,
                              delay: idx * 0.04,
                            }}
                          >
                            <Link
                              href={link.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`flex items-center justify-between p-3 rounded-2xl border transition-all group ${
                                isActive
                                  ? "bg-[#00c9a7]/15 border-[#00c9a7] text-[#00e5c0] shadow-md shadow-[#00c9a7]/10"
                                  : "bg-[#0a1a1a] border-[#1a4a4a]/70 text-[#7ecfc4] hover:bg-[#112a2a] hover:border-[#00c9a7]/40 hover:text-[#e0faf5]"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                                    isActive
                                      ? "bg-[#00c9a7] text-[#0a0f0f] shadow-sm shadow-[#00c9a7]/30"
                                      : "bg-[#112a2a] text-[#00c9a7] border border-[#1a4a4a]"
                                  }`}
                                >
                                  <IconComponent size={16} />
                                </div>
                                <div>
                                  <span className="text-sm font-bold block text-[#e0faf5]">
                                    {link.label}
                                  </span>
                                  <span className="text-[11px] text-[#7ecfc4]/70">
                                    {link.subtitle}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isActive && (
                                  <span className="w-2 h-2 rounded-full bg-[#00e5c0] animate-pulse" />
                                )}
                                <ArrowRight size={14} className="text-[#3a6b66] group-hover:text-[#00c9a7] group-hover:translate-x-0.5 transition-all" />
                              </div>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Bottom Actions: Authenticated vs Guest */}
                  <div className="flex flex-col gap-2.5 pt-5 border-t border-[#1a4a4a] mt-4 relative z-10">
                    {isAuthenticated && user ? (
                      <>
                        <Link
                          href={ROUTES.DASHBOARD}
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#00c9a7]/20"
                        >
                          <LayoutDashboard size={15} />
                          <span>Open Fleet Dashboard</span>
                        </Link>

                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={ROUTES.LOGIN}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-center py-2.5 rounded-xl text-xs font-semibold border border-[#1a4a4a] bg-[#0a1a1a] text-[#7ecfc4] hover:text-[#e0faf5] transition-colors"
                        >
                          Sign In
                        </Link>
                        <Link
                          href={ROUTES.REGISTER}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-center py-2.5 rounded-xl text-xs font-bold border border-[#00c9a7]/40 bg-[#00c9a7]/15 text-[#00e5c0] hover:bg-[#00c9a7]/25 transition-colors"
                        >
                          Register
                        </Link>
                      </div>
                    )}

                    <p className="text-center text-[10px] text-[#3a6b66] pt-1">
                      24/7 Operations Desk: <span className="text-[#00c9a7]">+1 (800) 458-9921</span>
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}

export default Navbar;