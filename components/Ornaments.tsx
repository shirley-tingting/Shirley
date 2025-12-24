import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

interface OrnamentLayerProps {
  count: number;
  type: 'HEAVY' | 'LIGHT' | 'TINY';
  geometry: THREE.BufferGeometry;
  color: string;
  emissive?: string;
  scale: number;
}

const OrnamentLayer: React.FC<OrnamentLayerProps> = ({ count, type, geometry, color, emissive, scale }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const mode = useStore((state) => state.mode);
  
  // Data generation
  const data = useMemo(() => {
    const scatterPos = new Float32Array(count * 3);
    const treePos = new Float32Array(count * 3);
    const rotations = new Float32Array(count * 3);
    const randoms = new Float32Array(count); // Used for offset timing

    const treeHeight = 11;
    const treeRadius = 4.2;

    for (let i = 0; i < count; i++) {
      // Scatter Sphere
      const r = 18 * Math.cbrt(Math.random()); 
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      scatterPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      scatterPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      scatterPos[i * 3 + 2] = r * Math.cos(phi);

      // Tree Surface
      const hRatio = Math.random();
      const y = (hRatio * treeHeight) - (treeHeight / 2);
      // Place more on the surface rather than inside
      const currentRadius = (treeRadius * (1 - hRatio)) * (0.8 + 0.2 * Math.random()); 
      const angle = Math.random() * Math.PI * 2;
      
      treePos[i * 3] = currentRadius * Math.cos(angle);
      treePos[i * 3 + 1] = y;
      treePos[i * 3 + 2] = currentRadius * Math.sin(angle);

      rotations[i * 3] = Math.random() * Math.PI;
      rotations[i * 3 + 1] = Math.random() * Math.PI;
      rotations[i * 3 + 2] = Math.random() * Math.PI;

      randoms[i] = Math.random();
    }
    return { scatterPos, treePos, rotations, randoms };
  }, [count]);

  // Current animation progress
  const progressRef = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Weight factor: Heavy items move slower
    const weightSpeed = type === 'HEAVY' ? 0.015 : type === 'LIGHT' ? 0.025 : 0.035;
    const target = mode === 'TREE_SHAPE' ? 1 : 0;
    
    // Smooth damp towards target
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, weightSpeed);

    const t = progressRef.current;
    // Cubic ease
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    for (let i = 0; i < count; i++) {
      const x = THREE.MathUtils.lerp(data.scatterPos[i*3], data.treePos[i*3], easeT);
      const y = THREE.MathUtils.lerp(data.scatterPos[i*3+1], data.treePos[i*3+1], easeT);
      const z = THREE.MathUtils.lerp(data.scatterPos[i*3+2], data.treePos[i*3+2], easeT);

      // Add floating noise
      const time = state.clock.elapsedTime;
      const rnd = data.randoms[i];
      // When scattered (t=0), float more. When tree (t=1), subtle breathe.
      const floatAmp = THREE.MathUtils.lerp(0.8, 0.05, easeT);
      
      tempObject.position.set(
        x + Math.sin(time + rnd * 10) * floatAmp,
        y + Math.cos(time * 0.8 + rnd * 20) * floatAmp,
        z + Math.sin(time * 0.5 + rnd * 30) * floatAmp
      );

      // Rotation logic
      tempObject.rotation.set(
        data.rotations[i*3] + time * 0.2,
        data.rotations[i*3+1] + time * 0.1,
        data.rotations[i*3+2]
      );

      // Scale pulse
      const s = scale * (1 + 0.1 * Math.sin(time * 2 + rnd * 100));
      tempObject.scale.set(s, s, s);

      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial 
        color={color} 
        emissive={emissive || '#000000'} 
        emissiveIntensity={emissive ? 2 : 0}
        roughness={0.2}
        metalness={0.9} 
      />
    </instancedMesh>
  );
};

export const Ornaments: React.FC = () => {
  // Geometries
  const boxGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);
  
  return (
    <group>
      {/* Heavy Gifts - Red/Gold */}
      <OrnamentLayer 
        count={50} 
        type="HEAVY" 
        geometry={boxGeo} 
        color="#8B0000" 
        scale={0.5} 
      />
      
      {/* Light Baubles - Gold */}
      <OrnamentLayer 
        count={200} 
        type="LIGHT" 
        geometry={sphereGeo} 
        color="#C5A059" 
        scale={0.25} 
      />

      {/* Tiny Lights - Warm White */}
      <OrnamentLayer 
        count={500} 
        type="TINY" 
        geometry={sphereGeo} 
        color="#FFFFE0" 
        emissive="#FFD700"
        scale={0.08} 
      />
    </group>
  );
};