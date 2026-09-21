"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import ErrorBoundary from "./ErrorBoundary";

function MannequinHead() {
  const headRef = useRef<THREE.Group>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRotation = useRef({ x: 0, y: 0 });

  // Mouse-reactive tilt (desktop only — touch doesn't fire mousemove)
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const headGeometry = useMemo(() => new THREE.SphereGeometry(1.4, 64, 64), []);
  const wigGeometry = useMemo(() => {
    return new THREE.SphereGeometry(1.48, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.6);
  }, []);

  useFrame((_, delta) => {
    if (!headRef.current) return;

    // Slow auto-rotation + mouse tilt
    targetRotation.current.y += delta * 0.15;
    const mouseInfluenceX = mouseRef.current.x * 0.4;
    const mouseInfluenceY = mouseRef.current.y * 0.2;

    const targetY = targetRotation.current.y + mouseInfluenceX;
    const targetX = mouseInfluenceY;

    headRef.current.rotation.y = THREE.MathUtils.damp(headRef.current.rotation.y, targetY, 4, delta);
    headRef.current.rotation.x = THREE.MathUtils.damp(headRef.current.rotation.x, targetX, 4, delta);
  });

  return (
    <group ref={headRef} position={[0, -0.3, 0]}>
      {/* Head base */}
      <mesh geometry={headGeometry} scale={[1, 1.15, 1]}>
        <meshStandardMaterial color="#e8d5c4" roughness={0.6} metalness={0.05} />
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

      {/* Nose */}
      <mesh position={[0, -0.1, 1.35]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#dcc0ac" roughness={0.6} />
      </mesh>

      {/* Wig — dark luxurious hair */}
      <mesh geometry={wigGeometry} position={[0, 0.08, 0]} scale={[1, 1.15, 1]}>
        <meshStandardMaterial color="#1a1008" roughness={0.85} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {/* Wig edge subtle highlight */}
      <mesh geometry={wigGeometry} position={[0, 0.08, 0]} scale={[1.01, 1.16, 1.01]}>
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={0.15}
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating ring accent */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
        <torusGeometry args={[1.8, 0.01, 16, 64]} />
        <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={1} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// Soft floating particles for depth
function SoftParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 60;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#A78BFA" size={0.04} transparent opacity={0.3} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function HeroHead() {
  return (
    <div className="w-full h-full relative" style={{ touchAction: "pan-y" }}>
      <ErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 5.5], fov: 40 }}
          gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
          dpr={[1, 1.5]}
          style={{ background: "transparent", touchAction: "pan-y" }}
        >
          <ambientLight intensity={0.7} color="#F3EEFB" />
          <directionalLight position={[4, 4, 5]} intensity={1.2} color="#FFFFFF" />
          <pointLight position={[-3, 2, 3]} intensity={0.4} color="#A78BFA" distance={15} />
          <pointLight position={[2, -1, 4]} intensity={0.3} color="#7C3AED" distance={12} />
          <MannequinHead />
          <SoftParticles />
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}

