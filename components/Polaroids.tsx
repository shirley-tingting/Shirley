import React, { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

interface PolaroidProps {
  url: string;
  index: number;
  total: number;
}

const Polaroid: React.FC<PolaroidProps> = ({ url, index, total }) => {
  const texture = useLoader(THREE.TextureLoader, url);
  const meshRef = useRef<THREE.Group>(null);
  const mode = useStore((state) => state.mode);
  
  // Data generation: Positions & Rotations
  const { scatterPos, treePos, scatterRot, treeRot, randomOffset } = useMemo(() => {
    // 1. Scatter Position
    const r = 16;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const sp = new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );

    // 2. Tree Position
    const h = 10;
    const yRatio = (index + 1) / (total + 1);
    const y = -h/2 + yRatio * h;
    const coneRadiusAtY = 4.5 * (1 - yRatio); 
    const radius = coneRadiusAtY + 0.6; // On surface
    const angle = index * 2.2; 
    
    const tp = new THREE.Vector3(
      radius * Math.cos(angle),
      y,
      radius * Math.sin(angle)
    );

    // 3. Rotations (Quaternions)
    const dummy = new THREE.Object3D();
    
    // Scatter Rotation: Completely random
    dummy.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    const sRot = dummy.quaternion.clone();

    // Tree Rotation: Natural "Resting" Pose
    // Start at tree pos, look at central axis at same height
    dummy.position.copy(tp);
    dummy.lookAt(0, tp.y, 0); 
    // Rotate 180 to face OUT
    dummy.rotateY(Math.PI);
    // Tilt back (Rotate -X) to lean against the cone slope (approx 10-15 degrees)
    dummy.rotateX(-0.25);
    // Add subtle random Z tilt (roll) so they aren't perfectly robotic
    dummy.rotateZ((Math.random() - 0.5) * 0.2); 

    const tRot = dummy.quaternion.clone();

    return { 
      scatterPos: sp, 
      treePos: tp, 
      scatterRot: sRot, 
      treeRot: tRot,
      randomOffset: Math.random() 
    };
  }, [url, index, total]);

  const progressRef = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Animation Progress
    const target = mode === 'TREE_SHAPE' ? 1 : 0;
    progressRef.current = THREE.MathUtils.lerp(progressRef.current, target, 0.02);
    const t = progressRef.current;
    const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // 1. Position Interpolation
    const currentPos = new THREE.Vector3().lerpVectors(scatterPos, treePos, easeT);
    
    // Floating Noise
    const time = state.clock.elapsedTime;
    // Less floating when in tree mode to look "attached"
    const floatAmp = THREE.MathUtils.lerp(0.5, 0.05, easeT);
    
    currentPos.y += Math.sin(time + randomOffset * 10) * floatAmp;
    currentPos.x += Math.cos(time * 0.5 + randomOffset) * (floatAmp * 0.5);

    meshRef.current.position.copy(currentPos);

    // 2. Rotation Interpolation
    meshRef.current.quaternion.slerpQuaternions(scatterRot, treeRot, easeT);
  });

  return (
    <group ref={meshRef}>
      {/* Photo Frame */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[2.2, 2.6, 0.05]} />
        <meshStandardMaterial color="#FDFBF7" roughness={0.4} />
      </mesh>
      {/* Image */}
      <mesh position={[0, 0.25, 0.03]}>
        <planeGeometry args={[1.9, 1.9]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
};

export const Polaroids: React.FC = () => {
  const userPhotos = useStore((state) => state.userPhotos);

  return (
    <group>
      {userPhotos.map((url, i) => (
        <React.Suspense key={url} fallback={null}>
          <Polaroid url={url} index={i} total={userPhotos.length} />
        </React.Suspense>
      ))}
    </group>
  );
};