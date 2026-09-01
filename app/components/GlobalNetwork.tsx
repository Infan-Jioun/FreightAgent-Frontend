"use client";

/**
 * GlobalNetwork — FreightAgent
 * ---------------------------------------------------------------------------
 * Realistic textured 3D Earth with day/night terminator, cloud layer,
 * atmospheric rim glow, animated great-circle shipping routes, and small
 * ships that sail along each route leaving a fading wake.
 *
 * Textures: NASA Blue Marble set shipped with the three.js repo (public
 * domain / demo assets). For production, download these once and serve them
 * from /public/textures/earth/ instead of hot-linking raw.githubusercontent.com
 * (it's not a CDN and has no uptime guarantee):
 *   https://github.com/mrdoob/three.js/tree/dev/examples/textures/planets
 *
 * Container width/padding is imported from the shared layout constant
 * (constants/layout.ts), which is itself taken from Navbar.tsx. Update that
 * one file if the navbar's container ever changes, and every section
 * (including this one) stays in sync automatically.
 */

import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Line,
  PerspectiveCamera,
  useTexture,
  Trail,
  Stars,
} from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { CONTAINER_CLASS } from "./ContainsLayout";

/* -------------------------------------------------------------------------- */
/*  Network data                                                              */
/* -------------------------------------------------------------------------- */

const HUBS = [
  { name: "New York", country: "United States", lat: 40.7, lon: -74.0 },
  { name: "Rotterdam", country: "Netherlands", lat: 51.9, lon: 4.5 },
  { name: "Dubai", country: "UAE", lat: 25.2, lon: 55.3 },
  { name: "Singapore", country: "Singapore", lat: 1.35, lon: 103.8 },
  { name: "Shanghai", country: "China", lat: 31.2, lon: 121.5 },
  { name: "Los Angeles", country: "United States", lat: 34.0, lon: -118.2 },
  { name: "Hamburg", country: "Germany", lat: 53.5, lon: 10.0 },
  { name: "Mumbai", country: "India", lat: 19.1, lon: 72.9 },
  { name: "Sydney", country: "Australia", lat: -33.9, lon: 151.2 },
] as const;

const ROUTES: [number, number][] = [
  [4, 2], // Shanghai -> Dubai
  [2, 1], // Dubai -> Rotterdam
  [0, 6], // New York -> Hamburg
  [5, 4], // LA -> Shanghai
  [3, 7], // Singapore -> Mumbai
  [4, 8], // Shanghai -> Sydney
  [3, 2], // Singapore -> Dubai
];

const RADIUS = 2.4;
const LIGHT_DIR = new THREE.Vector3(4, 1.6, 3).normalize();

const TEXTURES = {
  day: "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg",
  night:
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_lights_2048.png",
  specular:
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg",
  clouds:
    "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png",
};

/* -------------------------------------------------------------------------- */
/*  Geometry helpers                                                          */
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
  mid.setLength(RADIUS * (1 + a.distanceTo(b) / (RADIUS * 6)));
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  curve.arcLengthDivisions = 100;
  return curve;
}

