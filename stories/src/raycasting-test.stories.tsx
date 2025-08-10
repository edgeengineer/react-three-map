import { Box } from "@react-three/drei";
import { useControls } from "leva";
import { FC, useState } from "react";
import { Vector3Tuple } from "three";
import { StoryMap } from "./story-map";

export default {
  title: "Raycasting Test"
};

export function RaycastingAccuracy() {
  const controls = useControls({
    latitude: { value: 51, min: -90, max: 90 },
    longitude: { value: 0, min: -180, max: 180 },
    altitude: { value: 0, min: -1000, max: 10000, step: 10 },
    zoom: { value: 13, min: 10, max: 20, step: 0.1 },
    pitch: { value: 60, min: 0, max: 85, step: 1 },
    boxScale: { value: 100, min: 10, max: 1000, step: 10 },
    gridSize: { value: 3, min: 1, max: 5, step: 1 }
  });

  return (
    <div style={{ height: '100vh' }}>
      <StoryMap
        latitude={controls.latitude}
        longitude={controls.longitude}
        zoom={controls.zoom}
        pitch={controls.pitch}
        canvas={{ altitude: controls.altitude }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <BoxGrid scale={controls.boxScale} gridSize={controls.gridSize} />
      </StoryMap>
    </div>
  );
}

const BoxGrid: FC<{ scale: number, gridSize: number }> = ({ scale, gridSize }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [clickedIndex, setClickedIndex] = useState<number | null>(null);
  
  const positions: Vector3Tuple[] = [];
  const halfGrid = Math.floor(gridSize / 2);
  
  for (let x = -halfGrid; x <= halfGrid; x++) {
    for (let y = -halfGrid; y <= halfGrid; y++) {
      for (let z = -halfGrid; z <= halfGrid; z++) {
        positions.push([x * scale * 2, y * scale * 2, z * scale * 2]);
      }
    }
  }
  
  return (
    <>
      {positions.map((pos, index) => {
        const isHovered = hoveredIndex === index;
        const isClicked = clickedIndex === index;
        
        return (
          <Box
            key={index}
            position={pos}
            args={[scale, scale, scale]}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredIndex(index);
              console.log(`Box ${index} hovered at position:`, pos);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              setHoveredIndex(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setClickedIndex(index);
              console.log(`Box ${index} clicked at position:`, pos);
            }}
          >
            <meshStandardMaterial 
              color={isClicked ? 'red' : isHovered ? 'hotpink' : 'lightblue'} 
              opacity={0.8}
              transparent
            />
          </Box>
        );
      })}
      
      {/* Add a ground plane for reference */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -scale * 2, 0]}>
        <planeGeometry args={[scale * gridSize * 4, scale * gridSize * 4]} />
        <meshStandardMaterial color="gray" opacity={0.3} transparent />
      </mesh>
    </>
  );
};