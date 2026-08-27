'use client';

import React from 'react';
import { ModelGender } from '@/types/measurement';

interface MannequinModelProps {
  gender?: ModelGender;
  wireframe?: boolean;
  color?: string;
  highlightedPart?: string | null;
}

export default function MannequinModel({
  gender = 'male',
  wireframe = false,
  color,
  highlightedPart = null,
}: MannequinModelProps) {
  const isFemale = gender === 'female';

  // Body proportions based on gender
  const shoulderWidth = isFemale ? 0.75 : 0.95;
  const chestScale: [number, number, number] = isFemale ? [0.65, 0.4, 0.5] : [0.75, 0.45, 0.55];
  const waistScale: [number, number, number] = isFemale ? [0.45, 0.35, 0.4] : [0.62, 0.4, 0.48];
  const hipScale: [number, number, number] = isFemale ? [0.68, 0.4, 0.52] : [0.64, 0.38, 0.48];

  const bodyColor = color || '#d4b896'; // Tailor mannequin linen / canvas tone
  const woodColor = '#4a2e1b'; // Dark mahogany wood finish for stand
  const metalColor = '#8a8a8a'; // Brushed metal finish

  const getPartColor = (partId: string, defaultColor: string) => {
    if (highlightedPart === partId) return '#3b82f6';
    return defaultColor;
  };

  return (
    <group position={[0, 0, 0]}>
      {/* --- STAND & BASE --- */}
      {/* Wooden Base */}
      <mesh position={[0, -1.35, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.45, 0.5, 0.08, 32]} />
        <meshStandardMaterial color={woodColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Base Connector Feet */}
      <mesh position={[0, -1.38, 0]} receiveShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.04, 32]} />
        <meshStandardMaterial color="#2d1b0e" roughness={0.6} />
      </mesh>

      {/* Main Support Pole */}
      <mesh position={[0, -0.4, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 1.8, 16]} />
        <meshStandardMaterial color={metalColor} roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Height Adjustment Screw Collar */}
      <mesh position={[0, -0.7, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* --- TORSO & BODY --- */}
      <group position={[0, 0.3, 0]}>
        {/* Wooden Top Finial Cap */}
        <mesh position={[0, 0.78, 0]} castShadow>
          <sphereGeometry args={[0.07, 24, 24]} />
          <meshStandardMaterial color={woodColor} roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.72, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.06, 24]} />
          <meshStandardMaterial color={woodColor} roughness={0.3} metalness={0.1} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.11, 0.13, 0.16, 24]} />
          <meshStandardMaterial
            color={getPartColor('neck', bodyColor)}
            wireframe={wireframe}
            roughness={0.7}
          />
        </mesh>

        {/* Shoulders Block */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <boxGeometry args={[shoulderWidth, 0.12, 0.36]} />
          <meshStandardMaterial
            color={getPartColor('shoulder', bodyColor)}
            wireframe={wireframe}
            roughness={0.7}
          />
        </mesh>

        {/* Bust / Chest Upper Torso */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <sphereGeometry args={[1, 32, 24]} />
          <meshStandardMaterial
            color={getPartColor(isFemale ? 'bust' : 'chest', bodyColor)}
            wireframe={wireframe}
            roughness={0.7}
          />
        </mesh>

        {/* Apply chest scale transform */}
        <group position={[0, 0.35, 0]} scale={chestScale}>
          <mesh castShadow>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial
              color={getPartColor(isFemale ? 'bust' : 'chest', bodyColor)}
              wireframe={wireframe}
              roughness={0.7}
            />
          </mesh>
        </group>

        {/* Waist / Midsection */}
        <group position={[0, 0.08, 0]} scale={waistScale}>
          <cylinderGeometry args={[1, 0.9, 1, 32]} />
          <mesh castShadow>
            <cylinderGeometry args={[1, 0.95, 0.7, 32]} />
            <meshStandardMaterial
              color={getPartColor('waist', bodyColor)}
              wireframe={wireframe}
              roughness={0.7}
            />
          </mesh>
        </group>

        {/* Hips / Lower Torso */}
        <group position={[0, -0.22, 0]} scale={hipScale}>
          <mesh castShadow>
            <sphereGeometry args={[1, 32, 24]} />
            <meshStandardMaterial
              color={getPartColor('hip', bodyColor)}
              wireframe={wireframe}
              roughness={0.7}
            />
          </mesh>
        </group>

        {/* Bottom Wooden Base Cap on Torso */}
        <mesh position={[0, -0.42, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.12, 0.08, 24]} />
          <meshStandardMaterial color={woodColor} roughness={0.3} metalness={0.1} />
        </mesh>
      </group>
    </group>
  );
}
