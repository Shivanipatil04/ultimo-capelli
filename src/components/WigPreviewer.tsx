"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import ErrorBoundary from "./ErrorBoundary";

interface WigStyle {
  name: string;
  type: string;
  description: string;
  color: string;
  coverage: "full" | "patch" | "frontal";
}

const wigStyles: WigStyle[] = [
  {
    name: "Classic Full Coverage",
    type: "Hair Wig",
    description: "Complete coverage with natural-looking density. Breathable micro-mesh base for all-day comfort.",
    color: "#1a1008",
    coverage: "full",
  },
  {
    name: "Crown Patch System",
    type: "Hair Patch",
    description: "Targeted restoration for crown thinning. Custom-molded to blend seamlessly with existing hair.",
    color: "#2c1a0e",
    coverage: "patch",
  },
  {
    name: "Frontal Hairline",
    type: "Hair Patch",
    description: "Natural hairline recreation. Ultra-thin lace front for an undetectable finish.",
    color: "#1f1510",
    coverage: "frontal",
  },
  {
    name: "Premium Wave",
    type: "Hair Wig",
    description: "Wavy texture full wig with premium European hair. Styled for a sophisticated look.",
    color: "#15100a",
    coverage: "full",
  },
];

function MannequinHead({ wigColor, coverage }: { wigColor: string; coverage: string }) {
  const headRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (headRef.current) {
      headRef.current.rotation.y += 0.002;
    }
  });

  // Head geometry - an elongated sphere
  const headGeometry = useMemo(() => new THREE.SphereGeometry(1.4, 64, 64), []);

  // Wig geometry based on coverage
  const wigGeometry = useMemo(() => {
    if (coverage === "full") {
      // Full cap - top half of a slightly larger sphere
      const geo = new THREE.SphereGeometry(1.48, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.6);
      return geo;
    } else if (coverage === "patch") {
      // Crown patch - small cap on top
      const geo = new THREE.SphereGeometry(1.5, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.35);
      return geo;
    } else {
      // Frontal - front arc
      const geo = new THREE.SphereGeometry(1.48, 48, 48, -Math.PI * 0.4, Math.PI * 0.8, 0, Math.PI * 0.45);
      return geo;
    }
  }, [coverage]);

  return (
    <group ref={headRef}>
      {/* Head base */}
      <mesh geometry={headGeometry} scale={[1, 1.15, 1]}>
        <meshStandardMaterial color="#e8d5c4" roughness={0.7} metalness={0} />
      </mesh>

      {/* Ears */}
      <mesh position={[-1.35, -0.1, 0]} rotation={[0, 0, Math.PI * 0.1]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#e0c8b5" roughness={0.7} />
      </mesh>
      <mesh position={[1.35, -0.1, 0]} rotation={[0, 0, -Math.PI * 0.1]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#e0c8b5" roughness={0.7} />
      </mesh>

      {/* Nose hint */}
      <mesh position={[0, -0.1, 1.35]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#dcc0ac" roughness={0.6} />
      </mesh>

      {/* Wig */}
      <mesh geometry={wigGeometry} position={[0, 0.08, 0]} scale={[1, 1.15, 1]}>
        <meshStandardMaterial
          color={wigColor}
          roughness={0.9}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wig edge glow */}
      <mesh geometry={wigGeometry} position={[0, 0.08, 0]} scale={[1.01, 1.16, 1.01]}>
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={0.2}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pedestal */}
      <mesh position={[0, -2.2, 0]}>
        <cylinderGeometry args={[0.8, 1, 0.3, 32]} />
        <meshStandardMaterial color="#E2D8F0" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[0, -1.4, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1.4, 16]} />
        <meshStandardMaterial color="#D4CCE3" roughness={0.5} metalness={0.1} />
      </mesh>
    </group>
  );
}

