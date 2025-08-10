import { Box, PivotControls, ScreenSizer, Sphere } from "@react-three/drei";
import { useControls } from "leva";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Marker as MapboxMarker } from "react-map-gl/mapbox";
import { Marker as MaplibreMarker } from "react-map-gl/maplibre";
import { useMap, 
  vector3ToCoords
 } from "react-three-map";
import { Euler, Matrix4, Vector3, Vector3Tuple } from "three";
import { StoryMap } from "./story-map";

export function Default() {
  const origin = useControls({
    latitude: { value: 51, min: -90, max: 90 },
    longitude: { value: 0, min: -180, max: 180 },
    altitude: { value: 0, min: -1000, max: 10000, step: 10 },
    enableRotation: { value: false, label: 'Enable Rotation' }
  })
  const [position, setPosition] = useState<Vector3Tuple>([0, 0, 0]);
  const [rotation, setRotation] = useState<Vector3Tuple>([0, 0, 0]);
  const geoPos = useMemo(() => vector3ToCoords(position, origin), [position, origin])

  // reset on origin change
  useEffect(() => {
    setPosition([0, 0, 0]);
    setRotation([0, 0, 0]);
  }, [origin]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div style={{ height: '100vh' }}>
    <StoryMap
      {...origin}
      zoom={13}
      pitch={60}
      canvas={{ altitude: origin.altitude }}
      maplibreChildren={(
        <MaplibreMarker {...geoPos}>
          <div style={{ fontSize: 14, background: 'rgba(255,255,255,0.9)', padding: '4px', borderRadius: '4px' }}>
            lat: {geoPos.latitude.toFixed(6)}<br />
            lon: {geoPos.longitude.toFixed(6)}<br />
            {origin.enableRotation && (
              <>
                rx: {(rotation[0] * 180 / Math.PI).toFixed(1)}°<br />
                ry: {(rotation[1] * 180 / Math.PI).toFixed(1)}°<br />
                rz: {(rotation[2] * 180 / Math.PI).toFixed(1)}°
              </>
            )}
          </div>
        </MaplibreMarker>
      )}
      mapboxChildren={(
        <MapboxMarker {...geoPos}>
          <div style={{ fontSize: 14, background: 'rgba(255,255,255,0.9)', padding: '4px', borderRadius: '4px' }}>
            lat: {geoPos.latitude.toFixed(6)}<br />
            lon: {geoPos.longitude.toFixed(6)}<br />
            {origin.enableRotation && (
              <>
                rx: {(rotation[0] * 180 / Math.PI).toFixed(1)}°<br />
                ry: {(rotation[1] * 180 / Math.PI).toFixed(1)}°<br />
                rz: {(rotation[2] * 180 / Math.PI).toFixed(1)}°
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
        enableRotation={origin.enableRotation}
      />
      <ScreenSizer position={position} rotation={rotation} scale={1}>
        <Sphere
          args={[50]}
          position={[0, 25, 0]}
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
  enableRotation: boolean
}

const _v3 = new Vector3()

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

const _euler = new Euler();

const Move: FC<MovingBoxProps> = ({ position, rotation, setPosition, setRotation, enableRotation }) => {
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
    if (enableRotation) {
      _euler.setFromRotationMatrix(m4);
      setRotation(_euler.toArray() as Vector3Tuple);
    }
  }, [setPosition, setRotation, enableRotation])
  
  return (
    <PivotControls
      fixed
      matrix={matrix}
      activeAxes={[true, true, true]}
      disableRotations={!enableRotation}
      scale={500}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDrag={onDrag}
    />
  )
}