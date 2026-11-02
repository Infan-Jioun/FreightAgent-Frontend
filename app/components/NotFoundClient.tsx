"use client";

import { useState, useEffect, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Radar,
  Radio,
  Home,
  LayoutDashboard,
  Search,
  ArrowRight,
  ShieldAlert,
  RotateCw,
  FileText,
  LifeBuoy,
  Globe,
  Anchor,
  Menu,
  X,
} from "lucide-react";
import { ROUTES } from "@/app/constants/routes";

// Dynamic import for WebGL 3D Canvas to guarantee SSR safety and fast hydration
const NotFound3DScene = dynamic(() => import("./NotFound3DScene"), {
  ssr: false,
  loading: () => <SceneLoadingHologram />,
});

/**
 * High-tech holographic wireframe fallback during canvas initialization
 */
function SceneLoadingHologram() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center pointer-events-none select-none px-4">
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
        {/* Pulsing radar rings */}
        <div className="absolute inset-0 rounded-full border border-[#00c9a7]/20 animate-ping" />
        <div className="absolute inset-3 sm:inset-4 rounded-full border border-dashed border-[#00c9a7]/30 animate-spin" />
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] flex items-center justify-center shadow-lg shadow-[#00c9a7]/10">
          <Radar size={26} className="text-[#00c9a7] animate-pulse" />
        </div>
      </div>
      <p className="mt-4 font-mono text-[10px] sm:text-[11px] tracking-widest text-[#7ecfc4]/70 uppercase text-center">
        INITIALIZING 3D SPATIAL RADAR...
      </p>
    </div>
  );
}

