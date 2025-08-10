import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { 
  BufferGeometry, 
  Color, 
  DoubleSide, 
  Euler, 
  Group, 
  Matrix4, 
  Mesh, 
  MeshBasicMaterial, 
  PlaneGeometry, 
  Quaternion, 
  Raycaster, 
  RingGeometry, 
  TubeGeometry, 
  Vector2, 
  Vector3,
  CatmullRomCurve3,
  Object3D
} from "three";

interface CustomPivotControlsProps {
  matrix?: Matrix4;
  onDrag?: (matrix: Matrix4) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  scale?: number;
  disableTranslation?: boolean;
  disableRotation?: boolean;
}

const _vec3 = new Vector3();
const _quat = new Quaternion();
const _euler = new Euler();
const _matrix = new Matrix4();

export const CustomPivotControls: FC<CustomPivotControlsProps> = ({
  matrix = new Matrix4(),
  onDrag,
  onDragStart,
  onDragEnd,
  scale = 500,
  disableTranslation = false,
  disableRotation = false
}) => {
  const groupRef = useRef<Group>(null);
  const { camera, gl, size } = useThree();
  const [dragging, setDragging] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const dragStartRef = useRef<{ point: Vector3; matrix: Matrix4 }>();
  
  // Create axis geometries with tubes for better raycasting
  const axisGeometries = useMemo(() => {
    const geos: { [key: string]: BufferGeometry } = {};
    
    // Translation axes (arrows)
    if (!disableTranslation) {
      const arrowLength = 1;
      const points = [new Vector3(0, 0, 0), new Vector3(arrowLength, 0, 0)];
      const curve = new CatmullRomCurve3(points);
      geos.translateX = new TubeGeometry(curve, 8, 0.02, 8, false);
      
      const pointsY = [new Vector3(0, 0, 0), new Vector3(0, arrowLength, 0)];
      const curveY = new CatmullRomCurve3(pointsY);
      geos.translateY = new TubeGeometry(curveY, 8, 0.02, 8, false);
      
      const pointsZ = [new Vector3(0, 0, 0), new Vector3(0, 0, arrowLength)];
      const curveZ = new CatmullRomCurve3(pointsZ);
      geos.translateZ = new TubeGeometry(curveZ, 8, 0.02, 8, false);
    }
    
    // Rotation rings with tube geometry for better raycasting
    if (!disableRotation) {
      const radius = 0.8;
      const segments = 32;
      
      // X rotation (red ring in YZ plane)
      const pointsX: Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        pointsX.push(new Vector3(0, Math.cos(angle) * radius, Math.sin(angle) * radius));
      }
      const curveX = new CatmullRomCurve3(pointsX, true);
      geos.rotateX = new TubeGeometry(curveX, segments * 2, 0.02, 8, true);
      
      // Y rotation (green ring in XZ plane)
      const pointsY: Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        pointsY.push(new Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
      }
      const curveY = new CatmullRomCurve3(pointsY, true);
      geos.rotateY = new TubeGeometry(curveY, segments * 2, 0.02, 8, true);
      
      // Z rotation (blue ring in XY plane)
      const pointsZ: Vector3[] = [];
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        pointsZ.push(new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
      }
      const curveZ = new CatmullRomCurve3(pointsZ, true);
      geos.rotateZ = new TubeGeometry(curveZ, segments * 2, 0.02, 8, true);
    }
    
    return geos;
  }, [disableTranslation, disableRotation]);
  
  // Handle raycasting
  const raycast = useCallback((event: MouseEvent) => {
    if (!groupRef.current) return null;
    
    const raycaster = new Raycaster();
    const mouse = new Vector2(
      (event.clientX / size.width) * 2 - 1,
      -(event.clientY / size.height) * 2 + 1
    );
    
    raycaster.setFromCamera(mouse, camera);
    
    const meshes: Mesh[] = [];
    groupRef.current.traverse((child) => {
      if (child instanceof Mesh) {
        meshes.push(child);
      }
    });
    
    const intersects = raycaster.intersectObjects(meshes);
    return intersects.length > 0 ? intersects[0].object.name : null;
  }, [camera, size]);
  
  // Handle mouse events
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (dragging && dragStartRef.current) {
        // Handle dragging logic based on axis type
        const raycaster = new Raycaster();
        const mouse = new Vector2(
          (event.clientX / size.width) * 2 - 1,
          -(event.clientY / size.height) * 2 + 1
        );
        raycaster.setFromCamera(mouse, camera);
        
        const newMatrix = new Matrix4().copy(dragStartRef.current.matrix);
        
        if (dragging.startsWith('translate')) {
          // Translation logic
          const axis = dragging.replace('translate', '').toLowerCase();
          const axisVector = new Vector3(
            axis === 'x' ? 1 : 0,
            axis === 'y' ? 1 : 0,
            axis === 'z' ? 1 : 0
          );
          
          // Simplified translation - just move along the axis based on mouse movement
          const delta = (event.clientX - dragStartRef.current.point.x) * 0.01 * scale;
          axisVector.multiplyScalar(delta);
          
          newMatrix.decompose(_vec3, _quat, new Vector3());
          _vec3.add(axisVector);
          newMatrix.compose(_vec3, _quat, new Vector3(1, 1, 1));
        } else if (dragging.startsWith('rotate')) {
          // Rotation logic
          const axis = dragging.replace('rotate', '').toLowerCase();
          const angle = (event.clientX - dragStartRef.current.point.x) * 0.01;
          
          newMatrix.decompose(_vec3, _quat, new Vector3());
          const rotationMatrix = new Matrix4();
          
          if (axis === 'x') rotationMatrix.makeRotationX(angle);
          else if (axis === 'y') rotationMatrix.makeRotationY(angle);
          else if (axis === 'z') rotationMatrix.makeRotationZ(angle);
          
          _quat.setFromRotationMatrix(rotationMatrix);
          newMatrix.compose(_vec3, _quat, new Vector3(1, 1, 1));
        }
        
        onDrag?.(newMatrix);
      } else {
        // Hover detection
        const hit = raycast(event);
        setHovered(hit);
      }
    };
    
    const handleMouseDown = (event: MouseEvent) => {
      const hit = raycast(event);
      if (hit) {
        setDragging(hit);
        dragStartRef.current = {
          point: new Vector3(event.clientX, event.clientY, 0),
          matrix: new Matrix4().copy(matrix)
        };
        onDragStart?.();
        event.preventDefault();
      }
    };
    
    const handleMouseUp = () => {
      if (dragging) {
        setDragging(null);
        dragStartRef.current = undefined;
        onDragEnd?.();
      }
    };
    
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, raycast, onDrag, onDragStart, onDragEnd, matrix, gl, camera, size, scale]);
  
  return (
    <group ref={groupRef} matrix={matrix} matrixAutoUpdate={false}>
      {/* Translation axes */}
      {!disableTranslation && (
        <>
          <mesh name="translateX" geometry={axisGeometries.translateX}>
            <meshBasicMaterial 
              color={hovered === 'translateX' || dragging === 'translateX' ? '#ff6666' : '#ff0000'} 
              opacity={0.8}
              transparent
            />
          </mesh>
          <mesh name="translateY" geometry={axisGeometries.translateY}>
            <meshBasicMaterial 
              color={hovered === 'translateY' || dragging === 'translateY' ? '#66ff66' : '#00ff00'} 
              opacity={0.8}
              transparent
            />
          </mesh>
          <mesh name="translateZ" geometry={axisGeometries.translateZ}>
            <meshBasicMaterial 
              color={hovered === 'translateZ' || dragging === 'translateZ' ? '#6666ff' : '#0000ff'} 
              opacity={0.8}
              transparent
            />
          </mesh>
        </>
      )}
      
      {/* Rotation rings */}
      {!disableRotation && (
        <>
          <mesh name="rotateX" geometry={axisGeometries.rotateX}>
            <meshBasicMaterial 
              color={hovered === 'rotateX' || dragging === 'rotateX' ? '#ff6666' : '#ff0000'} 
              opacity={0.8}
              transparent
              side={DoubleSide}
            />
          </mesh>
          <mesh name="rotateY" geometry={axisGeometries.rotateY}>
            <meshBasicMaterial 
              color={hovered === 'rotateY' || dragging === 'rotateY' ? '#66ff66' : '#00ff00'} 
              opacity={0.8}
              transparent
              side={DoubleSide}
            />
          </mesh>
          <mesh name="rotateZ" geometry={axisGeometries.rotateZ}>
            <meshBasicMaterial 
              color={hovered === 'rotateZ' || dragging === 'rotateZ' ? '#6666ff' : '#0000ff'} 
              opacity={0.8}
              transparent
              side={DoubleSide}
            />
          </mesh>
        </>
      )}
      
      {/* Visual feedback */}
      {(hovered || dragging) && (
        <Html position={[0, 1.5, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}>
            {hovered || dragging}
          </div>
        </Html>
      )}
    </group>
  );
};