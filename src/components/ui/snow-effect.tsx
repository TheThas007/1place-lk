"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function SnowParticles({ count = 50000 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particles
  const [positions, speeds] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Spread particles across a wide area (x: -50 to 50, y: -50 to 50, z: -20 to 20)
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      
      // Speed multiplier for variation
      speeds[i] = 0.1 + Math.random() * 0.5;
    }
    
    return [positions, speeds];
  }, [count]);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const array = positionsAttr.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Move downward
      array[i3 + 1] -= speeds[i] * delta * 5;
      
      // Sway side to side slightly
      array[i3] += Math.sin(time + speeds[i] * 10) * delta * 0.5;

      // Reset if it goes below the screen
      if (array[i3 + 1] < -50) {
        array[i3 + 1] = 50;
        array[i3] = (Math.random() - 0.5) * 100; // Reset X to random
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
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
        <React.Suspense fallback={null}>
          <SnowParticles count={50000} />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
