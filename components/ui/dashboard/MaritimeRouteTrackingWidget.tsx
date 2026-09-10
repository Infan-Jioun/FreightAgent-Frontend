"use client";

import { useState, useEffect } from "react";
import {
    Anchor,
    Compass,
    Navigation,
    Ship,
    Wind,
    Waves,
    Eye,
    Maximize2,
    Minimize2,
    Play,
    Pause,
    Clock,
    AlertCircle,
    CheckCircle2,
    Info,
    ExternalLink,
    Layers,
    RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export interface PortNode {
    id: string;
    name: string;
    code: string;
    country: "Bangladesh" | "China" | "Transit Hub";
    flag: string;
    x: number; // SVG coordinate 0 - 800
    y: number; // SVG coordinate 0 - 450
    status: "ORIGIN" | "DESTINATION" | "TRANSIT" | "FEEDER";
    congestion: "OPTIMAL" | "MODERATE" | "BUSY";
    draft: string;
    berths: number;
    arrivalEstimate?: string;
    details: string;
}

const ALL_CORRIDOR_PORTS: PortNode[] = [
    // ── Bangladesh Ports ──
    {
        id: "bd-cgp",
        name: "Chattogram Port (Chittagong)",
        code: "BD CGP",
        country: "Bangladesh",
        flag: "🇧🇩",
        x: 130,
        y: 110,
        status: "ORIGIN",
        congestion: "MODERATE",
        draft: "10.0m",
        berths: 18,
        details: "Bangladesh's primary maritime gateway handling 92% of export-import container cargo.",
    },
    {
        id: "bd-mat",
        name: "Matarbari Deep Sea Port",
        code: "BD MAT",
        country: "Bangladesh",
        flag: "🇧🇩",
        x: 155,
        y: 135,
        status: "FEEDER",
        congestion: "OPTIMAL",
        draft: "18.5m",
        berths: 4,
        details: "Capesize deep-water hub accommodating 8,000+ TEU mega-vessels directly.",
    },
    {
        id: "bd-mgl",
        name: "Mongla Port (Passur River)",
        code: "BD MGL",
        country: "Bangladesh",
        flag: "🇧🇩",
        x: 100,
        y: 105,
        status: "FEEDER",
        congestion: "OPTIMAL",
        draft: "8.5m",
        berths: 8,
        details: "Strategic southern gateway serving southwestern industrial zones and garment corridors.",
    },
    {
        id: "bd-pay",
        name: "Payra Deep Sea Port",
        code: "BD PAY",
        country: "Bangladesh",
        flag: "🇧🇩",
        x: 115,
        y: 125,
        status: "FEEDER",
        congestion: "OPTIMAL",
        draft: "11.0m",
        berths: 3,
        details: "Rabnabad Channel deep-water terminal with dedicated coal and container berths.",
    },

    // ── Strategic Transit Gateways ──
    {
        id: "lk-cmb",
        name: "Port of Colombo",
        code: "LK CMB",
        country: "Transit Hub",
        flag: "🇱🇰",
        x: 110,
        y: 330,
        status: "TRANSIT",
        congestion: "MODERATE",
        draft: "18.0m",
        berths: 14,
        details: "Indian Ocean transshipment relay connecting South Asian feeders with East-West liners.",
    },
    {
        id: "my-pkg",
        name: "Port Klang (Malacca Strait)",
        code: "MY PKG",
        country: "Transit Hub",
        flag: "🇲🇾",
        x: 320,
        y: 320,
        status: "TRANSIT",
        congestion: "OPTIMAL",
        draft: "17.5m",
        berths: 22,
        details: "Key Malacca Strait entry terminal and primary maritime logistics center of Malaysia.",
    },
    {
        id: "sg-sin",
        name: "Port of Singapore (PSA)",
        code: "SG SIN",
        country: "Transit Hub",
        flag: "🇸🇬",
        x: 360,
        y: 350,
        status: "TRANSIT",
        congestion: "BUSY",
        draft: "19.0m",
        berths: 54,
        arrivalEstimate: "Passed Oct 08, 04:20 AM",
        details: "World's premier container transshipment hub and strategic bunkering station.",
    },
    {
        id: "vn-sgn",
        name: "Ho Chi Minh Port (Cat Lai)",
        code: "VN SGN",
        country: "Transit Hub",
        flag: "🇻🇳",
        x: 440,
        y: 280,
        status: "TRANSIT",
        congestion: "MODERATE",
        draft: "14.0m",
        berths: 12,
        details: "South China Sea relay servicing regional Southeast Asian feeder routes.",
    },

    // ── China Ports ──
    {
        id: "cn-szx",
        name: "Shenzhen Port (Yantian / Shekou)",
        code: "CN SZX",
        country: "China",
        flag: "🇨🇳",
        x: 580,
        y: 190,
        status: "DESTINATION",
        congestion: "OPTIMAL",
        draft: "17.4m",
        berths: 32,
        arrivalEstimate: "ETA Oct 13, 08:00 AM",
        details: "Global electronics and advanced tech manufacturing primary shipping gateway.",
    },
    {
        id: "cn-can",
        name: "Guangzhou Port (Nansha)",
        code: "CN CAN",
        country: "China",
        flag: "🇨🇳",
        x: 560,
        y: 180,
        status: "DESTINATION",
        congestion: "MODERATE",
        draft: "16.0m",
        berths: 28,
        arrivalEstimate: "ETA Oct 13, 02:30 PM",
        details: "Pearl River comprehensive hub facilitating heavy machinery and consumer exports.",
    },
    {
        id: "cn-nbo",
        name: "Ningbo-Zhoushan Port",
        code: "CN NBO",
        country: "China",
        flag: "🇨🇳",
        x: 710,
        y: 120,
        status: "DESTINATION",
        congestion: "BUSY",
        draft: "22.5m",
        berths: 48,
        arrivalEstimate: "ETA Oct 14, 11:15 AM",
        details: "World's busiest port by total cargo tonnage with deep-water berths for ultra-large liners.",
    },
    {
        id: "cn-sha",
        name: "Shanghai Port (Yangshan Deepwater)",
        code: "CN SHA",
        country: "China",
        flag: "🇨🇳",
        x: 720,
        y: 95,
        status: "DESTINATION",
        congestion: "MODERATE",
        draft: "20.5m",
        berths: 64,
        arrivalEstimate: "Final Dest: Oct 15, 06:00 AM",
        details: "World's #1 container port connected by 32km Donghai Bridge with automated handling.",
    },
    {
        id: "cn-tao",
        name: "Qingdao Port",
        code: "CN TAO",
        country: "China",
        flag: "🇨🇳",
        x: 690,
        y: 40,
        status: "DESTINATION",
        congestion: "OPTIMAL",
        draft: "18.0m",
        berths: 24,
        arrivalEstimate: "ETA Oct 16, 04:00 PM",
        details: "Yellow Sea maritime gateway specializing in automated container berths and cold chain.",
    },
];

export default function MaritimeRouteTrackingWidget() {
    const [selectedPort, setSelectedPort] = useState<PortNode>(ALL_CORRIDOR_PORTS[0]);
    const [isPlaying, setIsPlaying] = useState(true);
    const [radarAngle, setRadarAngle] = useState(0);
    const [expanded, setExpanded] = useState(false);
    const [direction, setDirection] = useState<"BD_TO_CN" | "CN_TO_BD">("BD_TO_CN");
    const [routeProgress, setRouteProgress] = useState(64); // 64% from BD to China

    // Radar sweep animation
    useEffect(() => {
        let animFrame: number;
        const rotateRadar = () => {
            setRadarAngle((prev) => (prev + 1.2) % 360);
            animFrame = requestAnimationFrame(rotateRadar);
        };
        animFrame = requestAnimationFrame(rotateRadar);
        return () => cancelAnimationFrame(animFrame);
    }, []);

    // Live ship coordinates currently in South China Sea en route to Shanghai
    const shipPosition = {
        x: 480,
        y: 250,
        name: "MV BENGAL PIONEER",
        imo: "IMO 9874102",
        callSign: "S2BT3",
        speed: "19.4 kts",
        heading: "042° NE",
        load: "16,400 TEU (92%)",
        coordinates: "08°24'N 107°15'E",
        origin: "Chattogram Port (BD)",
        destination: "Shanghai Port (CN)",
        seaState: "Moderate (Wave 1.4m)",
    };

    const getStatusPill = (status: PortNode["status"]) => {
        switch (status) {
            case "ORIGIN":
                return "bg-[#00c9a7]/20 text-[#00e5c0] border-[#00c9a7]/50";
            case "DESTINATION":
                return "bg-[#00b4d8]/20 text-[#00b4d8] border-[#00b4d8]/50";
            case "FEEDER":
                return "bg-[#3a6b66]/25 text-[#7ecfc4] border-[#1a4a4a]";
            case "TRANSIT":
                return "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/50";
        }
    };

    return (
        <div
            className={`rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-2xl transition-all duration-300 overflow-hidden flex flex-col ${
                expanded
                    ? "fixed inset-3 z-50 bg-[#0d1f1f]/98 backdrop-blur-xl"
                    : "relative w-full"
            }`}
        >
            {/* Top Control Bar */}
            <div className="p-4 sm:p-5 border-b border-[#1a4a4a] flex flex-wrap items-center justify-between gap-3 bg-[#0a1a1a]/70">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-[#00c9a7] to-[#00b4d8] flex items-center justify-center text-[#0a0f0f] shadow-lg shadow-[#00c9a7]/20 shrink-0">
                        <Ship size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-[#e0faf5] tracking-tight">
                                Maritime Corridor: Bangladesh ⇄ China
                            </h3>
                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5c0] animate-ping" />
                                Live AIS Telemetry
                            </span>
                        </div>
                        <p className="text-[11px] text-[#7ecfc4] flex items-center gap-1.5 mt-0.5">
                            <span>Bay of Bengal ➔ Malacca Strait ➔ South China Sea ➔ East China Sea</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Direction Toggle */}
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setDirection(direction === "BD_TO_CN" ? "CN_TO_BD" : "BD_TO_CN");
                            toast.success(
                                direction === "BD_TO_CN"
                                    ? "Corridor Switched: China ➔ Bangladesh (Import Feeder)"
                                    : "Corridor Switched: Bangladesh ➔ China (Export Liner)"
                            );
                        }}
                        leftIcon={<RotateCcw size={12} />}
                        title="Toggle Trade Direction"
                    >
                        {direction === "BD_TO_CN" ? "BD ➔ CN (Export)" : "CN ➔ BD (Import)"}
                    </Button>

                    {/* Expand/Collapse */}
                    <Button
                        variant="secondary"
                        size="icon-sm"
                        onClick={() => setExpanded(!expanded)}
                        title={expanded ? "Minimize Radar" : "Maximize Fullscreen"}
                    >
                        {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </Button>
                </div>
            </div>

            {/* Maritime Chart Radar Display Area */}
            <div className={`relative w-full overflow-hidden bg-[#071313] select-none ${expanded ? "flex-1 min-h-[500px]" : "h-72 sm:h-84"}`}>
                {/* SVG Ocean Canvas */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 800 450"
                    preserveAspectRatio="xMidYMid slice"
                >
                    <defs>
                        {/* Oceanic Gradients */}
                        <linearGradient id="oceanShade" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#061918" />
                            <stop offset="50%" stopColor="#082221" />
                            <stop offset="100%" stopColor="#051414" />
                        </linearGradient>

                        <linearGradient id="corridorGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00c9a7" />
                            <stop offset="40%" stopColor="#00b4d8" />
                            <stop offset="100%" stopColor="#00e5c0" />
                        </linearGradient>

                        <filter id="glowEffect" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>

                    {/* Ocean Depth Background */}
                    <rect width="800" height="450" fill="url(#oceanShade)" />

                    {/* Navigational Coordinate Lat/Long Grid */}
                    <g stroke="#123d3a" strokeWidth="0.8" opacity="0.4">
                        <line x1="0" y1="75" x2="800" y2="75" strokeDasharray="4 4" />
                        <line x1="0" y1="150" x2="800" y2="150" strokeDasharray="4 4" />
                        <line x1="0" y1="225" x2="800" y2="225" strokeDasharray="4 4" />
                        <line x1="0" y1="300" x2="800" y2="300" strokeDasharray="4 4" />
                        <line x1="0" y1="375" x2="800" y2="375" strokeDasharray="4 4" />

                        <line x1="160" y1="0" x2="160" y2="450" strokeDasharray="4 4" />
                        <line x1="320" y1="0" x2="320" y2="450" strokeDasharray="4 4" />
                        <line x1="480" y1="0" x2="480" y2="450" strokeDasharray="4 4" />
                        <line x1="640" y1="0" x2="640" y2="450" strokeDasharray="4 4" />
                    </g>

                    {/* Lat/Long Label Badges */}
                    <text x="10" y="80" fill="#2a5c57" fontSize="9" fontFamily="monospace">30°N</text>
                    <text x="10" y="155" fill="#2a5c57" fontSize="9" fontFamily="monospace">20°N</text>
                    <text x="10" y="230" fill="#2a5c57" fontSize="9" fontFamily="monospace">10°N</text>
                    <text x="10" y="305" fill="#2a5c57" fontSize="9" fontFamily="monospace">00°EQ</text>
                    <text x="165" y="440" fill="#2a5c57" fontSize="9" fontFamily="monospace">90°E</text>
                    <text x="325" y="440" fill="#2a5c57" fontSize="9" fontFamily="monospace">100°E</text>
                    <text x="485" y="440" fill="#2a5c57" fontSize="9" fontFamily="monospace">110°E</text>
                    <text x="645" y="440" fill="#2a5c57" fontSize="9" fontFamily="monospace">120°E</text>

                    {/* Regional Sea Water Masses (Dark stylized contours) */}
                    {/* Bay of Bengal waters */}
                    <path
                        d="M 60 40 Q 140 180, 200 360 L 30 380 Z"
                        fill="#0b2827"
                        opacity="0.35"
                    />
                    {/* South China Sea basin */}
                    <path
                        d="M 380 200 Q 520 280, 600 380 L 400 390 Z"
                        fill="#0b2827"
                        opacity="0.35"
                    />

                    {/* Regional Water Labels */}
                    <text x="110" y="240" fill="#1b4d49" fontSize="11" fontWeight="bold" letterSpacing="3">BAY OF BENGAL</text>
                    <text x="240" y="270" fill="#1b4d49" fontSize="9" fontWeight="bold" letterSpacing="2">ANDAMAN SEA</text>
                    <text x="290" y="380" fill="#1b4d49" fontSize="9" fontWeight="bold" letterSpacing="1.5">STRAIT OF MALACCA</text>
                    <text x="450" y="320" fill="#1b4d49" fontSize="11" fontWeight="bold" letterSpacing="3">SOUTH CHINA SEA</text>
                    <text x="660" y="180" fill="#1b4d49" fontSize="10" fontWeight="bold" letterSpacing="2">EAST CHINA SEA</text>

                    {/* High-Tech Radar Scanning Beam */}
                    <g transform={`rotate(${radarAngle} 400 225)`}>
                        <line
                            x1="400"
                            y1="225"
                            x2="780"
                            y2="225"
                            stroke="#00c9a7"
                            strokeWidth="1.5"
                            opacity="0.6"
                        />
                        <path
                            d="M 400 225 L 780 225 A 380 380 0 0 0 760 140 Z"
                            fill="url(#radarCone)"
                            opacity="0.12"
                        />
                        <defs>
                            <linearGradient id="radarCone" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#00c9a7" stopOpacity="0" />
                                <stop offset="100%" stopColor="#00c9a7" stopOpacity="0.4" />
                            </linearGradient>
                        </defs>
                    </g>

                    {/* Regional Feeders / Connecting Secondary Routes */}
                    <path
                        d="M 100 105 L 130 110"
                        stroke="#1a4a4a"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                    />
                    <path
                        d="M 115 125 L 130 110"
                        stroke="#1a4a4a"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                    />
                    <path
                        d="M 155 135 L 130 110"
                        stroke="#1a4a4a"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                    />
                    <path
                        d="M 130 110 L 110 330"
                        stroke="#1a4a4a"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                    />
                    <path
                        d="M 580 190 L 560 180"
                        stroke="#1a4a4a"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                    />
                    <path
                        d="M 710 120 L 720 95"
                        stroke="#1a4a4a"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                    />
                    <path
                        d="M 720 95 L 690 40"
                        stroke="#1a4a4a"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                    />

                    {/* Main Maritime Trunk Route: Chattogram ➔ Singapore ➔ Shanghai */}
                    {/* Background inactive track */}
                    <path
                        id="maritimeTrunkPath"
                        d="M 130 110 Q 180 220, 260 280 T 320 320 T 360 350 Q 440 330, 480 250 T 580 190 T 670 140 T 720 95"
                        fill="none"
                        stroke="#163f3c"
                        strokeWidth="5"
                        strokeLinecap="round"
                    />

                    {/* Active glowing animated route path */}
                    <path
                        d="M 130 110 Q 180 220, 260 280 T 320 320 T 360 350 Q 440 330, 480 250 T 580 190 T 670 140 T 720 95"
                        fill="none"
                        stroke="url(#corridorGlow)"
                        strokeWidth="3.5"
                        strokeDasharray="8 6"
                        filter="url(#glowEffect)"
                        className="animate-pulse"
                    />

                    {/* Live Vessel Wake Effect Behind Ship */}
                    <path
                        d="M 360 350 Q 440 330, 480 250"
                        fill="none"
                        stroke="#00e5c0"
                        strokeWidth="3"
                        opacity="0.85"
                    />
                    <path
                        d="M 360 350 Q 440 330, 480 250"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.6"
                    />

                    {/* Live Moving Container Vessel Graphic (At x=480, y=250 in South China Sea) */}
                    <g transform={`translate(${shipPosition.x}, ${shipPosition.y})`}>
                        {/* Vessel Radar Pulse */}
                        <circle r="22" fill="none" stroke="#00e5c0" strokeWidth="1" opacity="0.4" className="animate-ping" />
                        <circle r="14" fill="#00c9a7" opacity="0.15" />

                        {/* Isometric/Stylized Container Ship Hull */}
                        <g transform="rotate(35) translate(-14, -7)">
                            {/* Vessel Hull */}
                            <path
                                d="M 0 4 L 4 0 L 24 0 L 28 4 L 24 8 L 4 8 Z"
                                fill="#0d2423"
                                stroke="#00c9a7"
                                strokeWidth="1.2"
                            />
                            {/* Container Stacks (Multi-colored TEU blocks) */}
                            <rect x="6" y="2" width="4" height="4" fill="#00e5c0" rx="0.5" />
                            <rect x="11" y="2" width="4" height="4" fill="#00b4d8" rx="0.5" />
                            <rect x="16" y="2" width="4" height="4" fill="#f59e0b" rx="0.5" />
                            {/* Bridge Tower & Mast */}
                            <rect x="21" y="1.5" width="3" height="5" fill="#e0faf5" rx="0.5" />
                            <circle cx="22.5" cy="4" r="0.8" fill="#ff6b6b" />
                        </g>

                        {/* Vessel Heading Vector Line */}
                        <line x1="0" y1="0" x2="28" y2="-18" stroke="#00e5c0" strokeWidth="1.5" strokeDasharray="3 2" />
                        <circle cx="28" cy="-18" r="2" fill="#00e5c0" />
                    </g>

                    {/* Port Waypoints Rendering */}
                    {ALL_CORRIDOR_PORTS.map((port) => {
                        const isSelected = selectedPort.id === port.id;
                        const isOrigin = port.status === "ORIGIN";
                        const isDest = port.status === "DESTINATION";

                        return (
                            <g
                                key={port.id}
                                transform={`translate(${port.x}, ${port.y})`}
                                className="cursor-pointer group"
                                onClick={() => setSelectedPort(port)}
                            >
                                {/* Outer Ping Ring for major ports */}
                                {(isOrigin || isDest) && (
                                    <circle
                                        r="12"
                                        fill="none"
                                        stroke={isOrigin ? "#00c9a7" : "#00b4d8"}
                                        strokeWidth="1"
                                        className="animate-ping opacity-60"
                                    />
                                )}

                                {/* Main Node Circle */}
                                <circle
                                    r={isSelected ? "7" : isOrigin || isDest ? "6" : "4.5"}
                                    fill={isSelected ? "#00e5c0" : isOrigin ? "#00c9a7" : isDest ? "#00b4d8" : "#112a2a"}
                                    stroke={isSelected ? "#ffffff" : isOrigin ? "#00e5c0" : isDest ? "#00b4d8" : "#1a4a4a"}
                                    strokeWidth={isSelected ? "2" : "1.5"}
                                    filter={isSelected ? "url(#glowEffect)" : undefined}
                                />

                                {/* Port Code Badge Label */}
                                <text
                                    x="0"
                                    y="-10"
                                    textAnchor="middle"
                                    fill={isSelected ? "#00e5c0" : "#e0faf5"}
                                    fontSize={isOrigin || isDest ? "9" : "8"}
                                    fontWeight={isSelected || isOrigin || isDest ? "bold" : "normal"}
                                    fontFamily="monospace"
                                    className="select-none pointer-events-none drop-shadow-md"
                                >
                                    {port.code}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Floating Live Vessel Telemetry HUD (Top-Left) */}
                <div className="absolute left-3 top-3 bg-[#0a1a1a]/90 backdrop-blur-md rounded-2xl p-3 border border-[#1a4a4a] shadow-xl max-w-[260px] text-xs pointer-events-auto">
                    <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-[#1a4a4a]/70">
                        <div className="flex items-center gap-1.5">
                            <span className="text-base">🇧🇩</span>
                            <span className="font-bold text-[#e0faf5] text-[11px] truncate">
                                {shipPosition.name}
                            </span>
                        </div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30">
                            {shipPosition.speed}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-2">
                        <div>
                            <span className="text-[#3a6b66] block">IMO / Callsign</span>
                            <span className="text-[#7ecfc4] font-mono font-semibold">{shipPosition.callSign}</span>
                        </div>
                        <div>
                            <span className="text-[#3a6b66] block">Heading</span>
                            <span className="text-[#e0faf5] font-semibold">{shipPosition.heading}</span>
                        </div>
                        <div>
                            <span className="text-[#3a6b66] block">Container Load</span>
                            <span className="text-[#00e5c0] font-semibold">{shipPosition.load}</span>
                        </div>
                        <div>
                            <span className="text-[#3a6b66] block">Sea Condition</span>
                            <span className="text-[#7ecfc4] truncate">{shipPosition.seaState}</span>
                        </div>
                    </div>
                </div>

                {/* Selected Port Inspection Card (Bottom-Right) */}
                <div className="absolute right-3 bottom-3 bg-[#0a1a1a]/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#00c9a7]/40 shadow-2xl max-w-[280px] text-xs pointer-events-auto animate-in fade-in">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg">{selectedPort.flag}</span>
                            <div>
                                <h4 className="font-bold text-[#e0faf5] text-xs leading-tight">
                                    {selectedPort.name}
                                </h4>
                                <span className="text-[10px] font-mono text-[#7ecfc4]">
                                    UN/LOCODE: {selectedPort.code}
                                </span>
                            </div>
                        </div>
                        <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusPill(
                                selectedPort.status
                            )}`}
                        >
                            {selectedPort.status}
                        </span>
                    </div>

                    <p className="text-[11px] text-[#7ecfc4]/90 line-clamp-2 my-2 leading-relaxed">
                        {selectedPort.details}
                    </p>

                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#1a4a4a]/70 text-[10px]">
                        <div>
                            <span className="text-[#3a6b66] block">Max Draft</span>
                            <strong className="text-[#e0faf5]">{selectedPort.draft}</strong>
                        </div>
                        <div>
                            <span className="text-[#3a6b66] block">Berths</span>
                            <strong className="text-[#e0faf5]">{selectedPort.berths} Active</strong>
                        </div>
                        <div>
                            <span className="text-[#3a6b66] block">Congestion</span>
                            <strong
                                className={
                                    selectedPort.congestion === "OPTIMAL"
                                        ? "text-[#00e5c0]"
                                        : selectedPort.congestion === "MODERATE"
                                        ? "text-[#f59e0b]"
                                        : "text-[#ff6b6b]"
                                }
                            >
                                {selectedPort.congestion}
                            </strong>
                        </div>
                    </div>

                    {selectedPort.arrivalEstimate && (
                        <div className="mt-2.5 p-1.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a] text-[10px] text-[#00e5c0] flex items-center gap-1.5">
                            <Clock size={12} />
                            <span>{selectedPort.arrivalEstimate}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Ports Selector & Voyage Telemetry Bar */}
            <div className="p-4 bg-[#0d1f1f] border-t border-[#1a4a4a] flex flex-col gap-3">
                {/* Voyage Progress Indicator */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[#e0faf5] flex items-center gap-1.5">
                            <Anchor size={14} className="text-[#00c9a7]" />
                            {direction === "BD_TO_CN" ? "Chattogram (BD)" : "Shanghai (CN)"}
                        </span>
                        <span className="text-[#3a6b66]">➔</span>
                        <span className="font-bold text-[#e0faf5]">
                            {direction === "BD_TO_CN" ? "Shanghai (CN)" : "Chattogram (BD)"}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#7ecfc4]">
                        <span>Transit Progress: <strong className="text-[#00e5c0]">{routeProgress}%</strong></span>
                        <span>•</span>
                        <span>Distance: <strong>3,850 NM</strong></span>
                        <span>•</span>
                        <span>ETA: <strong className="text-[#e0faf5]">4 Days 14 Hrs</strong></span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative w-full h-1.5 rounded-full bg-[#0a1a1a] overflow-hidden border border-[#1a4a4a]">
                    <div
                        className="h-full bg-linear-to-r from-[#00c9a7] via-[#00e5c0] to-[#00b4d8] rounded-full shadow-xs shadow-[#00c9a7]"
                        style={{ width: `${routeProgress}%` }}
                    />
                </div>

                {/* Quick Port Pills Selection List */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
                    <span className="text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider shrink-0 mr-1">
                        Ports:
                    </span>
                    {ALL_CORRIDOR_PORTS.map((port) => (
                        <Button
                            key={port.id}
                            onClick={() => setSelectedPort(port)}
                            variant={selectedPort.id === port.id ? "teal" : "secondary"}
                            size="xs"
                            leftIcon={<span>{port.flag}</span>}
                            className="whitespace-nowrap"
                        >
                            {port.code}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
