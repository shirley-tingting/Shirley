import React from 'react';
import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';
import { Polaroids } from './Polaroids';
import * as THREE from 'three';

const Rig = () => {
  useFrame((state) => {
    // Subtle camera movement to enhance 3D feel
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.1) * 2 + 0;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export const Scene: React.FC = () => {
  return (
    <>
      {/* Position camera further back to ensure full tree visibility on mobile portrait aspect ratios */}
      <PerspectiveCamera makeDefault position={[0, 2, 24]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8} 
        minDistance={10}
        maxDistance={40}
        autoRotate
        autoRotateSpeed={0.5}
      />

      {/* Lighting - Dramatic & Warm */}
      <ambientLight intensity={0.2} color="#001100" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={2} 
        color="#ffd700" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#2e8b57" />
      <pointLight position={[0, -5, 10]} intensity={0.5} color="#c5a059" />

      {/* Environment Reflections */}
      <Environment preset="night" blur={0.8} background={false} />

      <group position={[0, -2, 0]}>
        <Foliage />
        <Ornaments />
        <Polaroids />
      </group>

      <ContactShadows opacity={0.4} scale={20} blur={2} far={4.5} />

      {/* Post Processing for Cinematic Feel */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.2} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
        <Noise opacity={0.05} />
      </EffectComposer>
    </>
  );
};