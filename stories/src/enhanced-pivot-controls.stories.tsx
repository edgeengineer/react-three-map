import { Box, Sphere, ScreenSizer } from "@react-three/drei";
import { useControls } from "leva";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Marker as MapboxMarker } from "react-map-gl/mapbox";
import { Marker as MaplibreMarker } from "react-map-gl/maplibre";
import { useMap, vector3ToCoords } from "react-three-map";
import { Euler, Matrix4, Vector3, Vector3Tuple } from "three";
import { StoryMap } from "./story-map";
import { EnhancedPivotControls } from "./EnhancedPivotControls";

export function EnhancedPivotStory() {
  const origin = useControls({
    latitude: { value: 51, min: -90, max: 90 },
    longitude: { value: 0, min: -180, max: 180 },
    altitude: { value: 0, min: -1000, max: 10000, step: 10 },
    showTranslation: { value: true, label: 'Show Translation' },
    showRotationX: { value: true, label: 'Show Rotation X (Red)' },
    showRotationY: { value: true, label: 'Show Rotation Y (Green)' },
    showRotationZ: { value: true, label: 'Show Rotation Z (Blue)' },
    showLabels: { value: true, label: 'Show Axis Labels' },
    controlScale: { value: 500, min: 100, max: 1000, step: 50, label: 'Control Scale' }
  })
  const [position, setPosition] = useState<Vector3Tuple>([0, 0, 0]);
  const [rotation, setRotation] = useState<Vector3Tuple>([0, 0, 0]);
  const geoPos = useMemo(() => vector3ToCoords(position, origin), [position, origin])

  // reset on origin change
  useEffect(() => {
    setPosition([0, 0, 0]);
    setRotation([0, 0, 0]);
  }, [origin.latitude, origin.longitude, origin.altitude])

  const hasAnyRotation = origin.showRotationX || origin.showRotationY || origin.showRotationZ;

  return <div style={{ height: '100vh' }}>
    <StoryMap
      {...origin}
      zoom={13}
      pitch={60}
      canvas={{ altitude: origin.altitude }}
      maplibreChildren={(
        <MaplibreMarker {...geoPos}>
          <div style={{ fontSize: 14, background: 'rgba(255,255,255,0.9)', padding: '4px', borderRadius: '4px' }}>
            <strong>Position:</strong><br />
            lat: {geoPos.latitude.toFixed(6)}<br />
            lon: {geoPos.longitude.toFixed(6)}<br />
            alt: {geoPos.altitude?.toFixed(2) || 0}m<br />
            {hasAnyRotation && (
              <>
                <strong>Rotation:</strong><br />
                {origin.showRotationX && <span style={{color: '#ff0000'}}>X: {(rotation[0] * 180 / Math.PI).toFixed(1)}°<br /></span>}
                {origin.showRotationY && <span style={{color: '#00ff00'}}>Y: {(rotation[1] * 180 / Math.PI).toFixed(1)}°<br /></span>}
                {origin.showRotationZ && <span style={{color: '#0000ff'}}>Z: {(rotation[2] * 180 / Math.PI).toFixed(1)}°<br /></span>}
              </>
            )}
          </div>
        </MaplibreMarker>
      )}
      mapboxChildren={(
        <MapboxMarker {...geoPos}>
          <div style={{ fontSize: 14, background: 'rgba(255,255,255,0.9)', padding: '4px', borderRadius: '4px' }}>
            <strong>Position:</strong><br />
            lat: {geoPos.latitude.toFixed(6)}<br />
            lon: {geoPos.longitude.toFixed(6)}<br />
            alt: {geoPos.altitude?.toFixed(2) || 0}m<br />
            {hasAnyRotation && (
              <>
                <strong>Rotation:</strong><br />
                {origin.showRotationX && <span style={{color: '#ff0000'}}>X: {(rotation[0] * 180 / Math.PI).toFixed(1)}°<br /></span>}
                {origin.showRotationY && <span style={{color: '#00ff00'}}>Y: {(rotation[1] * 180 / Math.PI).toFixed(1)}°<br /></span>}
                {origin.showRotationZ && <span style={{color: '#0000ff'}}>Z: {(rotation[2] * 180 / Math.PI).toFixed(1)}°<br /></span>}
              </>
            )}
          </div>
        </MapboxMarker>
      )}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      <Move 
        position={position} 
        rotation={rotation}
        setPosition={setPosition} 
        setRotation={setRotation}
        showTranslation={origin.showTranslation}
        showRotationX={origin.showRotationX}
        showRotationY={origin.showRotationY}
        showRotationZ={origin.showRotationZ}
        showLabels={origin.showLabels}
        scale={origin.controlScale}
      />
      <ScreenSizer position={position} rotation={rotation} scale={1}>
        <Sphere
          args={[50]}
          position={[0, 0, 0]}
          material-color={'orange'}
        />
      </ScreenSizer>
      <InteractiveBoxes />
      <axesHelper position={position} rotation={rotation} args={[1000]} />
    </StoryMap>
  </div>
}

