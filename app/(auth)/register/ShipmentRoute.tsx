"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import LocationNode from "./LocationNode";
import ShipmentParticle from "./ShipmentParticle";

interface ShipmentRouteProps {
    reducedMotion: boolean;
    /** True once registration has succeeded, briefly brightens the route. */
    boosted?: boolean;
}

const ROUTE_POINTS: Array<{ pos: [number, number, number]; label: string; sublabel: string; active?: boolean }> = [
    { pos: [-3.4, -1.1, 2.0], label: "Muscat", sublabel: "Oman" },
    { pos: [-0.2, -0.85, 0.6], label: "Dubai", sublabel: "UAE", active: true },
    { pos: [3.0, -0.6, -1.0], label: "Riyadh", sublabel: "Saudi Arabia" },
];

export default function ShipmentRoute({ reducedMotion, boosted }: ShipmentRouteProps) {
    const curve = useMemo(() => {
        return new THREE.CatmullRomCurve3(ROUTE_POINTS.map((p) => new THREE.Vector3(...p.pos)), false, "catmullrom", 0.2);
    }, []);

    const linePoints = useMemo(() => curve.getPoints(48), [curve]);

    const routeColor = boosted ? "#00e5c0" : "#00C9A7";
    const routeOpacity = boosted ? 0.85 : 0.5;

    return (
        <group>
            {/* Soft wide underlay for a glow-ish feel without postprocessing */}
            <Line points={linePoints} color={routeColor} lineWidth={4} transparent opacity={routeOpacity * 0.25} />
            {/* Crisp core line */}
            <Line points={linePoints} color={routeColor} lineWidth={1.4} transparent opacity={routeOpacity} dashed dashSize={0.12} gapSize={0.08} />

            {ROUTE_POINTS.map((node) => (
                <LocationNode
                    key={node.label}
                    position={node.pos}
                    label={node.label}
                    sublabel={node.sublabel}
                    active={node.active}
                    reducedMotion={reducedMotion}
                />
            ))}

            <ShipmentParticle curve={curve} reducedMotion={reducedMotion} boosted={boosted} />
        </group>
    );
}
