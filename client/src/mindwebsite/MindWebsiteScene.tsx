// @ts-nocheck - react-three/fiber JSX elements are valid at runtime
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import Mind from "./classes/Mind";
import Mental from "./classes/Mental";
import { OrbitControls } from "./components/OrbitControls";

interface MindData {
  id: number;
  name: string;
  color: string;
  position: [number, number, number];
  scale: number;
  mental_sphere_ids?: number[];
}

interface MentalData {
  id: number;
  name: string;
  color: string;
  scale: number;
  position: [number, number, number];
}

function MindSphere({ mindData, mentalDataList }: { mindData: MindData; mentalDataList: MentalData[] }) {
  const mindRef = useRef<Mind | null>(null);

  const mind = useMemo(() => {
    if (mindRef.current) {
      mindRef.current.dispose();
    }

    const colorNum = parseInt(mindData.color.replace('#', ''), 16);

    const mindInstance = new Mind({
      name: mindData.name,
      detail: "",
      position: mindData.position,
      scale: mindData.scale,
      transparent: true,
      opacity: 0.15,
      color: colorNum,
    });

    // Add mental spheres
    mentalDataList.forEach(mentalData => {
      const mentalColorNum = parseInt(mentalData.color.replace('#', ''), 16);
      const mental = new Mental({
        name: mentalData.name,
        detail: "",
        position: mentalData.position,
        scale: mentalData.scale,
        color: mentalColorNum,
      });
      mindInstance.addMental(mental);
    });

    mindRef.current = mindInstance;
    return mindInstance;
  }, [mindData, mentalDataList]);

  useFrame((_state: any, delta: number) => {
    if (mind) {
      mind.updatePhysics(delta);
    }
  });

  useEffect(() => {
    return () => {
      if (mind) {
        mind.dispose();
      }
    };
  }, [mind]);

  const mindMesh = mind.getMesh();
  if (!mindMesh) return null;

  return <primitive object={mindMesh} />;
}

function MindSpheres({ minds, mentals }: { minds: MindData[]; mentals: MentalData[] }) {
  return (
    <>
      {minds.map(mind => {
        const mindMentals = mentals.filter(m => 
          mind.mental_sphere_ids?.includes(m.id) || true // For now, show all mentals
        );
        return (
          <MindSphere 
            key={mind.id} 
            mindData={mind} 
            mentalDataList={mindMentals}
          />
        );
      })}
    </>
  );
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color={0xffffff} metalness={0.0} roughness={1.0} />
    </mesh>
  );
}

interface MindWebsiteSceneProps {
  minds?: Array<{
    id: number;
    name: string;
    color: string;
    position: [number, number, number];
    scale: number;
    mental_sphere_ids?: number[];
  }>;
  mentals?: Array<{
    id: number;
    name: string;
    color: string;
    scale: number;
    position: [number, number, number];
  }>;
}

export function MindWebsiteScene({ minds = [], mentals = [] }: MindWebsiteSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      shadows
      gl={{ antialias: true, toneMappingExposure: 1.2 }}
      style={{ width: "100%", height: "100%" }}
    >
      <OrbitControls
        enableDamping={true}
        dampingFactor={0.05}
        enableZoom={true}
        enablePan={true}
        minDistance={2}
        maxDistance={10}
        target={[0, 0, 0]}
      />

      <ambientLight intensity={0.2} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} />
      <pointLight position={[0, 6, 0]} intensity={1.2} distance={15} decay={2} />

      <GroundPlane />
      {minds.length > 0 ? (
        <MindSpheres minds={minds} mentals={mentals} />
      ) : (
        <MindSphere 
          mindData={{
            id: 0,
            name: "My Mind",
            color: "#3cdd8c",
            position: [0, 0, 0],
            scale: 1.5,
            mental_sphere_ids: []
          }}
          mentalDataList={[]}
        />
      )}
    </Canvas>
  );
}



