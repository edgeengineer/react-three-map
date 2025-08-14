import React, { useState, useCallback } from 'react'
import type { Story } from '@ladle/react'
import { BlenderView } from '../../src/components/BlenderView'
import { StoryMap } from './story-map'
import { Coordinates } from 'react-three-map'
import { Box, Sphere, Cone, Cylinder } from '@react-three/drei'

interface PrimitiveObject {
  id: string
  type: 'cube' | 'sphere' | 'cone' | 'cylinder'
  coordinates: [number, number]
  color: string
}

function PrimitiveOnMap({ object }: { object: PrimitiveObject }) {
  return (
    <Coordinates longitude={object.coordinates[0]} latitude={object.coordinates[1]}>
      {object.type === 'cube' && (
        <Box args={[20, 20, 20]} position={[0, 0, 10]}>
          <meshStandardMaterial color={object.color} />
        </Box>
      )}
      {object.type === 'sphere' && (
        <Sphere args={[10, 32, 16]} position={[0, 0, 10]}>
          <meshStandardMaterial color={object.color} />
        </Sphere>
      )}
      {object.type === 'cone' && (
        <Cone args={[10, 20, 32]} position={[0, 0, 10]}>
          <meshStandardMaterial color={object.color} />
        </Cone>
      )}
      {object.type === 'cylinder' && (
        <Cylinder args={[10, 10, 20, 32]} position={[0, 0, 10]}>
          <meshStandardMaterial color={object.color} />
        </Cylinder>
      )}
    </Coordinates>
  )
}

export const MapWithPrimitives: Story = () => {
  const [objects, setObjects] = useState<PrimitiveObject[]>([])
  const center: [number, number] = [-122.4194, 37.7749]
  
  const colors = ['#9333ea', '#dc2626', '#16a34a', '#2563eb', '#ca8a04']
  
  const handleAddPrimitive = useCallback((type: PrimitiveObject['type']) => {
    const newObject: PrimitiveObject = {
      id: `${type}-${Date.now()}`,
      type,
      coordinates: [
        center[0] + (Math.random() - 0.5) * 0.002,
        center[1] + (Math.random() - 0.5) * 0.002
      ],
      color: colors[Math.floor(Math.random() * colors.length)]
    }
    setObjects(prev => [...prev, newObject])
  }, [])

  return (
    <BlenderView onAddPrimitive={handleAddPrimitive} objectCount={objects.length}>
      <StoryMap
        longitude={center[0]}
        latitude={center[1]}
        zoom={16}
        pitch={60}
        bearing={41}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-gl-style/style.json"
        canvas={{ frameloop: 'demand' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        {objects.map((object) => (
          <PrimitiveOnMap key={object.id} object={object} />
        ))}
      </StoryMap>
    </BlenderView>
  )
}

MapWithPrimitives.storyName = 'Map with 3D Primitives'

export default {
  title: 'Blender View Map',
}