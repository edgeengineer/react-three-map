import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

export interface Compass3DProps {
  cylinderLength?: number;
  cylinderRadius?: number;
  sphereRadius?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const Compass3D: React.FC<Compass3DProps> = ({
  cylinderLength = 2,
  cylinderRadius = 0.05,
  sphereRadius = 0.2,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1
}) => {
  // Colors for each axis
  const colors = {
    x: '#ff0000', // Red for E-W
    y: '#00ff00', // Green for Up-Down
    z: '#0000ff'  // Blue for N-S
  };

  // Calculate positions for spheres and text
  const halfLength = cylinderLength / 2;
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* X-axis (East-West) */}
      <group>
        {/* Cylinder */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderLength, 16]} />
          <meshStandardMaterial color={colors.x} />
        </mesh>
        
        {/* East sphere */}
        <mesh position={[halfLength, 0, 0]}>
          <sphereGeometry args={[sphereRadius, 16, 16]} />
          <meshStandardMaterial color={colors.x} />
        </mesh>
        <Text
          position={[halfLength + sphereRadius + 0.2, 0, 0]}
          fontSize={sphereRadius * 2}
          color="white"
          anchorX="center"
          anchorY="middle"
          billboard
        >
          E
        </Text>
        
        {/* West sphere */}
        <mesh position={[-halfLength, 0, 0]}>
          <sphereGeometry args={[sphereRadius, 16, 16]} />
          <meshStandardMaterial color={colors.x} />
        </mesh>
        <Text
          position={[-halfLength - sphereRadius - 0.2, 0, 0]}
          fontSize={sphereRadius * 2}
          color="white"
          anchorX="center"
          anchorY="middle"
          billboard
        >
          W
        </Text>
      </group>

      {/* Y-axis (Up-Down) */}
      <group>
        {/* Cylinder */}
        <mesh>
          <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderLength, 16]} />
          <meshStandardMaterial color={colors.y} />
        </mesh>
        
        {/* Up sphere */}
        <mesh position={[0, halfLength, 0]}>
          <sphereGeometry args={[sphereRadius, 16, 16]} />
          <meshStandardMaterial color={colors.y} />
        </mesh>
        <Text
          position={[0, halfLength + sphereRadius + 0.2, 0]}
          fontSize={sphereRadius * 2}
          color="white"
          anchorX="center"
          anchorY="middle"
          billboard
        >
          Up
        </Text>
        
        {/* Down sphere */}
        <mesh position={[0, -halfLength, 0]}>
          <sphereGeometry args={[sphereRadius, 16, 16]} />
          <meshStandardMaterial color={colors.y} />
        </mesh>
        <Text
          position={[0, -halfLength - sphereRadius - 0.2, 0]}
          fontSize={sphereRadius * 2}
          color="white"
          anchorX="center"
          anchorY="middle"
          billboard
        >
          Down
        </Text>
      </group>

      {/* Z-axis (North-South) */}
      <group>
        {/* Cylinder */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderLength, 16]} />
          <meshStandardMaterial color={colors.z} />
        </mesh>
        
        {/* North sphere */}
        <mesh position={[0, 0, -halfLength]}>
          <sphereGeometry args={[sphereRadius, 16, 16]} />
          <meshStandardMaterial color={colors.z} />
        </mesh>
        <Text
          position={[0, 0, -halfLength - sphereRadius - 0.2]}
          fontSize={sphereRadius * 2}
          color="white"
          anchorX="center"
          anchorY="middle"
          billboard
        >
          N
        </Text>
        
        {/* South sphere */}
        <mesh position={[0, 0, halfLength]}>
          <sphereGeometry args={[sphereRadius, 16, 16]} />
          <meshStandardMaterial color={colors.z} />
        </mesh>
        <Text
          position={[0, 0, halfLength + sphereRadius + 0.2]}
          fontSize={sphereRadius * 2}
          color="white"
          anchorX="center"
          anchorY="middle"
          billboard
        >
          S
        </Text>
      </group>

      {/* Optional: Add a center sphere for reference */}
      <mesh>
        <sphereGeometry args={[cylinderRadius * 2, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
};