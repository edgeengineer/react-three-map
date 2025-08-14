import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';

export interface Compass3DProps {
  cylinderLength?: number;
  cylinderRadius?: number;
  sphereRadius?: number;
  position?: [number, number, number];
  bearing?: number;  // Map bearing in degrees
  pitch?: number;    // Map pitch in degrees
  scale?: number;
}

export const Compass3D: React.FC<Compass3DProps> = ({
  cylinderLength = 2,
  cylinderRadius = 0.05,
  sphereRadius = 0.2,
  position = [0, 0, 0],
  bearing = 0,
  pitch = 0,
  scale = 1
}) => {
  // Calculate rotation based on bearing and pitch
  // The compass needs to rotate to match the map's orientation
  // Camera is at [3,3,3] looking at origin, creating a 45° isometric view
  // We need to compensate for this camera angle
  const rotation = useMemo(() => {
    // When bearing = 0, North should point toward screen top
    // When bearing = 90, East should point toward screen top (90° clockwise rotation)
    const yRotation = THREE.MathUtils.degToRad(bearing + 135); // 135° offset for isometric camera alignment
    const xRotation = THREE.MathUtils.degToRad(pitch);
    return [xRotation, yRotation, 0] as [number, number, number];
  }, [bearing, pitch]);
  // Colors for each axis
  const colors = {
    x: '#0000ff', // Blue for N-S (X-axis points North-South)
    y: '#00ff00', // Green for Up-Down
    z: '#ff0000'  // Red for E-W (Z-axis points East-West)
  };

  // Calculate positions for spheres and text
  const halfLength = cylinderLength / 2;
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* X-axis (North-South) */}
      <group>
        {/* Cylinder */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderLength, 16]} />
          <meshStandardMaterial color={colors.x} />
        </mesh>
        
        {/* North sphere */}
        <mesh position={[halfLength, 0, 0]}>
          <sphereGeometry args={[sphereRadius, 16, 16]} />
          <meshStandardMaterial color={colors.x} />
        </mesh>
        <Billboard position={[halfLength + sphereRadius + 0.3, 0, 0]}>
          <Text
            fontSize={sphereRadius * 2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            N
          </Text>
        </Billboard>
        
        {/* South sphere */}
        <mesh position={[-halfLength, 0, 0]}>
          <sphereGeometry args={[sphereRadius, 16, 16]} />
          <meshStandardMaterial color={colors.x} />
        </mesh>
        <Billboard position={[-halfLength - sphereRadius - 0.3, 0, 0]}>
          <Text
            fontSize={sphereRadius * 2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            S
          </Text>
        </Billboard>
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
        <Billboard position={[0, halfLength + sphereRadius + 0.3, 0]}>
          <Text
            fontSize={sphereRadius * 2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Up
          </Text>
        </Billboard>
        
        {/* Down sphere */}
        <mesh position={[0, -halfLength, 0]}>
          <sphereGeometry args={[sphereRadius, 16, 16]} />
          <meshStandardMaterial color={colors.y} />
        </mesh>
        <Billboard position={[0, -halfLength - sphereRadius - 0.3, 0]}>
          <Text
            fontSize={sphereRadius * 2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Down
          </Text>
        </Billboard>
      </group>

      {/* Z-axis (East-West) */}
      <group>
        {/* Cylinder */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[cylinderRadius, cylinderRadius, cylinderLength, 16]} />
          <meshStandardMaterial color={colors.z} />
        </mesh>
        
        {/* West sphere */}
        <mesh position={[0, 0, -halfLength]}>
          <sphereGeometry args={[sphereRadius, 16, 16]} />
          <meshStandardMaterial color={colors.z} />
        </mesh>
        <Billboard position={[0, 0, -halfLength - sphereRadius - 0.3]}>
          <Text
            fontSize={sphereRadius * 2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            W
          </Text>
        </Billboard>
        
        {/* East sphere */}
        <mesh position={[0, 0, halfLength]}>
          <sphereGeometry args={[sphereRadius, 16, 16]} />
          <meshStandardMaterial color={colors.z} />
        </mesh>
        <Billboard position={[0, 0, halfLength + sphereRadius + 0.3]}>
          <Text
            fontSize={sphereRadius * 2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            E
          </Text>
        </Billboard>
      </group>

      {/* Optional: Add a center sphere for reference */}
      <mesh>
        <sphereGeometry args={[cylinderRadius * 2, 16, 16]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </group>
  );
};