interface MovingBoxProps {
  position: Vector3Tuple,
  rotation: Vector3Tuple,
  setPosition: (pos: Vector3Tuple) => void,
  setRotation: (rot: Vector3Tuple) => void,
  showTranslation: boolean,
  showRotationX: boolean,
  showRotationY: boolean,
  showRotationZ: boolean,
  showLabels: boolean,
  scale: number
}

const _v3 = new Vector3()
const _euler = new Euler()

const InteractiveBoxes: FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const positions: Vector3Tuple[] = [
    [-500, 0, -500],
    [500, 0, -500],
    [-500, 0, 500],
    [500, 0, 500],
    [0, 200, 0],
    [0, -200, 0]
  ];
  
  return (
    <>
      {positions.map((pos, index) => (
        <Box
          key={index}
          position={pos}
          args={[100, 100, 100]}
          onPointerOver={() => setHoveredIndex(index)}
          onPointerOut={() => setHoveredIndex(null)}
        >
          <meshStandardMaterial 
            color={hoveredIndex === index ? 'hotpink' : 'lightblue'} 
          />
        </Box>
      ))}
    </>
  );
};

const Move: FC<MovingBoxProps> = ({ 
  position, 
  rotation, 
  setPosition, 
  setRotation, 
  showTranslation,
  showRotationX,
  showRotationY,
  showRotationZ,
  showLabels,
  scale
}) => {
  const matrix = useMemo(() => {
    const m = new Matrix4();
    m.makeRotationFromEuler(_euler.fromArray(rotation));
    m.setPosition(...position);
    return m;
  }, [position, rotation]);
  
  const map = useMap();
  const onDragStart = useCallback(() => {
    map.dragPan.disable();
    map.dragRotate.disable();
  }, [map]);
  
  const onDragEnd = useCallback(() => {
    map.dragPan.enable();
    map.dragRotate.enable();
  }, [map]);
  
  const onDrag = useCallback((m4: Matrix4) => {
    setPosition(_v3.setFromMatrixPosition(m4).toArray());
    if (showRotationX || showRotationY || showRotationZ) {
      _euler.setFromRotationMatrix(m4);
      setRotation(_euler.toArray() as Vector3Tuple);
    }
  }, [setPosition, setRotation, showRotationX, showRotationY, showRotationZ])
  
  const disableRotations = useMemo(() => {
    return [!showRotationX, !showRotationY, !showRotationZ] as [boolean, boolean, boolean];
  }, [showRotationX, showRotationY, showRotationZ]);
  
  const disableTranslations = useMemo(() => {
    return [!showTranslation, !showTranslation, !showTranslation] as [boolean, boolean, boolean];
  }, [showTranslation]);
  
  return (
    <EnhancedPivotControls
      fixed
      matrix={matrix}
      disableRotations={disableRotations}
      disableTranslations={disableTranslations}
      scale={scale}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrag={onDrag}
      annotations={showLabels}
    />
  )
}

export default {
  title: 'PivotControls',
  component: EnhancedPivotStory,
};