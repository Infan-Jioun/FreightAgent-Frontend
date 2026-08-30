"use client";

import dynamic from "next/dynamic";
import { Navbar } from "./Navbar";
import { HowItWorks } from "./HowItWorks";
import { Footer } from "./Footer";
import { useInViewport } from "../hooks/useInViewport";

// ✅ Loading fallback দাও — blank white flash এড়াতে
const placeholder = () => (
    <div className="h-[50vh] w-full" style={{ background: "var(--bg-primary)" }} />
);

const Hero3D = dynamic(() => import("./Hero3D"), {
    ssr: false,
    loading: placeholder,
});
const GlobalNetwork = dynamic(() => import("./GlobalNetwork"), {
    ssr: false,
    loading: placeholder,
});
const LiveTracking = dynamic(() => import("./LiveTracking"), {
    ssr: false,
    loading: placeholder,
});
const ShipmentLifecycle = dynamic(() => import("./ShipmentLifecycle"), {
    ssr: false,
    loading: placeholder,
});
const GlobalCoverage = dynamic(() => import("./GlobalCoverage"), {
    ssr: false,
    loading: placeholder,
});
const AICommandCenter = dynamic(() => import("./AICommandCenter"), {
    ssr: false,
    loading: placeholder,
});
const LogisticsInfrastructure = dynamic(
    () => import("./LogisticsInfrastructure"),
    { ssr: false, loading: placeholder }
);
const FinalCTA = dynamic(() => import("./FinalCTA"), {
    ssr: false,
    loading: placeholder,
});

// ✅ Lazy wrapper — viewport এ না আসা পর্যন্ত mount হবে না
function LazySection({ children }: { children: React.ReactNode }) {
    const { ref, inView } = useInViewport("300px");
    return (
        <div ref={ref}>
            {inView ? children : (
                <div className="h-[50vh]" style={{ background: "var(--bg-primary)" }} />
            )}
        </div>
    );
}

export function HomeClient() {
    return (
        <main
            className="min-h-screen overflow-hidden"
            style={{ background: "var(--bg-primary)" }}
        >
            <Navbar />
            <h1 className="sr-only">
                Move the world. Track every shipment. — FreightAgent global freight platform.
            </h1>

            {/* Hero সবসময় load হবে — first viewport */}
            <Hero3D />

            {/* বাকিগুলো lazy — viewport এ আসলে mount হবে */}
            <LazySection><GlobalNetwork /></LazySection>
            <LazySection><LiveTracking /></LazySection>
            <LazySection><ShipmentLifecycle /></LazySection>
            <LazySection><GlobalCoverage /></LazySection>
            <LazySection><AICommandCenter /></LazySection>
            <LazySection><LogisticsInfrastructure /></LazySection>
            <HowItWorks />
            <LazySection><FinalCTA /></LazySection>

            <Footer />
        </main>
    );
}

export default HomeClient;