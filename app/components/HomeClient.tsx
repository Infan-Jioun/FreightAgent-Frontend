"use client";

import dynamic from "next/dynamic";
import { Navbar } from "./Navbar";
import { HowItWorks } from "./HowItWorks";
import { Footer } from "./Footer";
import { useInViewport } from "../hooks/useInViewport";

/**
 * Loading / lazy placeholders
 * ---------------------------------------------------------------------------
 * The old version used one flat `h-[50vh]` placeholder for every section —
 * both for "code still downloading" (dynamic loading) AND "not scrolled
 * into view yet" (LazySection). Stacked across 7 sections that's 3.5
 * viewport-heights of blank space before anything below the hero has a
 * chance to mount, which is exactly the big empty gap you were seeing.
 *
 * Fix: each section gets a height estimate close to what it actually
 * renders (tune the numbers below once you can measure the real sections),
 * and LazySection's rootMargin is large enough that content swaps in
 * well before it scrolls into view — so in practice you rarely see the
 * placeholder at all, you just see the section appear.
 */

type SectionKey =
    | "hero"
    | "globalNetwork"
    | "liveTracking"
    | "shipmentLifecycle"
    | "globalCoverage"
    | "aiCommandCenter"
    | "logisticsInfrastructure"
    | "finalCta";

// Approximate rendered height per section, in px. These are placeholders
// standing in for content that hasn't mounted yet — get them close to the
// real thing and layout shift disappears. Adjust as you build each section.
const SECTION_HEIGHT: Record<SectionKey, number> = {
    hero: 720,
    globalNetwork: 640,
    liveTracking: 560,
    shipmentLifecycle: 560,
    globalCoverage: 520,
    aiCommandCenter: 560,
    logisticsInfrastructure: 520,
    finalCta: 360,
};

function Placeholder({ section }: { section: SectionKey }) {
    return (
        <div
            style={{ height: SECTION_HEIGHT[section], background: "var(--bg-primary)" }}
            className="w-full"
        />
    );
}

const Hero3D = dynamic(() => import("./Hero3D"), {
    ssr: false,
    loading: () => <Placeholder section="hero" />,
});
const GlobalNetwork = dynamic(() => import("./GlobalNetwork"), {
    ssr: false,
    loading: () => <Placeholder section="globalNetwork" />,
});
const LiveTracking = dynamic(() => import("./LiveTracking"), {
    ssr: false,
    loading: () => <Placeholder section="liveTracking" />,
});
const ShipmentLifecycle = dynamic(() => import("./ShipmentLifecycle"), {
    ssr: false,
    loading: () => <Placeholder section="shipmentLifecycle" />,
});
const GlobalCoverage = dynamic(() => import("./GlobalCoverage"), {
    ssr: false,
    loading: () => <Placeholder section="globalCoverage" />,
});
const AICommandCenter = dynamic(() => import("./AICommandCenter"), {
    ssr: false,
    loading: () => <Placeholder section="aiCommandCenter" />,
});
const LogisticsInfrastructure = dynamic(
    () => import("./LogisticsInfrastructure"),
    { ssr: false, loading: () => <Placeholder section="logisticsInfrastructure" /> }
);
const FinalCTA = dynamic(() => import("./FinalCTA"), {
    ssr: false,
    loading: () => <Placeholder section="finalCta" />,
});

/**
 * Lazy wrapper — doesn't mount its children until the section is nearly in
 * view. `rootMargin` is generous (500px) precisely so the swap happens
 * before the user scrolls to it, not while they're staring at empty space.
 */
function LazySection({
    section,
    children,
}: {
    section: SectionKey;
    children: React.ReactNode;
}) {
    const { ref, inView } = useInViewport("500px");
    return <div ref={ref}>{inView ? children : <Placeholder section={section} />}</div>;
}

export function HomeClient() {
    return (
        <main className="min-h-screen overflow-x-hidden" style={{ background: "var(--bg-primary)" }}>
            <Navbar />
            <h1 className="sr-only">
                Move the world. Track every shipment. — FreightAgent global freight platform.
            </h1>

            {/* Hero always loads — first viewport */}
            <Hero3D />

            {/* Everything else is lazy — mounts as it nears the viewport */}
            <LazySection section="globalNetwork">
                <GlobalNetwork />
            </LazySection>
            <LazySection section="liveTracking">
                <LiveTracking />
            </LazySection>
            <LazySection section="shipmentLifecycle">
                <ShipmentLifecycle />
            </LazySection>
            <LazySection section="globalCoverage">
                <GlobalCoverage />
            </LazySection>
            <LazySection section="aiCommandCenter">
                <AICommandCenter />
            </LazySection>
            <LazySection section="logisticsInfrastructure">
                <LogisticsInfrastructure />
            </LazySection>

            <HowItWorks />

            <LazySection section="finalCta">
                <FinalCTA />
            </LazySection>

            <Footer />
        </main>
    );
}

export default HomeClient;