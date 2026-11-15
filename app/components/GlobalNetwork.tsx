"use client";

/**
 * GlobalNetwork — FreightAgent
 * ---------------------------------------------------------------------------
 * Ultra-realistic textured 3D Earth using Three.js / React Three Fiber.
 * Features:
 * - Bangladesh (Chattogram Port) featured prominently in the FRONT CENTER on load.
 * - High-detail Earth with specular ocean reflections, golden night city lights,
 *   atmospheric Rayleigh rim scattering, and semi-transparent swirling clouds.
 * - Connected global trade corridors with illuminated great-circle bezier curves.
 * - National flags & port badges rendered for every connected maritime hub.
 * - Procedural 3D Container Cargo Ships sailing continuously along trade routes
 *   with realistic hull, bridge superstructure, colorful container stacks,
 *   navigation lights (starboard green, port red), and glowing wake trails.
 * - Smooth interactive OrbitControls allowing users to rotate and inspect the globe.
 */

import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Line,
  PerspectiveCamera,
  useTexture,
  Trail,
  Stars,
  OrbitControls,
} from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { CONTAINER_CLASS } from "./ContainsLayout";
import { Anchor, Ship as ShipIcon, Globe2, Compass } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Network Data: Connected Hubs with National Flags & ISO Codes             */
/* -------------------------------------------------------------------------- */

interface HubData {
  id: string;
  name: string;
  country: string;
  code: string;
  flag: string;
  lat: number;
  lon: number;
}

// Bangladesh is the #1 premier port hub, centered directly on the viewport!
const HUBS: HubData[] = [
  { id: "cgp", name: "Chattogram", country: "Bangladesh", code: "BD", flag: "🇧🇩", lat: 22.33, lon: 91.83 },
  { id: "sin", name: "Singapore", country: "Singapore", code: "SG", flag: "🇸🇬", lat: 1.35, lon: 103.8 },
  { id: "sha", name: "Shanghai", country: "China", code: "CN", flag: "🇨🇳", lat: 31.2, lon: 121.5 },
  { id: "dxb", name: "Dubai", country: "UAE", code: "AE", flag: "🇦🇪", lat: 25.2, lon: 55.3 },
  { id: "rtm", name: "Rotterdam", country: "Netherlands", code: "NL", flag: "🇳🇱", lat: 51.9, lon: 4.5 },
  { id: "ham", name: "Hamburg", country: "Germany", code: "DE", flag: "🇩🇪", lat: 53.5, lon: 10.0 },
  { id: "lax", name: "Los Angeles", country: "USA", code: "US", flag: "🇺🇸", lat: 34.0, lon: -118.2 },
  { id: "nyc", name: "New York", country: "USA", code: "US", flag: "🇺🇸", lat: 40.7, lon: -74.0 },
  { id: "bom", name: "Mumbai", country: "India", code: "IN", flag: "🇮🇳", lat: 19.1, lon: 72.9 },
  { id: "lon", name: "London", country: "UK", code: "GB", flag: "🇬🇧", lat: 51.5, lon: -0.1 },
  { id: "tyo", name: "Tokyo", country: "Japan", code: "JP", flag: "🇯🇵", lat: 35.6, lon: 139.7 },
  { id: "syd", name: "Sydney", country: "Australia", code: "AU", flag: "🇦🇺", lat: -33.9, lon: 151.2 },
];

// Active maritime trade route pairs [OriginHubIndex, DestinationHubIndex]
// Dedicated priority feeder lines connecting Chattogram (Index 0) to major global hubs!
const ROUTES: [number, number][] = [
  [0, 1], // Chattogram (BD) -> Singapore (SG) [Primary Asian Feeder Route]
  [2, 0], // Shanghai (CN) -> Chattogram (BD) [Direct Import Line]
  [0, 3], // Chattogram (BD) -> Dubai (AE) [Middle East Transit Line]
  [0, 8], // Chattogram (BD) -> Mumbai (IN) [Bay of Bengal Corridor]
  [3, 4], // Dubai (AE) -> Rotterdam (NL) [Europe Transit Line]
  [4, 5], // Rotterdam (NL) -> Hamburg (DE)
  [7, 5], // New York (US) -> Hamburg (DE)
  [2, 6], // Shanghai (CN) -> Los Angeles (US)
  [1, 8], // Singapore (SG) -> Mumbai (IN)
  [2, 11], // Shanghai (CN) -> Sydney (AU)
  [10, 6], // Tokyo (JP) -> Los Angeles (US)
  [9, 7], // London (GB) -> New York (US)
];

