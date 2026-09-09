"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function TransportationCard() {
    return (
        <div className="bg-[#0d1f1f] rounded-3xl p-5 border border-[#1a4a4a] shadow-lg shadow-black/20 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#00c9a7] to-[#00b4d8] flex items-center justify-center text-[#0a0f0f]">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C9.5 6 7 9 7 13c0 3.31 2.69 6 6 6s6-2.69 6-6c0-2.5-1.5-5-3.5-7.5-.5 2-1.5 3-2.5 3-1 0-1.8-.8-1-2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-bold text-[#e0faf5]">
                        Deigo Transportation
                    </h3>
                </div>

                <button
                    onClick={() => toast.info("Transportation details & Freigeht info")}
                    className="w-6 h-6 rounded-full bg-[#00c9a7]/15 hover:bg-[#00c9a7]/30 text-[#00c9a7] flex items-center justify-center transition-colors shadow-xs"
                    aria-label="Add or view details"
                >
                    <Plus size={14} strokeWidth={2.5} />
                </button>
            </div>

            {/* Content: Specs on Left, 3D Isometric Shipping Container Graphic on Right */}
            <div className="grid grid-cols-12 items-center gap-3 mt-4">
                {/* Specs */}
                <div className="col-span-5 space-y-3">
                    <div>
                        <p className="text-[10px] text-[#3a6b66] font-medium">
                            Payload
                        </p>
                        <p className="text-sm font-extrabold text-[#e0faf5]">
                            2.415 lbs
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] text-[#3a6b66] font-medium">
                            Load Volume
                        </p>
                        <p className="text-sm font-extrabold text-[#e0faf5]">
                            312 in
                        </p>
                    </div>

                    <div>
                        <p className="text-[10px] text-[#3a6b66] font-medium">
                            Load Length
                        </p>
                        <p className="text-sm font-extrabold text-[#e0faf5]">
                            217 in
                        </p>
                    </div>
                </div>

                {/* Isometric Realistic 3D Shipping Container Illustration in Dark Teal Palette */}
                <div className="col-span-7 flex justify-center items-center py-2">
                    <svg
                        className="w-full max-w-[210px] h-auto drop-shadow-xl"
                        viewBox="0 0 260 160"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <linearGradient id="containerRoof" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#0d2826" />
                                <stop offset="40%" stopColor="#00c9a7" />
                                <stop offset="100%" stopColor="#091a1a" />
                            </linearGradient>

                            <linearGradient id="containerSide" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#091a1a" />
                                <stop offset="60%" stopColor="#0a2220" />
                                <stop offset="100%" stopColor="#051212" />
                            </linearGradient>

                            <linearGradient id="containerFront" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#00e5c0" />
                                <stop offset="100%" stopColor="#008f7a" />
                            </linearGradient>
                        </defs>

                        {/* Ground Shadow */}
                        <ellipse cx="140" cy="142" rx="100" ry="14" fill="#051212" opacity="0.8" />

                        {/* Top Roof Face */}
                        <polygon
                            points="45,45 155,15 255,45 145,75"
                            fill="url(#containerRoof)"
                            stroke="#1a4a4a"
                            strokeWidth="1.5"
                        />
                        {/* Roof Corrugation lines */}
                        <line x1="65" y1="40" x2="175" y2="10" stroke="#00c9a7" strokeWidth="0.8" opacity="0.4" />
                        <line x1="85" y1="35" x2="195" y2="5" stroke="#00c9a7" strokeWidth="0.8" opacity="0.4" />
                        <line x1="105" y1="30" x2="215" y2="0" stroke="#00c9a7" strokeWidth="0.8" opacity="0.4" />

                        {/* Front Face (Teal Corrugated Door) */}
                        <polygon
                            points="45,45 145,75 145,135 45,105"
                            fill="url(#containerFront)"
                            stroke="#00c9a7"
                            strokeWidth="1.5"
                        />
                        {/* Front vertical rib grooves */}
                        <line x1="65" y1="51" x2="65" y2="111" stroke="#005e50" strokeWidth="2.5" />
                        <line x1="85" y1="57" x2="85" y2="117" stroke="#005e50" strokeWidth="2.5" />
                        <line x1="105" y1="63" x2="105" y2="123" stroke="#005e50" strokeWidth="2.5" />
                        <line x1="125" y1="69" x2="125" y2="129" stroke="#005e50" strokeWidth="2.5" />

                        {/* Container Front Branding */}
                        <text
                            x="65"
                            y="85"
                            fill="#0a0f0f"
                            fontSize="10"
                            fontWeight="bold"
                            transform="rotate(16, 65, 85)"
                            opacity="0.95"
                        >
                            Deigo
                        </text>

                        {/* Right Long Side Face */}
                        <polygon
                            points="145,75 255,45 255,105 145,135"
                            fill="url(#containerSide)"
                            stroke="#1a4a4a"
                            strokeWidth="1.5"
                        />

                        {/* Right Side Vertical Ribs */}
                        <line x1="165" y1="70" x2="165" y2="130" stroke="#102f2d" strokeWidth="2" />
                        <line x1="180" y1="66" x2="180" y2="126" stroke="#102f2d" strokeWidth="2" />
                        <line x1="195" y1="62" x2="195" y2="122" stroke="#102f2d" strokeWidth="2" />
                        <line x1="210" y1="58" x2="210" y2="118" stroke="#102f2d" strokeWidth="2" />
                        <line x1="225" y1="54" x2="225" y2="114" stroke="#102f2d" strokeWidth="2" />
                        <line x1="240" y1="50" x2="240" y2="110" stroke="#102f2d" strokeWidth="2" />

                        {/* Side Branding Typography */}
                        <text
                            x="170"
                            y="96"
                            fill="#00e5c0"
                            fontSize="14"
                            fontWeight="extrabold"
                            letterSpacing="1"
                            transform="rotate(-15, 170, 96)"
                            opacity="0.9"
                        >
                            +Deigo
                        </text>

                        {/* Accent Circle on the side */}
                        <circle cx="242" cy="74" r="7" fill="#00c9a7" opacity="0.9" />
                        <circle cx="242" cy="74" r="4" fill="#091a1a" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
