import React, { createContext, useContext, useMemo, useRef, useState } from 'react'
import { extend, useThree, ThreeEvent } from '@react-three/fiber'
import { 
  Group, 
  Matrix4, 
  Mesh, 
  MeshBasicMaterial, 
  TubeGeometry, 
  CatmullRomCurve3, 
  Vector3, 
  Quaternion,
  Euler,
  Raycaster,
  Vector2
} from 'three'
import { Html, Line as DreiLine } from '@react-three/drei'

// Extend Three.js objects for React Three Fiber
extend({ Group, Matrix4, Mesh, MeshBasicMaterial, TubeGeometry })

interface PivotControlsProps {
  matrix?: Matrix4
  onDrag?: (matrix: Matrix4) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  scale?: number
  fixed?: boolean
  disableTranslations?: boolean | [boolean, boolean, boolean]
  disableRotations?: boolean | [boolean, boolean, boolean]
  annotations?: boolean
  activeAxes?: [boolean, boolean, boolean]
  rotationThickness?: number
  translationThickness?: number
  arrowHeadSize?: number
}

interface ContextProps {
  scale: number
  annotations: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  onDrag?: (matrix: Matrix4) => void
  matrix: Matrix4
  rotationThickness: number
  translationThickness: number
  arrowHeadSize: number
}

const Context = createContext<ContextProps>({
  scale: 1,
  annotations: false,
  matrix: new Matrix4(),
  rotationThickness: 0.03,
  translationThickness: 0.015,
  arrowHeadSize: 0.05
})

const _quaternion = new Quaternion()
const _position = new Vector3()
const _scale = new Vector3()

// Enhanced AxisRotator with TubeGeometry for better raycasting
const AxisRotator: React.FC<{
  axis: 0 | 1 | 2
  direction: Vector3
  color: string
}> = ({ axis, direction, color }) => {
  const { scale, annotations, onDragStart, onDragEnd, onDrag, matrix, rotationThickness } = useContext(Context)
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [angle, setAngle] = useState(0)
  const { camera, gl } = useThree()
  const raycastMeshRef = useRef<Mesh>(null)
  
  const radius = 0.8 * scale
  const segments = 64
  
  // Create rotation ring curve
  const curve = useMemo(() => {
    const points: Vector3[] = []
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2
      const point = new Vector3()
      
      if (axis === 0) { // X axis - YZ plane
        point.set(0, Math.cos(theta) * radius, Math.sin(theta) * radius)
      } else if (axis === 1) { // Y axis - XZ plane
        point.set(Math.cos(theta) * radius, 0, Math.sin(theta) * radius)
      } else { // Z axis - XY plane
        point.set(Math.cos(theta) * radius, Math.sin(theta) * radius, 0)
      }
      
      points.push(point)
    }
    return new CatmullRomCurve3(points, true)
  }, [axis, radius, segments])
  
  // Create tube geometry for better raycasting
  const tubeGeometry = useMemo(() => {
    return new TubeGeometry(curve, segments * 2, scale * rotationThickness, 8, true)
  }, [curve, segments, scale, rotationThickness])
  
  // Create line points for visual representation
  const linePoints = useMemo(() => {
    const points: number[] = []
    const curvePoints = curve.getPoints(segments)
    curvePoints.forEach(p => {
      points.push(p.x, p.y, p.z)
    })
    return points
  }, [curve, segments])
  
  const dragStartRef = useRef<{ x: number; y: number; rotation: Quaternion }>()
  
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setDragging(true)
    
    // Store initial rotation
    matrix.decompose(_position, _quaternion, _scale)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotation: _quaternion.clone()
    }
    
    onDragStart?.()
  }
  
  const handlePointerUp = () => {
    if (dragging) {
      setDragging(false)
      setAngle(0)
      dragStartRef.current = undefined
      onDragEnd?.()
    }
  }
  
  const handlePointerMove = (e: PointerEvent) => {
    if (dragging && onDrag && dragStartRef.current) {
      // Get current mouse position in NDC
      const rect = gl.domElement.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      
      // Get start mouse position in NDC
      const startX = ((dragStartRef.current.x - rect.left) / rect.width) * 2 - 1
      const startY = -((dragStartRef.current.y - rect.top) / rect.height) * 2 + 1
      
      // Create rays from camera through mouse positions
      const raycaster = new Raycaster()
      raycaster.setFromCamera(new Vector2(x, y), camera)
      const currentRay = raycaster.ray.direction.clone().normalize()
      
      raycaster.setFromCamera(new Vector2(startX, startY), camera)
      const startRay = raycaster.ray.direction.clone().normalize()
      
      // Get the rotation axis vector
      const rotationAxis = new Vector3()
      if (axis === 0) rotationAxis.set(1, 0, 0) // X axis
      else if (axis === 1) rotationAxis.set(0, 1, 0) // Y axis
      else rotationAxis.set(0, 0, 1) // Z axis
      
      // Apply current rotation to the axis
      matrix.decompose(_position, _quaternion, _scale)
      rotationAxis.applyQuaternion(_quaternion)
      
      // Project rays onto the plane perpendicular to rotation axis
      const projectedStart = startRay.clone().sub(
        rotationAxis.clone().multiplyScalar(startRay.dot(rotationAxis))
      ).normalize()
      
      const projectedCurrent = currentRay.clone().sub(
        rotationAxis.clone().multiplyScalar(currentRay.dot(rotationAxis))
      ).normalize()
      
      // Calculate angle between projected vectors
      let angle = Math.acos(Math.max(-1, Math.min(1, projectedStart.dot(projectedCurrent))))
      
      // Determine rotation direction using cross product
      const cross = new Vector3().crossVectors(projectedStart, projectedCurrent)
      if (cross.dot(rotationAxis) < 0) angle = -angle
      
      // Apply the rotation
      const rotationQuaternion = new Quaternion().setFromAxisAngle(rotationAxis, angle)
      const newQuaternion = rotationQuaternion.multiply(dragStartRef.current.rotation)
      
      const newMatrix = new Matrix4()
      newMatrix.compose(_position, newQuaternion, _scale)
      onDrag(newMatrix)
      
      setAngle(angle)
    }
  }
  
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      return () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }
    }
  }, [dragging, angle])
  
  return (
    <group>
      {/* Invisible tube mesh for raycasting */}
      <mesh
        ref={raycastMeshRef}
        geometry={tubeGeometry}
        visible={false}
        onPointerDown={handlePointerDown}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshBasicMaterial />
      </mesh>
      
      {/* Visible line */}
      <DreiLine
        points={linePoints}
        color={hovered || dragging ? '#ffff00' : color}
        lineWidth={3}
        opacity={hovered || dragging ? 1 : 0.6}
        transparent
      />
      
      {/* Annotation */}
      {annotations && dragging && (
        <Html position={direction.clone().multiplyScalar(radius * 1.2)}>
          <div
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '11px',
              whiteSpace: 'nowrap'
            }}
          >
            {(angle * 180 / Math.PI).toFixed(1)}°
          </div>
        </Html>
      )}
    </group>
  )
}