const RADIUS = 2.4;
// Directed sunlight illuminating South Asia & the Bay of Bengal directly in front
const LIGHT_DIR = new THREE.Vector3(2.2, 1.8, 3.8).normalize();

const TEXTURES = {
  day: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg",
  night: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.png",
  specular: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg",
  clouds: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png",
};

/* -------------------------------------------------------------------------- */
/*  Geometry Helpers                                                          */
/* -------------------------------------------------------------------------- */

function toVector3(lat: number, lon: number, r = RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function makeArc(a: THREE.Vector3, b: THREE.Vector3) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  // Curve outward based on distance to form great-circle arch
  mid.setLength(RADIUS * (1 + a.distanceTo(b) / (RADIUS * 5.2)));
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  curve.arcLengthDivisions = 100;
  return curve;
}

/* -------------------------------------------------------------------------- */
/*  National Flag & Port Label Canvas Texture Generator                       */
/* -------------------------------------------------------------------------- */

function useLabelTexture(hub: HubData) {
  return useMemo(() => {
    const isBangladesh = hub.code === "BD";
    const scale = 2; // High-DPI 2x scale for crystal-clear retina badges
    const fontSize = (isBangladesh ? 26 : 24) * scale;
    const paddingX = (isBangladesh ? 16 : 14) * scale;
    const flagSize = (isBangladesh ? 32 : 28) * scale;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const text = `${hub.name} · ${hub.country}`;
    ctx.font = `bold ${fontSize}px "Segoe UI", -apple-system, sans-serif`;
    const textWidth = ctx.measureText(text).width;

    const flagWidth = flagSize + 10 * scale;
    const totalW = textWidth + flagWidth + paddingX * 2;
    const totalH = (28 + 20) * scale;

    canvas.width = Math.ceil(totalW);
    canvas.height = Math.ceil(totalH);

    const w = canvas.width;
    const h = canvas.height;
    const r = 13 * scale;

    // Glowing Pill Background
    if (isBangladesh) {
      ctx.shadowColor = "#00e5c0";
      ctx.shadowBlur = 14 * scale;
      ctx.fillStyle = "rgba(4, 26, 24, 0.96)";
      ctx.strokeStyle = "#00e5c0";
      ctx.lineWidth = 2.4 * scale;
    } else {
      ctx.shadowColor = "rgba(0, 201, 167, 0.45)";
      ctx.shadowBlur = 8 * scale;
      ctx.fillStyle = "rgba(7, 18, 19, 0.92)";
      ctx.strokeStyle = "rgba(0, 229, 192, 0.75)";
      ctx.lineWidth = 1.8 * scale;
    }

    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Draw National Flag Emoji
    ctx.font = `${flagSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillText(hub.flag, paddingX, h / 2 + 1);

    // Draw City and Country Text
    ctx.font = `600 ${fontSize}px "Segoe UI", -apple-system, sans-serif`;
    ctx.fillStyle = isBangladesh ? "#eafffa" : "#ffffff";
    const textStartX = paddingX + flagWidth;
    ctx.fillText(text, textStartX, h / 2 + 1);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return { texture: tex, aspect: canvas.width / canvas.height };
  }, [hub]);
}

/** Radial pulse glow texture for port beacons */
function useGlowTexture(hex: string) {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, `${hex}ff`);
    gradient.addColorStop(0.35, `${hex}88`);
    gradient.addColorStop(1, `${hex}00`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [hex]);
}

/* -------------------------------------------------------------------------- */
/*  Photorealistic Earth Shaders                                              */
/* -------------------------------------------------------------------------- */

const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPositionW;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vPositionW = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthFragmentShader = /* glsl */ `
  uniform sampler2D dayMap;
  uniform sampler2D nightMap;
  uniform sampler2D specularMap;
  uniform vec3 lightDirection;
  uniform vec3 rimColor;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPositionW;

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 L = normalize(lightDirection);
    vec3 V = normalize(cameraPosition - vPositionW);

    float sun = dot(N, L);
    float dayFactor = smoothstep(-0.2, 0.25, sun);

    vec3 dayColor = texture2D(dayMap, vUv).rgb;
    // Golden warm nighttime city lights
    vec3 nightColor = texture2D(nightMap, vUv).rgb * vec3(1.8, 1.35, 0.85);

    // Blend day and night
    vec3 color = mix(nightColor * 1.1, dayColor, dayFactor);

    // Oceanic specular sunlight glint
    float specMask = texture2D(specularMap, vUv).r;
    if (sun > 0.0) {
      vec3 H = normalize(L + V);
      float spec = pow(max(dot(N, H), 0.0), 32.0) * specMask;
      color += vec3(0.9, 0.95, 1.0) * spec * 0.9;
    }

    // Atmospheric limb scattering / rim glow
    float rim = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    color += rimColor * rim * 0.25;

    gl_FragColor = vec4(color, 1.0);
  }
`;

const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = /* glsl */ `
  uniform vec3 glowColor;
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
    gl_FragColor = vec4(glowColor, 1.0) * intensity * 1.2;
  }
`;

/* -------------------------------------------------------------------------- */
/*  Earth Sphere with Clouds & Atmosphere                                     */
/* -------------------------------------------------------------------------- */

function EarthSphere({ segments }: { segments: number }) {
  const [day, night, specular, clouds] = useTexture([
    TEXTURES.day,
    TEXTURES.night,
    TEXTURES.specular,
    TEXTURES.clouds,
  ]);

  const uniforms = useMemo(
    () => ({
      dayMap: { value: day },
      nightMap: { value: night },
      specularMap: { value: specular },
      lightDirection: { value: LIGHT_DIR },
      rimColor: { value: new THREE.Color("#00e5c0") },
    }),
    [day, night, specular]
  );

  const cloudsRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.024;
    }
  });

  return (
    <>
      {/* 1. Main Realistic Earth Body */}
      <mesh>
        <sphereGeometry args={[RADIUS, segments, segments]} />
        <shaderMaterial
          vertexShader={earthVertexShader}
          fragmentShader={earthFragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      {/* 2. Swirling Cloud Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[RADIUS * 1.008, segments, segments]} />
        <meshStandardMaterial
          map={clouds}
          alphaMap={clouds}
          transparent
          opacity={0.42}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Outer Atmospheric Rayleigh Halo */}
      <mesh scale={1.085}>
        <sphereGeometry args={[RADIUS, segments, segments]} />
        <shaderMaterial
          vertexShader={atmosphereVertexShader}
          fragmentShader={atmosphereFragmentShader}
          uniforms={{ glowColor: { value: new THREE.Color("#00e5c0") } }}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Procedural 3D Container Cargo Ship Model                                   */
/* -------------------------------------------------------------------------- */

function CargoShip3DModel() {
  return (
    <group scale={1.4}>
      {/* Ship Hull: Dark Maritime Navy Hull */}
      <mesh position={[0, 0.016, 0]}>
        <boxGeometry args={[0.046, 0.024, 0.15]} />
        <meshStandardMaterial color="#13222e" roughness={0.35} metalness={0.65} />
      </mesh>

      {/* Pointed Bow Wedge (Front of vessel) */}
      <mesh position={[0, 0.016, 0.09]} rotation={[0, Math.PI, 0]}>
        <coneGeometry args={[0.023, 0.038, 3]} />
        <meshStandardMaterial color="#13222e" roughness={0.35} metalness={0.65} />
      </mesh>

      {/* Red Waterline Anti-Fouling Keel */}
      <mesh position={[0, 0.003, 0.01]}>
        <boxGeometry args={[0.044, 0.008, 0.16]} />
        <meshStandardMaterial color="#b33939" roughness={0.6} />
      </mesh>

      {/* Bridge / Deckhouse Superstructure (Stern) */}
      <group position={[0, 0.036, -0.05]}>
        {/* White Navigation Cabin */}
        <mesh>
          <boxGeometry args={[0.04, 0.024, 0.03]} />
          <meshStandardMaterial color="#e0faf5" roughness={0.2} />
        </mesh>
        {/* Navigation Windows Band */}
        <mesh position={[0, 0.004, 0.012]}>
          <boxGeometry args={[0.036, 0.007, 0.01]} />
          <meshStandardMaterial color="#00e5c0" emissive="#00e5c0" emissiveIntensity={2} />
        </mesh>
        {/* White Masthead Beacon */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.002, 0.002, 0.016]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
        </mesh>
      </group>

      {/* Stacks of Multi-Colored Shipping Containers on Deck */}
      {/* Front Container Stack - Teal & Gold */}
      <mesh position={[-0.011, 0.032, 0.038]}>
        <boxGeometry args={[0.018, 0.015, 0.044]} />
        <meshStandardMaterial color="#00c9a7" emissive="#00c9a7" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.011, 0.032, 0.038]}>
        <boxGeometry args={[0.018, 0.015, 0.044]} />
        <meshStandardMaterial color="#f39c12" roughness={0.4} />
      </mesh>

      {/* Mid Container Stack - Crimson & Maritime Blue */}
      <mesh position={[-0.011, 0.032, -0.012]}>
        <boxGeometry args={[0.018, 0.015, 0.044]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.4} />
      </mesh>
      <mesh position={[0.011, 0.032, -0.012]}>
        <boxGeometry args={[0.018, 0.015, 0.044]} />
        <meshStandardMaterial color="#0984e3" roughness={0.4} />
      </mesh>

      {/* Starboard Green Navigation Light (Right) */}
      <mesh position={[0.025, 0.022, 0.055]}>
        <sphereGeometry args={[0.005, 8, 8]} />
        <meshStandardMaterial color="#00e5c0" emissive="#00e5c0" emissiveIntensity={4} />
      </mesh>

      {/* Port Red Navigation Light (Left) */}
      <mesh position={[-0.025, 0.022, 0.055]}>
        <sphereGeometry args={[0.005, 8, 8]} />
        <meshStandardMaterial color="#ff5252" emissive="#ff5252" emissiveIntensity={4} />
      </mesh>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Animated Container Ship Sailing on Great-Circle Trade Route Arc          */
/* -------------------------------------------------------------------------- */

function ActiveCargoShip({
  curve,
  speed,
  offset,
}: {
  curve: THREE.QuadraticBezierCurve3;
  speed: number;
  offset: number;
}) {
  const shipGroupRef = useRef<THREE.Group>(null);
  const tmpTangent = useMemo(() => new THREE.Vector3(), []);
  const tmpRight = useMemo(() => new THREE.Vector3(), []);
  const tmpUp = useMemo(() => new THREE.Vector3(), []);
  const rotMatrix = useMemo(() => new THREE.Matrix4(), []);

  useFrame((state) => {
    if (!shipGroupRef.current) return;

    // Advance ship along the curve based on elapsed time and speed
    const t = (state.clock.getElapsedTime() * speed + offset) % 1;
    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t, tmpTangent).normalize();

    // Normal vector pointing away from Earth center (perpendicular to surface)
    const normalOut = pos.clone().normalize();

    // Compute orthogonal basis: right, up, forward
    tmpRight.crossVectors(tangent, normalOut).normalize();
    tmpUp.crossVectors(tmpRight, tangent).normalize();

    // Orient ship: bow along tangent, deck facing skyward
    rotMatrix.makeBasis(tmpRight, tmpUp, tangent);

    shipGroupRef.current.position.copy(pos);
    shipGroupRef.current.quaternion.setFromRotationMatrix(rotMatrix);
  });

  return (
    <Trail
      width={1.6}
      length={7}
      color={new THREE.Color("#00e5c0")}
      attenuation={(t) => t * t}
      target={shipGroupRef as never}
    >
      <group ref={shipGroupRef}>
        <CargoShip3DModel />
      </group>
    </Trail>
  );
}

/* -------------------------------------------------------------------------- */
/*  Hub Marker with National Flag & Glowing Pulse                            */
/* -------------------------------------------------------------------------- */

function HubMarker({
  hub,
  position,
}: {
  hub: HubData;
  position: THREE.Vector3;
}) {
  const ringRef = useRef<THREE.Sprite>(null);
  const [hovered, setHovered] = useState(false);
  const isBangladesh = hub.code === "BD";

  const glowTex = useGlowTexture(isBangladesh ? "#00e5c0" : "#00c9a7");
  const { texture: labelTex, aspect } = useLabelTexture(hub);
  const seed = useMemo(() => (isBangladesh ? 0 : Math.random() * Math.PI * 2), [isBangladesh]);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = (state.clock.getElapsedTime() * (isBangladesh ? 1.2 : 0.9) + seed) % (Math.PI * 2);
    const pulse = 0.65 + Math.sin(t) * 0.25;
    ringRef.current.scale.setScalar((isBangladesh ? 0.44 : 0.34) * pulse);
    (ringRef.current.material as THREE.SpriteMaterial).opacity =
      hovered ? 0.98 : (isBangladesh ? 0.65 : 0.4) + Math.sin(t) * 0.18;
  });

  const outward = useMemo(() => position.clone().normalize(), [position]);
  const labelHeight = isBangladesh ? 0.19 : 0.17;

  return (
    <group position={position}>
      {/* 1. Pulsing Outer Halo */}
      <sprite ref={ringRef}>
        <spriteMaterial
          map={glowTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* 2. Emissive Port Beacon Sphere */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[isBangladesh ? 0.042 : 0.032, 16, 16]} />
        <meshStandardMaterial
          color={isBangladesh ? "#00e5c0" : "#00c9a7"}
          emissive={isBangladesh ? "#00e5c0" : "#00c9a7"}
          emissiveIntensity={hovered || isBangladesh ? 3.2 : 1.8}
        />
      </mesh>

      {/* 3. Floating Label Badge with National Flag */}
      <sprite
        position={outward.clone().multiplyScalar(isBangladesh ? 0.2 : 0.18)}
        scale={[labelHeight * aspect, labelHeight, 1]}
      >
        <spriteMaterial
          map={labelTex}
          transparent
          depthTest
          depthWrite={false}
          opacity={hovered || isBangladesh ? 1 : 0.94}
        />
      </sprite>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Trade Route Curved Arc Lines                                              */
/* -------------------------------------------------------------------------- */

function RouteArcLine({ 
  curve, 
  isPrimary 
}: { 
  curve: THREE.QuadraticBezierCurve3; 
  isPrimary?: boolean; 
}) {
  const points = useMemo(() => curve.getPoints(72), [curve]);
  return (
    <>
      {/* Soft atmospheric route glow */}
      <Line 
        points={points} 
        color={isPrimary ? "#00e5c0" : "#00c9a7"} 
        transparent 
        opacity={isPrimary ? 0.35 : 0.2} 
        lineWidth={isPrimary ? 5.5 : 4.2} 
      />
      {/* Crisp glowing core route beam */}
      <Line 
        points={points} 
        color={isPrimary ? "#eafffa" : "#7dffe8"} 
        transparent 
        opacity={isPrimary ? 0.95 : 0.78} 
        lineWidth={isPrimary ? 2.2 : 1.5} 
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Globe Group (Auto-spin + Centered on Bangladesh on Load)             */
/* -------------------------------------------------------------------------- */

// Mathematical orientation placing Chattogram, Bangladesh (91.83°E, 22.33°N)
// directly in the front center facing the user on first paint!
const INITIAL_ROTATION_Y = THREE.MathUtils.degToRad(178.2);

function InteractiveGlobe({ segments }: { segments: number }) {
  const globeRef = useRef<THREE.Group>(null);

  const hubVectors = useMemo(() => HUBS.map((h) => toVector3(h.lat, h.lon)), []);
  const curves = useMemo(
    () => ROUTES.map(([a, b]) => makeArc(hubVectors[a], hubVectors[b])),
    [hubVectors]
  );

  useFrame((_, delta) => {
    if (globeRef.current) {
      // Gentle continuous ambient rotation
      globeRef.current.rotation.y += delta * 0.028;
    }
  });

  return (
    <group ref={globeRef} rotation={[0, INITIAL_ROTATION_Y, 0]}>
      {/* Photorealistic Textured Earth */}
      <EarthSphere segments={segments} />

      {/* Port Hubs with National Flags */}
      {hubVectors.map((v, i) => (
        <HubMarker key={HUBS[i].id} hub={HUBS[i]} position={v} />
      ))}

      {/* Glowing Trade Route Arc Beams (Primary routes for Bangladesh highlighted) */}
      {curves.map((curve, i) => (
        <RouteArcLine 
          key={`route-${i}`} 
          curve={curve} 
          isPrimary={i < 4} // The 4 routes connected to Bangladesh are highlighted
        />
      ))}

      {/* Active Container Cargo Ships Sailing Across Trade Lanes */}
      {/* Primary ships directly sailing in & out of Bangladesh (Chattogram) */}
      {curves.slice(0, 4).map((curve, i) => (
        <ActiveCargoShip
          key={`ship-bd-${i}`}
          curve={curve}
          speed={0.045}
          offset={(i * 0.25) % 1}
        />
      ))}

      {/* Other international corridors */}
      {curves.map((curve, i) => (
        <ActiveCargoShip
          key={`ship-global-${i}`}
          curve={curve}
          speed={0.036 + (i % 3) * 0.007}
          offset={(i * 0.19 + 0.35) % 1}
        />
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Scene Canvas Wrapper                                                      */
/* -------------------------------------------------------------------------- */

function GlobeScene() {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        frameloop={inView ? "always" : "never"}
        dpr={[1, 2]}
        gl={{ powerPreference: "high-performance", antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault fov={44} position={[0, 0.25, 6.6]} />
          
          {/* Deep space stars */}
          <Stars radius={100} depth={40} count={1800} factor={3} saturation={0.5} fade speed={1} />

          {/* Lighting */}
          <ambientLight intensity={0.55} />
          <directionalLight position={LIGHT_DIR.toArray()} intensity={1.5} color="#eafcf7" />

          {/* Interactive Smooth Orbit Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
            rotateSpeed={0.65}
            dampingFactor={0.06}
            minPolarAngle={Math.PI / 4.2}
            maxPolarAngle={Math.PI * 3 / 4.2}
          />

          <InteractiveGlobe segments={48} />
        </Suspense>
      </Canvas>

      {/* Hint overlay to rotate */}
      <div className="pointer-events-none absolute bottom-3 right-4 flex items-center gap-1.5 text-[10px] font-mono text-[#00c9a7] bg-[#071313]/85 px-2.5 py-1 rounded-full border border-[#1a4a4a] backdrop-blur-sm">
        <Compass className="h-3 w-3 animate-spin" style={{ animationDuration: "8s" }} />
        <span>DRAG TO ROTATE GLOBE</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Public Section                                                            */
/* -------------------------------------------------------------------------- */

const STATS = [
  { value: "190+", label: "Countries connected", icon: Globe2 },
  { value: "1,200+", label: "Active vessel lanes", icon: ShipIcon },
  { value: "24/7", label: "Real-time AIS tracking", icon: Anchor },
];

export function GlobalNetwork() {
  return (
    <section
      id="global-network"
      className="relative py-12 md:py-20 border-b border-[#1a4a4a]/40 bg-[#0a0f0f]"
    >
      <div className={`${CONTAINER_CLASS} grid lg:grid-cols-2 gap-12 lg:gap-16 items-center`}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00c9a7]/30 bg-[#00c9a7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00c9a7] mb-3">
            <Globe2 className="h-3.5 w-3.5" />
            Global Maritime Network
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight bg-linear-to-r from-[#00c9a7] via-[#00e5c0] to-[#00b4d8] bg-clip-text text-transparent">
            One network.
            <br />
            Every destination.
          </h2>
          <p className="text-base md:text-lg leading-relaxed max-w-md mb-8 text-[#7ecfc4]">
            Connect your freight operations across borders, ports, carriers,
            and destinations from one intelligent platform — with live AIS vessel tracking
            connecting Chattogram, Singapore, Shanghai, Dubai, Rotterdam, and Los Angeles.
          </p>

          <div className="flex flex-wrap gap-6 mb-4">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border border-[#1a4a4a]/60 bg-[#0d1f1f]/60 p-3.5 min-w-[130px]">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-[#00c9a7]" />
                    <span className="text-2xl font-bold text-[#e0faf5] font-mono">{s.value}</span>
                  </div>
                  <div className="text-xs text-[#7ecfc4]">{s.label}</div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 3D Realistic Interactive Earth Globe Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative h-[420px] md:h-[520px] lg:h-[600px] rounded-3xl overflow-hidden border border-[#1a4a4a] bg-linear-to-b from-[#081212] to-[#040808] shadow-[0_0_50px_rgba(0,200,180,0.08)]"
        >
          <GlobeScene />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 60%, rgba(10,15,15,0.7) 100%)",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}

export default GlobalNetwork;