/** Small radial-gradient sprite texture, used for glow rings & port halos. */
function useGlowTexture(hex: string) {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
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

/** Small pill-shaped label texture ("City · Country") for always-on hub tags. */
function useLabelTexture(text: string) {
  return useMemo(() => {
    const fontSize = 34;
    const paddingX = 18;
    const measure = document.createElement("canvas").getContext("2d")!;
    measure.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    const textWidth = measure.measureText(text).width;

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(textWidth + paddingX * 2);
    canvas.height = fontSize + 22;
    const ctx = canvas.getContext("2d")!;
    ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";

    const w = canvas.width;
    const h = canvas.height;
    const r = 10;
    ctx.fillStyle = "rgba(6,16,16,0.82)";
    ctx.strokeStyle = "rgba(0,229,192,0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(w, 0, w, h, r);
    ctx.arcTo(w, h, 0, h, r);
    ctx.arcTo(0, h, 0, 0, r);
    ctx.arcTo(0, 0, w, 0, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#eafffa";
    ctx.fillText(text, paddingX, h / 2 + 1);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return { texture: tex, aspect: canvas.width / canvas.height };
  }, [text]);
}

/* -------------------------------------------------------------------------- */
/*  Day / night earth material                                                */
/* -------------------------------------------------------------------------- */

const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
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

  void main() {
    float sun = dot(vNormalW, normalize(lightDirection));
    float mixFactor = smoothstep(-0.18, 0.15, sun);

    vec3 day = texture2D(dayMap, vUv).rgb;
    vec3 night = texture2D(nightMap, vUv).rgb * vec3(1.4, 1.15, 0.75);
    vec3 color = mix(night * 0.9, day, mixFactor);

    float spec = texture2D(specularMap, vUv).r;
    color += spec * pow(max(sun, 0.0), 5.0) * 0.25;

    // faint teal edge-light so the sphere reads as premium tech, not stock photo
    float rim = pow(1.0 - max(dot(vNormalW, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);
    color += rimColor * rim * 0.12;

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
    float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
    gl_FragColor = vec4(glowColor, 1.0) * intensity;
  }
`;

/* -------------------------------------------------------------------------- */
/*  Earth + clouds + atmosphere                                               */
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
    if (cloudsRef.current) cloudsRef.current.rotation.y += delta * 0.028;
  });

  return (
    <>
      <mesh>
        <sphereGeometry args={[RADIUS, segments, segments]} />
        <shaderMaterial
          vertexShader={earthVertexShader}
          fragmentShader={earthFragmentShader}
          uniforms={uniforms}
        />
      </mesh>

      <mesh ref={cloudsRef}>
        <sphereGeometry args={[RADIUS * 1.008, segments, segments]} />
        <meshStandardMaterial
          map={clouds}
          alphaMap={clouds}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.09}>
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
/*  Hub marker — pulsing halo + emissive dot + hover label                    */
/* -------------------------------------------------------------------------- */

function HubMarker({
  position,
  name,
  country,
}: {
  position: THREE.Vector3;
  name: string;
  country: string;
}) {
  const ringRef = useRef<THREE.Sprite>(null);
  const [hovered, setHovered] = useState(false);
  const glowTex = useGlowTexture("#00e5c0");
  const { texture: labelTex, aspect } = useLabelTexture(`${name} · ${country}`);
  const seed = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ringRef.current) return;
    const t = (state.clock.getElapsedTime() * 0.9 + seed) % (Math.PI * 2);
    const pulse = 0.6 + Math.sin(t) * 0.25;
    ringRef.current.scale.setScalar(0.32 * pulse);
    (ringRef.current.material as THREE.SpriteMaterial).opacity =
      hovered ? 0.9 : 0.35 + Math.sin(t) * 0.15;
  });

  // Radial direction from globe center through this hub — used to float the
  // label just off the surface. depthTest on the sprite material means it
  // gets hidden behind the globe automatically when it rotates to the far
  // side, so labels never float on top of the "wrong" hemisphere.
  const outward = useMemo(() => position.clone().normalize(), [position]);
  const labelHeight = 0.15;

  return (
    <group position={position}>
      <sprite ref={ringRef}>
        <spriteMaterial
          map={glowTex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshStandardMaterial
          color="#00e5c0"
          emissive="#00e5c0"
          emissiveIntensity={hovered ? 2.4 : 1.4}
        />
      </mesh>

      <sprite
        position={outward.clone().multiplyScalar(0.16)}
        scale={[labelHeight * aspect, labelHeight, 1]}
      >
        <spriteMaterial
          map={labelTex}
          transparent
          depthTest
          depthWrite={false}
          opacity={hovered ? 1 : 0.92}
        />
      </sprite>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shipment — a little ship sailing the arc with a fading wake               */
/* -------------------------------------------------------------------------- */

function Shipment({
  curve,
  speed,
  offset,
}: {
  curve: THREE.QuadraticBezierCurve3;
  speed: number;
  offset: number;
}) {
  const shipRef = useRef<THREE.Group>(null);
  const tmpTangent = useMemo(() => new THREE.Vector3(), []);
  const tmpTarget = useMemo(() => new THREE.Vector3(), []);
  const tmpUp = useMemo(() => new THREE.Vector3(), []);
  const tmpMatrix = useMemo(() => new THREE.Matrix4(), []);

  useFrame((state) => {
    if (!shipRef.current) return;
    const t = (state.clock.getElapsedTime() * speed + offset) % 1;
    const pos = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t, tmpTangent);
    tmpUp.copy(pos).normalize();
    tmpTarget.copy(pos).add(tangent);
    tmpMatrix.lookAt(pos, tmpTarget, tmpUp);
    shipRef.current.position.copy(pos);
    shipRef.current.quaternion.setFromRotationMatrix(tmpMatrix);
  });

  return (
    <Trail
      width={1.4}
      length={5}
      color={new THREE.Color("#00e5c0")}
      attenuation={(t) => t * t}
      target={shipRef as never}
    >
      <group ref={shipRef}>
        {/* little hull, nose pointing toward +Z (curve tangent) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.026, 0.075, 3]} />
          <meshStandardMaterial
            color="#eafffa"
            emissive="#00e5c0"
            emissiveIntensity={2}
          />
        </mesh>
      </group>
    </Trail>
  );
}

/* -------------------------------------------------------------------------- */
/*  Route arc line                                                            */
/* -------------------------------------------------------------------------- */

function RouteArc({ curve }: { curve: THREE.QuadraticBezierCurve3 }) {
  const points = useMemo(() => curve.getPoints(64), [curve]);
  return (
    <>
      {/* soft outer glow */}
      <Line points={points} color="#00e5c0" transparent opacity={0.18} lineWidth={4} />
      {/* crisp core line */}
      <Line points={points} color="#7dffe8" transparent opacity={0.65} lineWidth={1.4} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Globe group — auto-rotate + gentle pointer parallax                       */
/* -------------------------------------------------------------------------- */

// Most hubs (Dubai, Singapore, Shanghai, Mumbai) cluster over the Eastern
// hemisphere, so the globe starts already turned to face that side — the
// network reads as "connected" on first paint instead of only after the
// auto-rotate has spun halfway around.
const INITIAL_ROTATION_Y = THREE.MathUtils.degToRad(200);

function Globe({ segments }: { segments: number }) {
  const globeRef = useRef<THREE.Group>(null);
  const tiltRef = useRef<THREE.Group>(null);
  const targetTiltX = useRef(0);

  const hubVectors = useMemo(() => HUBS.map((h) => toVector3(h.lat, h.lon)), []);
  const curves = useMemo(
    () => ROUTES.map(([a, b]) => makeArc(hubVectors[a], hubVectors[b])),
    [hubVectors]
  );

  useFrame((state, delta) => {
    if (!globeRef.current || !tiltRef.current) return;

    // slight interactive tilt toward the pointer, layered on the auto-spin
    targetTiltX.current = state.pointer.y * 0.12;

    globeRef.current.rotation.y += delta * 0.05;
    tiltRef.current.rotation.x = THREE.MathUtils.lerp(
      tiltRef.current.rotation.x,
      targetTiltX.current,
      0.03
    );
  });

  return (
    <group ref={globeRef} rotation={[0, INITIAL_ROTATION_Y, 0]}>
      <group ref={tiltRef}>
        <EarthSphere segments={segments} />

        {hubVectors.map((v, i) => (
          <HubMarker
            key={HUBS[i].name}
            position={v}
            name={HUBS[i].name}
            country={HUBS[i].country}
          />
        ))}

        {curves.map((curve, i) => (
          <RouteArc key={i} curve={curve} />
        ))}

        {curves.map((curve, i) => (
          <Shipment
            key={i}
            curve={curve}
            speed={0.045 + (i % 3) * 0.01}
            offset={i / curves.length}
          />
        ))}
      </group>
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*  Responsive quality                                                        */
/* -------------------------------------------------------------------------- */

function useQualityTier() {
  const [tier, setTier] = useState<"desktop" | "tablet" | "mobile">("desktop");
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setTier(w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return tier;
}

/* -------------------------------------------------------------------------- */
/*  Scene wrapper                                                             */
/* -------------------------------------------------------------------------- */

function Scene() {
  const tier = useQualityTier();
  const segments = tier === "mobile" ? 32 : tier === "tablet" ? 48 : 64;
  const dpr: [number, number] = tier === "mobile" ? [1, 1] : [1, 1.6];

  return (
    <Canvas dpr={dpr} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault fov={45} position={[0, 0.4, 6.5]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={LIGHT_DIR.toArray()} intensity={1.4} color="#eafcf7" />
        {tier !== "mobile" && (
          <Stars radius={60} depth={30} count={1200} factor={1.4} fade speed={0.4} />
        )}
        <Globe segments={segments} />
      </Suspense>
    </Canvas>
  );
}

/* -------------------------------------------------------------------------- */
/*  Public section                                                            */
/* -------------------------------------------------------------------------- */

const STATS = [
  { value: "190+", label: "Countries covered" },
  { value: "1,200+", label: "Active routes" },
  { value: "24/7", label: "Live tracking" },
];

export function GlobalNetwork() {
  return (
    <section
      id="global-network"
      className="relative pt-10 md:pt-14 pb-20 md:pb-28"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className={`${CONTAINER_CLASS} grid lg:grid-cols-2 gap-12 lg:gap-16 items-center`}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p
            className="text-xs font-semibold tracking-[0.2em] mb-3 uppercase"
            style={{ color: "var(--accent-primary)" }}
          >
            Global logistics network
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold mb-6 leading-[1.1] bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--gradient-brand)" }}
          >
            One network.
            <br />
            Every destination.
          </h2>
          <p
            className="text-base md:text-lg leading-relaxed max-w-md mb-10"
            style={{ color: "var(--text-secondary)" }}
          >
            Connect your freight operations across borders, ports, carriers,
            and destinations from one intelligent platform — from Shanghai to
            Rotterdam, Dubai to Los Angeles.
          </p>

          <div className="flex flex-wrap gap-8">
            {STATS.map((s) => (
              <div key={s.label}>
                <div
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {s.value}
                </div>
                <div
                  className="text-xs mt-1 tracking-wide"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative h-[380px] md:h-[480px] lg:h-[560px] rounded-3xl overflow-hidden"
          style={{ border: "1px solid var(--border-primary)" }}
        >
          <Scene />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, rgba(10,15,15,0.55) 100%)",
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}

export default GlobalNetwork;