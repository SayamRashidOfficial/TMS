'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import MannequinModel from './MannequinModel';
import { ModelGender } from '@/types/measurement';

interface TailorMannequinProps {
  gender?: 'male' | 'female' | ModelGender;
  orbitRef?: React.RefObject<any> | React.MutableRefObject<any>;
}

export default function TailorMannequin({ gender = 'male', orbitRef }: TailorMannequinProps) {
  return (
    <div className="w-full h-full min-h-[500px] relative">
      <Canvas
        camera={{ position: [0, 0.5, 3.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 5, -5]} intensity={0.4} />

        <MannequinModel gender={gender as ModelGender} wireframe={false} />

        <ContactShadows
          position={[0, -1.4, 0]}
          opacity={0.4}
          scale={10}
          blur={2}
          far={4}
        />

        <OrbitControls
          ref={orbitRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1.2}
          maxDistance={5.0}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
          target={[0, 0.4, 0]}
          makeDefault
        />
      </Canvas>
    </div>
  );
}