// Translation arrow component
const AxisArrow: React.FC<{
  axis: 0 | 1 | 2
  direction: Vector3
  color: string
}> = ({ axis, direction, color }) => {
  const { scale, onDragStart, onDragEnd, onDrag, matrix, translationThickness, arrowHeadSize } = useContext(Context)
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const { camera, gl } = useThree()
  const dragStartRef = useRef<{ x: number; y: number; position: Vector3; plane: Vector3 }>()
  
  const arrowLength = scale
  const cylinderWidth = scale * translationThickness
  const coneWidth = scale * arrowHeadSize
  const coneLength = scale * 0.2
  
  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setDragging(true)
    
    // Store initial position
    matrix.decompose(_position, _quaternion, _scale)
    
    // Calculate the plane for dragging
    const cameraDirection = new Vector3()
    camera.getWorldDirection(cameraDirection)
    
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      position: _position.clone(),
      plane: cameraDirection
    }
    
    onDragStart?.()
  }
  
  const handlePointerUp = () => {
    if (dragging) {
      setDragging(false)
      dragStartRef.current = undefined
      onDragEnd?.()
    }
  }
  
  const handlePointerMove = (e: PointerEvent) => {
    if (dragging && onDrag && dragStartRef.current) {
      // Calculate translation based on screen space movement
      const rect = gl.domElement.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      const startX = ((dragStartRef.current.x - rect.left) / rect.width) * 2 - 1
      const startY = -((dragStartRef.current.y - rect.top) / rect.height) * 2 + 1
      
      // Create rays from camera
      const raycaster = new Raycaster()
      raycaster.setFromCamera(new Vector2(x, y), camera)
      const currentRay = raycaster.ray.direction.clone()
      
      raycaster.setFromCamera(new Vector2(startX, startY), camera)
      const startRay = raycaster.ray.direction.clone()
      
      // Get the current rotation from the matrix
      matrix.decompose(_position, _quaternion, _scale)
      
      // Transform the axis direction by the current rotation
      const worldDirection = direction.clone().applyQuaternion(_quaternion)
      
      // Project rays onto the rotated axis direction
      const currentProjection = currentRay.dot(worldDirection) 
      const startProjection = startRay.dot(worldDirection)
      const deltaProjection = currentProjection - startProjection
      
      // Calculate new position using the rotated direction
      const delta = worldDirection.multiplyScalar(deltaProjection * scale * 2)
      const newPosition = dragStartRef.current.position.clone().add(delta)
      
      const newMatrix = new Matrix4()
      newMatrix.compose(newPosition, _quaternion, _scale)
      onDrag(newMatrix)
    }
  }
  
  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      return () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }
    }
  }, [dragging])
  
  const rotation = useMemo(() => {
    const euler = new Euler()
    if (axis === 0) euler.set(0, 0, -Math.PI / 2)
    else if (axis === 1) euler.set(0, 0, 0)
    else euler.set(Math.PI / 2, 0, 0)
    return euler
  }, [axis])
  
  return (
    <group rotation={rotation}>
      {/* Invisible cylinder for raycasting */}
      <mesh
        visible={false}
        position={[0, arrowLength / 2, 0]}
        onPointerDown={handlePointerDown}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[coneWidth * 1.4, coneWidth * 1.4, arrowLength, 8, 1]} />
      </mesh>
      
      {/* Visible arrow shaft */}
      <mesh position={[0, arrowLength / 2, 0]}>
        <cylinderGeometry args={[cylinderWidth, cylinderWidth, arrowLength, 4, 1]} />
        <meshBasicMaterial color={hovered || dragging ? '#ffff00' : color} />
      </mesh>
      
      {/* Arrow head */}
      <mesh position={[0, arrowLength, 0]}>
        <coneGeometry args={[coneWidth, coneLength, 8, 1]} />
        <meshBasicMaterial color={hovered || dragging ? '#ffff00' : color} />
      </mesh>
    </group>
  )
}

