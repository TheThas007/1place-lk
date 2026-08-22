"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { isWebGLAvailable, prefersReducedMotion, isLowPowerDevice } from "@/lib/webgl-utils";

function SnowParticles({ count = 10000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particles
  const [[positions, speeds]] = useState(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      speeds[i] = 0.1 + Math.random() * 0.5;
    }
    
    return [positions, speeds] as const;
  });

  useFrame((state, delta) => {
    if (!pointsRef.current || (typeof document !== "undefined" && document.hidden)) return;
    
    const time = state.clock.getElapsedTime();
    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const array = positionsAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      array[i3 + 1] -= speeds[i] * delta * 5;
      array[i3] += Math.sin(time + speeds[i] * 10) * delta * 0.5;

      if (array[i3 + 1] < -50) {
        array[i3 + 1] = 50;
        array[i3] = (Math.random() - 0.5) * 100;
      }
    }
    
    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function SnowEffect() {
  const [canRender] = useState(() => {
    if (typeof window === "undefined") return false;
    return !prefersReducedMotion() && !isLowPowerDevice() && isWebGLAvailable();
  });

  if (!canRender) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ powerPreference: "low-power", antialias: false, failIfMajorPerformanceCaveat: true }}
      >
        <React.Suspense fallback={null}>
          <SnowParticles count={8000} />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
