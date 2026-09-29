"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import ErrorBoundary from "./ErrorBoundary";
import dynamic from "next/dynamic";

const Wig360Viewer = dynamic(() => import("./Wig360Viewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  ),
});

interface WigStyle {
  name: string;
  type: string;
  description: string;
  color: string;
  coverage: "full" | "patch" | "frontal";
  viewerConfig?: {
    id: string;
    basePath: string;
    frameCount: number;
  };
}

const wigStyles: WigStyle[] = [
  {
    name: "Classic Full Coverage",
    type: "Hair Wig",
    description: "Complete coverage with natural-looking density. Breathable micro-mesh base for all-day comfort.",
    color: "#1a1008",
    coverage: "full",
    viewerConfig: {
      id: "wig-1",
      basePath: "/wigs/wig-1/",
      frameCount: 36,
    }
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
  const current = wigStyles[activeWig];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center">
      {/* Viewer Box */}
      <div
        className="h-[450px] md:h-[550px] w-full rounded-lg overflow-hidden border border-outline-variant/30 bg-surface-container-lowest relative shadow-xl"
      >
        <ErrorBoundary>
          {current.viewerConfig ? (
            <Wig360Viewer
              key={current.viewerConfig.id} // Re-mount when wig changes
              basePath={current.viewerConfig.basePath}
              frameCount={current.viewerConfig.frameCount}
              autoRotate={true}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-[#F3EEFB] text-primary">
              <span className="material-symbols-outlined text-5xl mb-4 opacity-50">3d_rotation</span>
              <p className="font-label-lg text-label-lg uppercase tracking-widest opacity-70">Preview coming soon</p>
            </div>
          )}
        </ErrorBoundary>
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
              className={`p-4 rounded border text-left transition-all duration-300 ${i === activeWig
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