export function NotFoundClient() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [trackingQuery, setTrackingQuery] = useState("");
  const [coords, setCoords] = useState({ lat: "40°44'55\"N", lon: "73°59'11\"W" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Subtle coordinate jitter to emulate a live searching deep-ocean / space telemetry transponder
  useEffect(() => {
    const interval = setInterval(() => {
      const latSeconds = (40 + Math.random() * 15).toFixed(1);
      const lonSeconds = (10 + Math.random() * 20).toFixed(1);
      setCoords({
        lat: `40°44'${latSeconds}"N`,
        lon: `73°59'${lonSeconds}"W`,
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTransmitPing = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanMessage("TRANSMITTING HIGH-FREQUENCY SONAR PING ACROSS SECTOR 404...");

    setTimeout(() => {
      setScanMessage("SCAN COMPLETE: 0 TRANSPONDERS DETECTED // SECTOR UNCHARTED");
    }, 1800);

    setTimeout(() => {
      setIsScanning(false);
      setTimeout(() => setScanMessage(null), 3500);
    }, 2800);
  };

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = trackingQuery.trim();
    if (!cleanId) return;
    startTransition(() => {
      router.push(ROUTES.TRACKING(cleanId));
    });
  };

  return (
    <main
      className="relative min-h-screen min-h-dvh w-full overflow-x-hidden bg-[#0a0f0f] text-[#e0faf5] flex flex-col justify-between select-none"
      style={{
        background: "radial-gradient(ellipse at 50% 30%, #0d2525 0%, #081515 50%, #050a0a 100%)",
      }}
    >
      {/* ──────────────────────────────────────────────────────────────────
       * Ambient Precision Grid Backdrop
       * ────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#00c9a7 1px, transparent 1px), linear-gradient(90deg, #00c9a7 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Atmospheric center glow flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[550px] h-[220px] sm:h-[350px] rounded-full bg-[#00c9a7]/10 blur-[100px] sm:blur-[130px] pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-[240px] sm:w-[350px] h-[180px] sm:h-[250px] rounded-full bg-[#00b4d8]/10 blur-[90px] sm:blur-[110px] pointer-events-none" />

      {/* Visual Sonar Wave Ripple on Scan */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ scale: 0.2, opacity: 0.8 }}
            animate={{ scale: 2.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full border-2 border-[#00e5c0] pointer-events-none z-10"
          />
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────────────
       * Top Telemetry Status Header (Navbar-Grade Pill & Brand Logo)
       * ────────────────────────────────────────────────────────────────── */}
      <header className="relative z-30 w-full px-3 sm:px-6 pt-3 sm:pt-4 pointer-events-none">
        <nav
          className="pointer-events-auto mx-auto max-w-[1240px] flex items-center justify-between gap-2 sm:gap-4 px-3.5 sm:px-5 py-2.5 sm:py-3 transition-all duration-300 relative overflow-visible rounded-2xl border border-[#1a4a4a]/60 bg-[#0a0f0f]/85 backdrop-blur-xl shadow-xl shadow-black/40"
          style={{
            borderColor: "rgba(26, 74, 74, 0.6)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 201, 167, 0.08)",
          }}
        >
          {/* Glowing border scan line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden opacity-50 pointer-events-none rounded-t-2xl">
            <motion.div
              className="w-full h-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--accent-primary, #00c9a7), var(--accent-blue, #00b4d8), transparent)",
              }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Left: Brand Logo & Sector Status Badge */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Brand Logo - 1:1 parity with Navbar.tsx */}
            <Link href={ROUTES.HOME} className="flex shrink-0 items-center gap-2 sm:gap-2.5 group">
              <motion.div
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl relative shadow-md shadow-[#00c9a7]/20"
                style={{ background: "var(--gradient-brand, linear-gradient(135deg, #00c9a7, #00b4d8))" }}
                whileHover={{ rotate: 12, scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Anchor className="h-3.5 w-3.5 sm:h-4 sm:w-4 relative z-10 text-[#0a0f0f]" />
              </motion.div>
              <div className="flex flex-col">
                <span className="whitespace-nowrap text-xs sm:text-base font-black tracking-tight text-[#e0faf5] group-hover:text-[#00e5c0] transition-colors">
                  Freight<span className="text-[#00c9a7]">Agent</span>
                </span>
                <span className="text-[8px] sm:text-[9px] font-mono tracking-widest uppercase text-[#3a6b66] -mt-0.5 sm:-mt-1 hidden xs:block">
                  Autonomous Logistics
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline text-[#1a4a4a]">/</span>

            {/* Error Telemetry Badge */}
            <div className="hidden xs:inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 text-[#ff6b6b] text-[10px] sm:text-[11px] font-mono whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b6b] animate-ping shrink-0" />
              <span className="hidden md:inline">STATUS: 404_COORDINATE_DESYNC</span>
              <span className="md:hidden">404_DESYNC</span>
            </div>
          </div>

          {/* Center: Desktop Navigation Quick Links */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-mono text-[#7ecfc4]/80">
            <Link
              href={ROUTES.HOME}
              className="px-2.5 xl:px-3 py-1.5 rounded-lg hover:text-[#00c9a7] hover:bg-[#112a2a]/60 transition-colors"
            >
              Fleet Command
            </Link>
            <Link
              href={ROUTES.QUOTE}
              className="px-2.5 xl:px-3 py-1.5 rounded-lg hover:text-[#00c9a7] hover:bg-[#112a2a]/60 transition-colors"
            >
              Quote Engine
            </Link>
            <Link
              href={ROUTES.SERVICES}
              className="px-2.5 xl:px-3 py-1.5 rounded-lg hover:text-[#00c9a7] hover:bg-[#112a2a]/60 transition-colors"
            >
              Corridors
            </Link>
            <Link
              href={ROUTES.CONTACT}
              className="px-2.5 xl:px-3 py-1.5 rounded-lg hover:text-[#00c9a7] hover:bg-[#112a2a]/60 transition-colors"
            >
              24/7 Desk
            </Link>
          </div>

          {/* Right: Coordinates & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Telemetry Coordinates */}
            <div className="flex items-center gap-1.5 bg-[#0d1f1f]/80 px-2 sm:px-3 py-1 rounded-lg border border-[#1a4a4a] text-[10px] sm:text-[11px] font-mono text-[#7ecfc4]">
              <Compass size={12} className="text-[#00b4d8] shrink-0" />
              <span className="hidden sm:inline">{coords.lat}</span>
              <span className="hidden sm:inline text-[#3a6b66]">|</span>
              <span>{coords.lon}</span>
            </div>

            {/* Mobile Navigation Drawer Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg bg-[#0d1f1f] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#00c9a7] transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Drawer Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto mx-auto max-w-[1240px] mt-2 p-3.5 sm:p-4 rounded-2xl border border-[#1a4a4a] bg-[#0a0f0f]/95 backdrop-blur-2xl shadow-2xl flex flex-col gap-3 lg:hidden"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#1a4a4a]/60 text-xs font-mono text-[#7ecfc4]">
                <span>EMERGENCY ROUTING MENU</span>
                <span className="text-[10px] text-[#ff6b6b] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b6b] animate-ping" />
                  DESYNC ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <Link
                  href={ROUTES.HOME}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a]/70 hover:border-[#00c9a7] text-[#e0faf5] transition-colors"
                >
                  <Home size={14} className="text-[#00c9a7]" />
                  <span>Fleet Command</span>
                </Link>
                <Link
                  href={ROUTES.DASHBOARD}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a]/70 hover:border-[#00c9a7] text-[#e0faf5] transition-colors"
                >
                  <LayoutDashboard size={14} className="text-[#00c9a7]" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href={ROUTES.QUOTE}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a]/70 hover:border-[#00c9a7] text-[#e0faf5] transition-colors"
                >
                  <FileText size={14} className="text-[#00c9a7]" />
                  <span>Instant Quote</span>
                </Link>
                <Link
                  href={ROUTES.CONTACT}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a]/70 hover:border-[#00c9a7] text-[#e0faf5] transition-colors"
                >
                  <LifeBuoy size={14} className="text-[#00c9a7]" />
                  <span>24/7 Dispatch</span>
                </Link>
              </div>

              {/* Transmit Ping Button directly in Mobile Menu */}
              <button
                type="button"
                onClick={() => {
                  handleTransmitPing();
                  setMobileMenuOpen(false);
                }}
                disabled={isScanning}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0d1f1f] hover:bg-[#112a2a] border border-[#00c9a7]/40 text-[#00c9a7] text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCw size={13} className={isScanning ? "animate-spin" : ""} />
                <span>{isScanning ? "TRANSMITTING PING..." : "TRANSMIT SONAR PING"}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ──────────────────────────────────────────────────────────────────
       * Main Body: 3D Canvas Centerpiece + Cinematic HUD Overlay
       * ────────────────────────────────────────────────────────────────── */}
      <section className="relative z-10 grow flex flex-col items-center justify-center px-4 py-8 sm:py-12 md:py-16 w-full">
        {/* Fullscreen 3D Scene Viewport */}
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          <NotFound3DScene isScanning={isScanning} />
        </div>

        {/* Cinematic Vignette Overlay to ensure text legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(10,15,15,0.4) 0%, rgba(10,15,15,0.75) 60%, rgba(10,15,15,0.95) 100%)",
          }}
        />

        {/* ────────────────────────────────────────────────────────────────
         * Left Floating Telemetry HUD Card (Desktop xl+)
         * ──────────────────────────────────────────────────────────────── */}
        <div className="hidden xl:flex flex-col gap-3 absolute left-8 top-1/2 -translate-y-1/2 w-72 pointer-events-auto">
          <div className="p-4 rounded-2xl bg-[#0d1f1f]/75 border border-[#1a4a4a] backdrop-blur-xl shadow-xl shadow-black/40">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1a4a4a]/60">
              <span className="text-[10px] font-mono tracking-wider text-[#7ecfc4] uppercase">
                CARRIER TELEMETRY
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-[#ff6b6b] shadow-[0_0_6px_#ff6b6b]" />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#3a6b66]">CONTAINER:</span>
                <span className="text-[#e0faf5] font-semibold">FAZU-404-LOST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3a6b66]">PING TIMEOUT:</span>
                <span className="text-[#ff6b6b]">404 ms (100% LOSS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3a6b66]">EST. DRIFT:</span>
                <span className="text-[#00e5c0]">+12.4 nm UNCHARTED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#3a6b66]">RADAR LOCK:</span>
                <span className="text-[#7ecfc4]">TRANSPONDER SILENT</span>
              </div>
            </div>
          </div>

          {/* Interactive Ping Button in HUD */}
          <button
            type="button"
            onClick={handleTransmitPing}
            disabled={isScanning}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0a1a1a]/90 hover:bg-[#112a2a] border border-[#00c9a7]/40 hover:border-[#00c9a7] text-[#00c9a7] hover:text-[#00e5c0] text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00c9a7]/10 disabled:opacity-50"
          >
            <RotateCw size={13} className={isScanning ? "animate-spin" : ""} />
            <span>{isScanning ? "TRANSMITTING PING..." : "TRANSMIT SONAR PING"}</span>
          </button>
        </div>

        {/* ────────────────────────────────────────────────────────────────
         * Right Floating Quick Directory HUD Card (Desktop xl+)
         * ──────────────────────────────────────────────────────────────── */}
        <div className="hidden xl:flex flex-col gap-3 absolute right-8 top-1/2 -translate-y-1/2 w-72 pointer-events-auto">
          <div className="p-4 rounded-2xl bg-[#0d1f1f]/75 border border-[#1a4a4a] backdrop-blur-xl shadow-xl shadow-black/40">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1a4a4a]/60">
              <span className="text-[10px] font-mono tracking-wider text-[#7ecfc4] uppercase">
                RECOVERY WAYPOINTS
              </span>
              <Globe size={13} className="text-[#00c9a7]" />
            </div>

            <nav className="flex flex-col gap-1.5 text-xs">
              <Link
                href={ROUTES.HOME}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#112a2a] text-[#e0faf5] hover:text-[#00c9a7] transition-colors"
              >
                <span>Fleet Command</span>
                <ArrowRight size={12} className="text-[#3a6b66]" />
              </Link>
              <Link
                href={ROUTES.QUOTE}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#112a2a] text-[#e0faf5] hover:text-[#00c9a7] transition-colors"
              >
                <span>Instant Freight Quote</span>
                <ArrowRight size={12} className="text-[#3a6b66]" />
              </Link>
              <Link
                href={ROUTES.SERVICES}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#112a2a] text-[#e0faf5] hover:text-[#00c9a7] transition-colors"
              >
                <span>Maritime & Air Corridors</span>
                <ArrowRight size={12} className="text-[#3a6b66]" />
              </Link>
              <Link
                href={ROUTES.ABOUT}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#112a2a] text-[#e0faf5] hover:text-[#00c9a7] transition-colors"
              >
                <span>Port Terminal Network</span>
                <ArrowRight size={12} className="text-[#3a6b66]" />
              </Link>
              <Link
                href={ROUTES.CONTACT}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#112a2a] text-[#e0faf5] hover:text-[#00c9a7] transition-colors"
              >
                <span>24/7 Operations Desk</span>
                <ArrowRight size={12} className="text-[#3a6b66]" />
              </Link>
            </nav>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────────
         * Center Hero Cinematic Content Card
         * ──────────────────────────────────────────────────────────────── */}
        <div className="relative z-20 max-w-2xl mx-auto text-center flex flex-col items-center w-full px-2 sm:px-0">
          {/* Top Pill Alert */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-[#0d1f1f]/80 border border-[#00c9a7]/30 text-[10px] sm:text-xs font-mono text-[#00e5c0] mb-3 sm:mb-4 shadow-lg shadow-black/50 text-center max-w-full"
          >
            <ShieldAlert size={14} className="text-[#00c9a7] animate-pulse shrink-0" />
            <span className="truncate max-w-[260px] sm:max-w-none">
              WAYPOINT SECTOR UNCHARTED // TELEMETRY LOST
            </span>
          </motion.div>

          {/* Giant Holographic Glowing 404 Headline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative"
          >
            <h1
              className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight select-none bg-linear-to-r from-[#00c9a7] via-[#00e5c0] to-[#00b4d8] text-transparent bg-clip-text drop-shadow-[0_0_40px_rgba(0,201,167,0.35)] leading-none"
              style={{ fontFamily: "monospace" }}
            >
              404
            </h1>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.4em] font-mono text-[#7ecfc4]/70 uppercase whitespace-nowrap">
              [ MANIFEST NOT FOUND ]
            </span>
          </motion.div>

          {/* Narrative Freight Explanation */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xs sm:text-sm md:text-base text-[#7ecfc4] max-w-lg mt-5 sm:mt-6 mb-6 sm:mb-8 leading-relaxed font-normal px-2"
          >
            The cargo manifest, vessel route, or waypoint sector you requested does
            not exist in the global telemetry grid, or has drifted outside chartered
            shipping corridors.
          </motion.p>

          {/* Live Scan Status Feedback Notice */}
          <AnimatePresence>
            {scanMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full max-w-md mb-5 p-2.5 rounded-xl bg-[#0a1a1a]/90 border border-[#00c9a7]/40 text-xs font-mono text-[#00e5c0] text-center shadow-lg"
              >
                {scanMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Reroute Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-md mb-6 sm:mb-8 px-2 sm:px-0"
          >
            <Link
              href={ROUTES.HOME}
              className="w-full sm:w-auto grow px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-[#00c9a7] hover:bg-[#00e5c0] text-[#050a0a] text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#00c9a7]/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Home size={15} />
              <span>RETURN TO FLEET COMMAND</span>
            </Link>

            <Link
              href={ROUTES.DASHBOARD}
              className="w-full sm:w-auto grow px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-[#0d1f1f] hover:bg-[#112a2a] border border-[#1a4a4a] hover:border-[#00c9a7] text-[#e0faf5] text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <LayoutDashboard size={15} className="text-[#00c9a7]" />
              <span>VIEW DASHBOARD</span>
            </Link>
          </motion.div>

          {/* Emergency Shipment Lookup Bar */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="w-full max-w-md px-2 sm:px-0"
          >
            <form
              onSubmit={handleTrackSubmit}
              className="relative flex items-center w-full rounded-xl bg-[#0a1a1a]/80 border border-[#1a4a4a] focus-within:border-[#00c9a7] focus-within:ring-1 focus-within:ring-[#00c9a7]/30 transition-all p-1"
            >
              <Search size={15} className="ml-3 text-[#3a6b66] shrink-0" />
              <input
                type="text"
                value={trackingQuery}
                onChange={(e) => setTrackingQuery(e.target.value)}
                placeholder="Track ID (e.g. FA-482913)..."
                className="w-full bg-transparent px-3 py-2 text-xs text-[#e0faf5] placeholder-[#3a6b66] font-mono outline-hidden"
              />
              <button
                type="submit"
                className="px-3.5 sm:px-4 py-2 rounded-lg bg-[#0d1f1f] hover:bg-[#00c9a7] text-[#00c9a7] hover:text-[#050a0a] text-xs font-mono font-bold transition-all shrink-0 cursor-pointer"
              >
                LOCATE
              </button>
            </form>
            <span className="inline-block mt-2 text-[9px] sm:text-[10px] font-mono text-[#3a6b66] text-center w-full">
              3D RADAR INTERACTIVE · DRAG CONTAINER TO SCAN SECTOR
            </span>
          </motion.div>

          {/* Mobile / Tablet Quick HUD Trigger */}
          <div className="xl:hidden mt-4 w-full max-w-md px-2 sm:px-0">
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0d1f1f]/80 border border-[#1a4a4a] text-xs font-mono">
              <button
                type="button"
                onClick={handleTransmitPing}
                disabled={isScanning}
                className="grow py-2 px-3 rounded-lg bg-[#0a1a1a] hover:bg-[#112a2a] border border-[#00c9a7]/30 text-[#00c9a7] text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RotateCw size={12} className={isScanning ? "animate-spin" : ""} />
                <span>{isScanning ? "SCANNING..." : "TRANSMIT PING"}</span>
              </button>
              <div className="text-[10px] text-[#7ecfc4]/70 px-2 py-1 rounded bg-[#0a0f0f] border border-[#1a4a4a]/60">
                FAZU-404-LOST
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
       * Bottom Telemetry Footer & Quick Emergency Help
       * ────────────────────────────────────────────────────────────────── */}
      <footer className="relative z-20 w-full px-4 sm:px-8 py-3.5 sm:py-4 border-t border-[#1a4a4a]/40 bg-[#0a0f0f]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-[10px] sm:text-[11px] font-mono text-[#7ecfc4]/70 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c9a7] shrink-0" />
            <span>GLOBAL FREIGHT INTELLIGENCE NETWORK // v2.6.4</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            <Link
              href={ROUTES.QUOTE}
              className="hover:text-[#00c9a7] transition-colors flex items-center gap-1.5"
            >
              <FileText size={12} />
              <span>Get Quote</span>
            </Link>
            <Link
              href={ROUTES.CONTACT}
              className="hover:text-[#00c9a7] transition-colors flex items-center gap-1.5"
            >
              <LifeBuoy size={12} />
              <span>Dispatch Helpdesk</span>
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default NotFoundClient;