export const EnhancedPivotControls: React.FC<PivotControlsProps> = ({
  matrix = new Matrix4(),
  onDrag,
  onDragStart,
  onDragEnd,
  scale = 1,
  disableTranslations = false,
  disableRotations = false,
  annotations = false,
  activeAxes = [true, true, true],
  rotationThickness = 0.03,
  translationThickness = 0.015,
  arrowHeadSize = 0.05
}) => {
  const groupRef = useRef<Group>(null)
  
  const config = useMemo<ContextProps>(() => ({
    scale,
    annotations,
    onDragStart,
    onDragEnd,
    onDrag,
    matrix,
    rotationThickness,
    translationThickness,
    arrowHeadSize
  }), [scale, annotations, onDragStart, onDragEnd, onDrag, matrix, rotationThickness, translationThickness, arrowHeadSize])
  
  const translationEnabled = useMemo(() => {
    if (typeof disableTranslations === 'boolean') {
      return !disableTranslations ? [true, true, true] : [false, false, false]
    }
    return disableTranslations.map(d => !d)
  }, [disableTranslations])
  
  const rotationEnabled = useMemo(() => {
    if (typeof disableRotations === 'boolean') {
      return !disableRotations ? [true, true, true] : [false, false, false]
    }
    return disableRotations.map(d => !d)
  }, [disableRotations])
  
  // Apply matrix to group
  React.useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.matrix.copy(matrix)
      groupRef.current.matrixAutoUpdate = false
      groupRef.current.matrixWorldNeedsUpdate = true
    }
  }, [matrix])
  
  return (
    <Context.Provider value={config}>
      <group ref={groupRef}>
        {/* Translation arrows */}
        {translationEnabled[0] && activeAxes[0] && (
          <AxisArrow axis={0} direction={new Vector3(1, 0, 0)} color="#ff0000" />
        )}
        {translationEnabled[1] && activeAxes[1] && (
          <AxisArrow axis={1} direction={new Vector3(0, 1, 0)} color="#00ff00" />
        )}
        {translationEnabled[2] && activeAxes[2] && (
          <AxisArrow axis={2} direction={new Vector3(0, 0, 1)} color="#0000ff" />
        )}
        
        {/* Rotation rings with enhanced raycasting */}
        {rotationEnabled[0] && activeAxes[0] && (
          <AxisRotator axis={0} direction={new Vector3(1, 0, 0)} color="#ff0000" />
        )}
        {rotationEnabled[1] && activeAxes[1] && (
          <AxisRotator axis={1} direction={new Vector3(0, 1, 0)} color="#00ff00" />
        )}
        {rotationEnabled[2] && activeAxes[2] && (
          <AxisRotator axis={2} direction={new Vector3(0, 0, 1)} color="#0000ff" />
        )}
      </group>
    </Context.Provider>
  )
}