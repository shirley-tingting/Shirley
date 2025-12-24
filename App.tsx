import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { UI } from './components/UI';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-[#010b07]">
      <UI />
      
      <Canvas
        dpr={[1, 2]} // Handle pixel ratio for sharp mobile rendering
        gl={{ 
          antialias: false, // Post-processing handles smoothing
          toneMapping: 3, // THREE.ReinhardToneMapping
          toneMappingExposure: 1.5 
        }}
        // Position camera initially
        camera={{ position: [0, 0, 20], fov: 45 }}
      >
        <Suspense fallback={null}>
            <Scene />
        </Suspense>
      </Canvas>
      
      {/* Loading Overlay (Simple CSS fade out when ready) */}
      <div className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-1000 opacity-0 animate-[fadeOut_2s_ease-out_forwards] z-50 flex items-center justify-center">
        <span className="text-[#D4AF37] font-['Cinzel'] tracking-[0.5em] animate-pulse">LOADING</span>
      </div>
    </div>
  );
};

export default App;