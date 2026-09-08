"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import GsapPageWrapper from "@/components/ui/GsapPageWrapper";
import DispatchRadarAnimation from "./DispatchRadarAnimation";
import { CONTAINER_CLASS } from "@/app/components/ContainsLayout";
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  Anchor,
  Headphones,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/app/constants/routes";

const OFFICES = [
  {
    city: "Rotterdam, Netherlands",
    address: "Maasvlakte 2, Haven 9200, 3047 AL Rotterdam",
    phone: "+31 10 798 4400",
    email: "rotterdam.ops@freightagent.com",
    role: "European Maritime Operations",
  },
  {
    city: "Singapore",
    address: "10 Pasir Panjang Road, Mapletree Business City, Singapore 117438",
    phone: "+65 6829 5500",
    email: "singapore.ops@freightagent.com",
    role: "Southeast Asia Control Tower",
  },
  {
    city: "Dubai, United Arab Emirates",
    address: "JAFZA View 18, Jebel Ali Free Zone, Dubai",
    phone: "+971 4 881 9200",
    email: "dubai.desk@freightagent.com",
    role: "Middle East & South Asia Desk",
  },
  {
    city: "Chittagong, Bangladesh",
    address: "Agrabad Commercial Area, Chittagong 4100",
    phone: "+880 31 716 300",
    email: "chittagong.ops@freightagent.com",
    role: "Bay of Bengal Port Hub",
  },
  {
    city: "New York, USA",
    address: "One World Trade Center, Suite 8500, New York, NY 10007",
    phone: "+1 (800) 458-9921",
    email: "americas@freightagent.com",
    role: "Americas Headquarters",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    inquiryType: "Cargo Booking & Rate Inquiry",
    trackingId: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Inquiry dispatched to 24/7 Operations Desk. We will reply within 15 minutes.");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f0f] text-[#e0faf5] overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <GsapPageWrapper className={`${CONTAINER_CLASS} space-y-12 sm:space-y-16`}>
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto pt-6 sm:pt-10 space-y-4">
            <div className="gsap-reveal inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#00c9a7]/10 text-[#00e5c0] border border-[#00c9a7]/30">
              <Headphones size={14} className="text-[#00c9a7]" />
              <span>24/7 Global Dispatch & Emergency Assistance</span>
            </div>

            <h1 className="gsap-reveal text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Connect with Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c9a7] via-[#00e5c0] to-[#00b4d8]">
                Logistics Specialists
              </span>
            </h1>

            <p className="gsap-reveal text-sm sm:text-base text-[#7ecfc4]/90 max-w-2xl mx-auto leading-relaxed">
              Have an urgent vessel status inquiry, need emergency air charter space, or exploring enterprise API integration? Our operations desks never sleep.
            </p>
          </div>

          {/* Quick Contact Bar */}
          <div className="gsap-reveal grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0]">
                <PhoneCall size={20} />
              </div>
              <div>
                <span className="text-[10px] text-[#3a6b66] uppercase font-bold tracking-wider block">
                  24/7 Dispatch Hotline
                </span>
                <a href="tel:+18004589921" className="text-sm font-bold text-[#e0faf5] hover:text-[#00c9a7] transition-colors">
                  +1 (800) 458-9921
                </a>
                <span className="text-[10px] text-[#7ecfc4] block">Toll-free worldwide</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00b4d8]/15 border border-[#00b4d8]/30 flex items-center justify-center text-[#00b4d8]">
                <Mail size={20} />
              </div>
              <div>
                <span className="text-[10px] text-[#3a6b66] uppercase font-bold tracking-wider block">
                  Operations Desk Email
                </span>
                <a href="mailto:dispatch@freightagent.com" className="text-sm font-bold text-[#e0faf5] hover:text-[#00c9a7] transition-colors">
                  dispatch@freightagent.com
                </a>
                <span className="text-[10px] text-[#7ecfc4] block">SLA: Under 15 minutes</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0]">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[10px] text-[#3a6b66] uppercase font-bold tracking-wider block">
                  Operating Hours
                </span>
                <span className="text-sm font-bold text-[#e0faf5]">
                  24 Hours / 7 Days / 365 Days
                </span>
                <span className="text-[10px] text-[#00e5c0] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e5c0] animate-ping" />
                  All Port Desks Online
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Live 24/7 Operations Radar */}
          <div className="gsap-reveal">
            <DispatchRadarAnimation />
          </div>

          {/* Form & Offices Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: Inquiry Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] space-y-6 shadow-xl">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-[#e0faf5] flex items-center gap-2">
                  <MessageSquare size={18} className="text-[#00c9a7]" />
                  Direct Dispatch Message
                </h2>
                <p className="text-xs text-[#7ecfc4]/80">
                  Send your cargo query directly into our regional operations ticketing system.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-[#00c9a7]/10 border border-[#00c9a7]/40 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#00c9a7] text-[#0a0f0f] flex items-center justify-center mx-auto">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-base font-bold text-[#e0faf5]">Inquiry Dispatched!</h3>
                  <p className="text-xs text-[#7ecfc4] max-w-md mx-auto">
                    Your request has been routed to our duty freight agent. A dispatch coordinator will contact you at <strong>{formData.email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-5 py-2 rounded-xl bg-[#112a2a] text-xs font-semibold text-[#00e5c0] hover:bg-[#00c9a7]/20 transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#7ecfc4] block">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Captain Marcus Vance"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-none focus:border-[#00c9a7]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#7ecfc4] block">Work Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="vance@maritimetrade.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-none focus:border-[#00c9a7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#7ecfc4] block">Company Name</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Global Cargo Holdings Ltd"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-none focus:border-[#00c9a7]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[#7ecfc4] block">Inquiry Type</label>
                      <select
                        value={formData.inquiryType}
                        onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7]"
                      >
                        <option>Cargo Booking & Rate Inquiry</option>
                        <option>Live Shipment Tracking & Delay Report</option>
                        <option>Customs Hold & Regulatory Clearance</option>
                        <option>Enterprise Volume Contract / SLA</option>
                        <option>Emergency Air Freight Charter</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#7ecfc4] block">
                      Tracking or Container ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.trackingId}
                      onChange={(e) => setFormData({ ...formData, trackingId: e.target.value })}
                      placeholder="#26277887-ID-YK or MSCU892109"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs font-mono text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-none focus:border-[#00c9a7]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#7ecfc4] block">Cargo Details or Message</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Specify commodity, origin port, destination port, container requirements, or urgent issues..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-none focus:border-[#00c9a7] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00c9a7]/20 hover:opacity-95 transition-opacity"
                  >
                    <Send size={15} />
                    <span>Transmit Message to Operations Desk</span>
                  </button>
                </form>
              )}
            </div>

            {/* Right 5 Cols: Strategic Port Offices */}
            <div className="lg:col-span-5 space-y-4">
              <h2 className="text-lg font-bold text-[#e0faf5] flex items-center gap-2">
                <Anchor size={18} className="text-[#00c9a7]" />
                Regional Port Desks
              </h2>

              <div className="space-y-3">
                {OFFICES.map((office) => (
                  <div
                    key={office.city}
                    className="p-4 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] hover:border-[#00c9a7]/40 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#e0faf5]">{office.city}</h4>
                      <span className="text-[9px] font-mono text-[#00c9a7] bg-[#00c9a7]/10 px-2 py-0.5 rounded border border-[#00c9a7]/20">
                        {office.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7ecfc4]/80 flex items-start gap-1.5">
                      <MapPin size={12} className="text-[#3a6b66] flex-shrink-0 mt-0.5" />
                      <span>{office.address}</span>
                    </p>
                    <div className="flex items-center justify-between text-[11px] pt-1 text-[#3a6b66]">
                      <a href={`tel:${office.phone}`} className="hover:text-[#00e5c0] transition-colors">
                        {office.phone}
                      </a>
                      <a href={`mailto:${office.email}`} className="hover:text-[#00e5c0] transition-colors">
                        {office.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GsapPageWrapper>
      </main>

      <Footer />
    </div>
  );
}