export default function WigPreviewer() {
  const [activeWig, setActiveWig] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true); // default true for SSR, corrected in useEffect
  const current = wigStyles[activeWig];

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
      {/* 3D Canvas */}
      <div
        className="h-[450px] md:h-[550px] w-full rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container-lowest relative shadow-xl"
        {...(interacting && !isDesktop ? { "data-lenis-prevent": "true" } : {})}
      >
        <ErrorBoundary>
          <Canvas
            camera={{ position: [0, 0, 5.5], fov: 40 }}
            gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
            dpr={[1, 1.5]}
            style={{
              background: "linear-gradient(180deg, #F3EEFB 0%, #EDE5F7 100%)",
              touchAction: interacting || isDesktop ? "none" : "pan-y",
            }}
          >
            <ambientLight intensity={0.8} color="#F3EEFB" />
            <directionalLight position={[3, 4, 5]} intensity={1.2} color="#FFFFFF" />
            <pointLight position={[-3, 2, 3]} intensity={0.4} color="#A78BFA" distance={15} />
            <MannequinHead wigColor={current.color} coverage={current.coverage} />
            <OrbitControls
              enableZoom={isDesktop || interacting}
              enableRotate={isDesktop || interacting}
              enablePan={false}
              minDistance={3.5}
              maxDistance={8}
              minPolarAngle={Math.PI * 0.2}
              maxPolarAngle={Math.PI * 0.7}
              autoRotate={false}
            />
          </Canvas>
        </ErrorBoundary>

        {/* Mobile: Tap to Interact overlay (hidden on hover-capable devices) */}
        {!interacting && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer lg:hidden"
            onClick={() => setInteracting(true)}
          >
            <div className="bg-white/90 backdrop-blur-sm border border-primary/20 px-6 py-3 rounded-full shadow-card flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
              <span className="material-symbols-outlined text-primary text-xl">3d_rotation</span>
              <span className="font-label-lg text-label-lg text-primary uppercase tracking-widest">Tap to Interact</span>
            </div>
          </div>
        )}

        {/* Mobile: Done button when interacting */}
        {interacting && (
          <button
            className="absolute top-3 right-3 z-20 bg-primary text-on-primary px-4 py-2 rounded-full font-label-md text-label-md uppercase tracking-widest shadow-card transition-all hover:bg-primary/90 active:scale-95 lg:hidden"
            onClick={() => setInteracting(false)}
          >
            Done
          </button>
        )}

        <div className="absolute bottom-4 left-4 bg-surface/80 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant/30 pointer-events-none z-10">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">
            Drag to rotate · Scroll to zoom
          </span>
        </div>
      </div>

      {/* Info Panel */}
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="font-headline-lg text-headline-lg text-on-dark mb-2">{current.name}</h3>
          <span className="inline-block px-3 py-1 border border-accent-glow text-accent-glow font-label-md text-label-md uppercase tracking-widest mb-4">
            {current.type}
          </span>
          <p className="font-body-lg text-body-lg text-on-dark-variant">{current.description}</p>
        </div>

        {/* Wig selector buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {wigStyles.map((wig, i) => (
            <button
              key={wig.name}
              onClick={() => setActiveWig(i)}
              className={`p-4 rounded border text-left transition-all duration-300 ${
                i === activeWig
                  ? "border-accent-glow bg-primary/20 shadow-lg shadow-primary/10"
                  : "border-white/10 bg-white/5 hover:border-accent-glow/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-6 h-6 rounded-full border-2"
                  style={{
                    backgroundColor: wig.color,
                    borderColor: i === activeWig ? "#A78BFA" : "#6B6580",
                  }}
                />
                <span className="font-label-lg text-label-lg text-on-dark">{wig.name}</span>
              </div>
              <span className="font-body-sm text-body-sm text-on-dark-variant">{wig.type}</span>
            </button>
          ))}
        </div>

        <button onClick={() => {
          const contact = document.getElementById("contact");
          if (contact) contact.scrollIntoView({ behavior: "smooth" });
        }} className="bg-primary text-on-primary px-8 py-4 font-label-lg text-label-lg uppercase tracking-widest hover:bg-primary/90 transition-all rounded-lg font-bold w-full md:w-auto shadow-soft hover:shadow-card">
          Book a Fitting Consultation
        </button>
      </div>
    </div>
  );
}
