// @ts-nocheck - react-three/fiber JSX elements are valid at runtime
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
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
  const mentalMapRef = useRef<Map<number, Mental>>(new Map()); // Track mental spheres by ID

  // Create mind instance only once, or recreate if mind properties change
  const mind = useMemo(() => {
    if (mindRef.current) {
      const currentMind = mindRef.current;
      const colorNum = parseInt(mindData.color.replace('#', ''), 16);
      const currentColor = (currentMind.getMesh()?.material as any)?.color?.getHex();
      
      // Only recreate if mind properties actually changed
      if (currentColor !== colorNum || 
          Math.abs(mindData.scale - currentMind.scale) > 0.001) {
        // Dispose all mentals first
        mentalMapRef.current.forEach(mental => {
          mental.dispose();
        });
        mentalMapRef.current.clear();
        currentMind.dispose();
        mindRef.current = null;
      }
    }

    if (!mindRef.current) {
      const colorNum = parseInt(mindData.color.replace('#', ''), 16);

      const mindInstance = new Mind({
        name: mindData.name,
        detail: "",
        position: mindData.position,
        scale: mindData.scale,
        transparent: true,
        opacity: 0.4,
        color: colorNum,
        labelEnabled: true,
        labelWorldSize: 0.6,
        labelOffset: 0.25,
      });

      mindRef.current = mindInstance;
    }

    return mindRef.current;
  }, [mindData.id, mindData.color, mindData.scale, mindData.name]);

  // Update mental spheres dynamically when mentalDataList changes
  useEffect(() => {
    if (!mind) return;

    const currentMentalIds = new Set(mentalMapRef.current.keys());
    const newMentalIds = new Set(mentalDataList.map(m => m.id));

    // Remove mentals that are no longer in the list
    currentMentalIds.forEach(id => {
      if (!newMentalIds.has(id)) {
        const mental = mentalMapRef.current.get(id);
        if (mental) {
          mind.removeMental(mental);
          mental.dispose();
          mentalMapRef.current.delete(id);
        }
      }
    });

    // Add new mentals or update existing ones
    mentalDataList.forEach(mentalData => {
      // Skip mental spheres without a name (likely preview or invalid)
      if (!mentalData.name || mentalData.name.trim() === '') {
        return;
      }

      if (!mentalMapRef.current.has(mentalData.id)) {
        // Create new mental sphere
        const mentalColorNum = parseInt(mentalData.color.replace('#', ''), 16);
        const mental = new Mental({
          name: mentalData.name,
          detail: "",
          position: mentalData.position,
          scale: mentalData.scale,
          color: mentalColorNum,
        });
        mind.addMental(mental);
        mentalMapRef.current.set(mentalData.id, mental);
      } else {
        // Update existing mental sphere properties if needed
        const mental = mentalMapRef.current.get(mentalData.id)!;
        const mentalColorNum = parseInt(mentalData.color.replace('#', ''), 16);
        if (mental.getName() !== mentalData.name) {
          mental.setName(mentalData.name);
        }
        if (mental.getMesh()?.material && (mental.getMesh()?.material as any)?.color?.getHex() !== mentalColorNum) {
          mental.setColor(mentalColorNum);
        }
        if (Math.abs(mental.scale - mentalData.scale) > 0.001) {
          mental.setScale(mentalData.scale);
        }
      }
    });
  }, [mind, mentalDataList]);

  useFrame((_state: any, delta: number) => {
    if (mind) {
      mind.updatePhysics(delta);
    }
  });

  useEffect(() => {
    return () => {
      if (mindRef.current) {
        // Dispose all mentals
        mentalMapRef.current.forEach(mental => {
          mental.dispose();
        });
        mentalMapRef.current.clear();
        mindRef.current.dispose();
        mindRef.current = null;
      }
    };
  }, []);

  const mindMesh = mind.getMesh();
  if (!mindMesh) return null;

  return <primitive object={mindMesh} />;
}

function MindSpheres({ minds, mentals }: { minds: MindData[]; mentals: MentalData[] }) {
  // Debug: Log what's being passed to the scene
  if (minds.length > 0 || mentals.length > 0) {
    console.log('[MindSpheres] Rendering:', {
      mindsCount: minds.length,
      mentalsCount: mentals.length,
      minds: minds.map(m => ({ id: m.id, name: m.name, mental_sphere_ids: m.mental_sphere_ids })),
      mentals: mentals.map(m => ({ id: m.id, name: m.name }))
    });
  }

  return (
    <>
      {minds.map(mind => {
        // Filter mentals that belong to this mind based on mental_sphere_ids
        // Only show mental spheres that are explicitly in the mind's mental_sphere_ids array
        // Also filter out mental spheres without names (preview/invalid)
        const mindMentals = mentals.filter(m => {
          if (!m.name || m.name.trim() === '') return false;
          if (!m.id || typeof m.id !== 'number') return false;
          // If no mapping provided, fall back to showing all mentals.
          if (!mind.mental_sphere_ids || !Array.isArray(mind.mental_sphere_ids) || mind.mental_sphere_ids.length === 0) {
            return true;
          }
          return mind.mental_sphere_ids.includes(m.id);
        });
        
        // Debug: Log what mental spheres are being shown for each mind
        if (mindMentals.length > 0) {
          console.log(`[MindSpheres] Mind ${mind.id} (${mind.name}) showing ${mindMentals.length} mental spheres:`, 
            mindMentals.map(m => ({ id: m.id, name: m.name })),
            `mental_sphere_ids: [${mind.mental_sphere_ids?.join(', ')}]`
          );
        }
        
        // Debug: Log if we're showing mental spheres that shouldn't be there
        if (mindMentals.length > 0 && (!mind.mental_sphere_ids || mind.mental_sphere_ids.length === 0)) {
          console.warn(`[MindSpheres] WARNING: Mind ${mind.id} has mental spheres but no mental_sphere_ids array`);
        }
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
      <meshStandardMaterial 
        color={0x808080} 
        metalness={0.1}
        roughness={0.5}
      />
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
      style={{ width: "100%", height: "100%", background: "#ffffff" }}
    >
      <Environment preset="dawn" background blur={1} />

      <OrbitControls
        enableDamping={true}
        dampingFactor={0.05}
        enableZoom={true}
        enablePan={true}
        minDistance={2}
        maxDistance={10}
        target={[0, 0, 0]}
      />

      <ambientLight intensity={1.0} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 3, -5]} intensity={1.5} />
      <pointLight position={[0, 6, 0]} intensity={2.0} distance={15} decay={2} />
      <pointLight position={[0, 0, 5]} intensity={1.5} distance={15} decay={2} />

      <GroundPlane />
      {minds.length > 0 && <MindSpheres minds={minds} mentals={mentals} />}
    </Canvas>
  );
}



