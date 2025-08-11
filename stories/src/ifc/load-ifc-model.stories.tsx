import { Plane } from "@react-three/drei";
import { button, folder, useControls } from "leva";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from 'three';
import { MathUtils } from "three";
import * as OBC from '@thatopen/components';
import * as FRAGS from '@thatopen/fragments';
import { StoryMap } from "../story-map";
import modelUrl from './model.ifc?url';

export function Default() {

  const [path, setPath] = useState(modelUrl);

  const loadIfcClick = useCallback(async () => {
    try {
      setPath(await getLocalFileUrl());
    } catch (error) {
      console.warn(error);
    }
  }, [])

  useControls({
    'load IFC file': button(() => loadIfcClick())
  })

  const { latitude, longitude, position, rotation, scale } = useControls({
    coords: folder({
      latitude: {
        value: 51.508775,
        pad: 6,
      },
      longitude: {
        value: -0.1261,
        pad: 6,
      },
    }),
    position: {
      value: {x: 0, y: .32, z: 0},
      step: 1,
      pad: 2,
    },
    rotation: {
      value: 0,
      step: 1,
    },
    scale: 1,
  })

  return <StoryMap latitude={latitude} longitude={longitude} zoom={20} pitch={75} bearing={-45} canvas={{shadows: true}}>
    <Lights />
    <Plane
      args={[200, 200]}
      position={[0, 0, 0]}
      rotation={[-90 * MathUtils.DEG2RAD, 0, 0]}
      receiveShadow
    >      
      <shadowMaterial opacity={.5} />
    </Plane>
    <object3D position={[position.x, position.y, position.z]} rotation={[0,rotation*MathUtils.DEG2RAD,0]} scale={scale}>
      <Suspense fallback={<Plane
        args={[7, 16]}
        rotation={[-90 * MathUtils.DEG2RAD, 0, 0]}
        material-color="#cccccc"
      />}>
        <IfcModel path={path} />
      </Suspense>
    </object3D>
  </StoryMap>
}

function Lights() {
  const camSize = 50;
  return <>
    <ambientLight intensity={0.5 * Math.PI} />
    <directionalLight
      castShadow
      position={[2.5, 50, 5]}
      intensity={1.5 * Math.PI}
      shadow-mapSize={1024}
    >
      <orthographicCamera
        attach="shadow-camera"
        args={[-camSize, camSize, -camSize, camSize, 0.1, 100]}
      />
    </directionalLight>
    <pointLight position={[-10, 0, -20]} intensity={Math.PI} />
    <pointLight position={[0, -10, 0]} intensity={Math.PI} />
  </>
}

interface IfcModelProps {
  path: string
}

function IfcModel({ path }: IfcModelProps) {
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const componentsRef = useRef<OBC.Components | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadIFC() {
      try {
        // Fetch the IFC file
        const response = await fetch(path);
        const arrayBuffer = await response.arrayBuffer();
        const ifcData = new Uint8Array(arrayBuffer);

        // Initialize components system
        if (!componentsRef.current) {
          componentsRef.current = new OBC.Components();
          
          // Set up IFC loader with minimal configuration
          // The new library has issues with WASM initialization in browser environments
          // For now, we'll show a placeholder with a note about the IFC loader
          console.warn('IFC loading with @thatopen/components requires additional WASM setup.');
          console.warn('See: https://docs.thatopen.com/Tutorials/Components/Core/IfcLoader');
          
          // Return early with placeholder for now
          if (mounted) {
            const placeholder = new THREE.Group();
            
            // Add a box to represent the IFC model
            const box = new THREE.Mesh(
              new THREE.BoxGeometry(10, 15, 10),
              new THREE.MeshStandardMaterial({ 
                color: 0x4488ff,
                opacity: 0.8,
                transparent: true
              })
            );
            box.castShadow = true;
            placeholder.add(box);
            
            // Add a text sprite to indicate IFC placeholder
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = 'white';
              ctx.font = '24px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('IFC Model', 128, 40);
            }
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.position.y = 10;
            sprite.scale.set(10, 2.5, 1);
            placeholder.add(sprite);
            
            setModel(placeholder);
          }
          return;
        }

        // Load the IFC file
        const ifcLoader = componentsRef.current.get(OBC.IfcLoader);
        const fragmentsModel = await ifcLoader.load(
          ifcData, 
          true, // coordinate
          path.split('/').pop() || 'model' // name
        );

        // Set shadow casting on the loaded model
        fragmentsModel.object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        if (mounted) {
          setModel(fragmentsModel.object);
        }
      } catch (error) {
        console.error('Failed to load IFC:', error);
        
        // Fallback to placeholder mesh on error
        if (mounted) {
          const placeholder = new THREE.Mesh(
            new THREE.BoxGeometry(5, 10, 5),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
          );
          placeholder.castShadow = true;
          setModel(placeholder);
        }
      }
    }

    loadIFC();

    return () => {
      mounted = false;
      // Clean up components on unmount
      if (componentsRef.current) {
        componentsRef.current.dispose();
        componentsRef.current = null;
      }
    };
  }, [path]);

  if (!model) {
    return (
      <Plane
        args={[7, 16]}
        rotation={[-90 * MathUtils.DEG2RAD, 0, 0]}
        material-color="#cccccc"
      />
    );
  }

  return <primitive object={model} />;
}

async function getLocalFileUrl() {
  return new Promise<string>((resolve) => {
    const onChange = (e: Event) => {
      if (!(e.target instanceof HTMLInputElement) || !e.target.files) return;
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      resolve(url);
    };
    const input = document.createElement('input');
    input.type = 'file';
    input.addEventListener('change', onChange);
    input.accept = '.ifc';
    input.click();
  });
}
