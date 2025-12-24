import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

// Custom Shader Material for the luxury glow effect
const FoliageMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 }, // 0 = Scattered, 1 = Tree
    uColorCore: { value: new THREE.Color('#043927') }, // Deep Emerald
    uColorTip: { value: new THREE.Color('#2e8b57') }, // Sea Green
    uColorGold: { value: new THREE.Color('#FFD700') }, // Gold
  },
  vertexShader: `
    uniform float uTime;
    uniform float uProgress;
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    
    varying float vAlpha;
    varying vec3 vColor;

    // Cubic easing for smooth transition
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      float t = easeInOutCubic(uProgress);
      
      // Interpolate position
      vec3 pos = mix(aScatterPos, aTreePos, t);
      
      // Add "breathing" floating effect based on state
      float floatScale = mix(0.5, 0.05, t); // Float more when scattered
      pos.x += sin(uTime * 2.0 + aRandom * 10.0) * floatScale;
      pos.y += cos(uTime * 1.5 + aRandom * 20.0) * floatScale;
      pos.z += sin(uTime * 2.2 + aRandom * 30.0) * floatScale;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size attenuation
      float size = mix(15.0, 8.0, t); // Larger when scattered
      gl_PointSize = size * (30.0 / -mvPosition.z);
      
      gl_Position = projectionMatrix * mvPosition;
      
      // Pass randomness to fragment
      vAlpha = 0.6 + 0.4 * sin(uTime + aRandom * 10.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColorCore;
    uniform vec3 uColorTip;
    uniform vec3 uColorGold;
    varying float vAlpha;

    void main() {
      // Circular particle
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;

      // Radial gradient: Gold rim -> Tip color -> Core color
      vec3 color = mix(uColorTip, uColorCore, dist * 2.0);
      
      // Sparkle/Gold rim effect
      float rim = smoothstep(0.4, 0.5, dist);
      color = mix(color, uColorGold, rim * 0.5);

      gl_FragColor = vec4(color, vAlpha);
    }
  `
};

export const Foliage: React.FC = () => {
  const mode = useStore((state) => state.mode);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate particles
  const count = 4000;
  const { positions, scatterPositions, treePositions, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scatter = new Float32Array(count * 3);
    const tree = new Float32Array(count * 3);
    const rnd = new Float32Array(count);

    const treeHeight = 12;
    const treeRadius = 4.5;

    for (let i = 0; i < count; i++) {
      // Random/Scatter logic (Spherical distribution)
      const r = 15 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      scatter[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      scatter[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      scatter[i * 3 + 2] = r * Math.cos(phi);

      // Tree logic (Cone distribution)
      // Normalize height 0 to 1
      const hRatio = Math.random(); 
      const y = (hRatio * treeHeight) - (treeHeight / 2); // Center y
      const currentRadius = treeRadius * (1 - hRatio); // Cone shape
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * currentRadius; // Uniform disk distribution at height

      tree[i * 3] = radius * Math.cos(angle);
      tree[i * 3 + 1] = y;
      tree[i * 3 + 2] = radius * Math.sin(angle);

      rnd[i] = Math.random();
      
      // Initial buffer set to scatter
      pos[i*3] = scatter[i*3];
      pos[i*3+1] = scatter[i*3+1];
      pos[i*3+2] = scatter[i*3+2];
    }

    return { 
      positions: pos, 
      scatterPositions: scatter, 
      treePositions: tree,
      randoms: rnd 
    };
  }, []);

  useFrame((state) => {
    if (shaderRef.current) {
      // Update time
      shaderRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      // Lerp progress
      const target = mode === 'TREE_SHAPE' ? 1 : 0;
      shaderRef.current.uniforms.uProgress.value = THREE.MathUtils.lerp(
        shaderRef.current.uniforms.uProgress.value,
        target,
        0.02 // Speed of transition
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={count}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={count}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={count}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={shaderRef}
        args={[FoliageMaterial]}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};