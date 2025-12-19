import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import Mind from "./classes/Mind";
import Mental from "./classes/Mental";
import { OrbitControls } from "./components/OrbitControls";

function MindSphere() {
  const mind = useMemo(() => {
    const mindInstance = new Mind({
      name: "My Mind",
      detail: "This is a detailed description",
      position: [0, 0, 0],
      scale: 1.5,
      transparent: true,
      opacity: 0.15,
      color: 0x3cdd8c,
    });

    const thought1 = new Mental({
      name: "Thought 1",
      detail: "First mental sphere",
      position: [0.3, 0.2, 0.1],
      scale: 0.1,
      color: 0xff6b9d,
    });
    const thought2 = new Mental({
      name: "Thought 2",
      detail: "Second mental sphere",
      position: [-0.3, -0.2, 0.1],
      scale: 0.1,
      color: 0x4ecdc4,
    });
    const thought3 = new Mental({
      name: "Thought 3",
      detail: "Third mental sphere",
      position: [0, 0.3, -0.2],
      scale: 0.1,
      color: 0xffe66d,
    });
    const thought4 = new Mental({
      name: "Thought 4",
      detail: "Fourth mental sphere",
      position: [0.2, -0.2, 0.3],
      scale: 0.1,
      color: 0xff9ff3,
    });
    const thought5 = new Mental({
      name: "Thought 5",
      detail: "Fifth mental sphere",
      position: [-0.2, 0.1, -0.1],
      scale: 0.08,
      color: 0x95e1d3,
    });

    mindInstance.addMental(thought1);
    mindInstance.addMental(thought2);
    mindInstance.addMental(thought3);
    mindInstance.addMental(thought4);
    mindInstance.addMental(thought5);

    return mindInstance;
  }, []);

  useFrame((_state, delta) => {
    mind.updatePhysics(delta);
  });

  useEffect(() => {
    return () => {
      mind.dispose();
    };
  }, [mind]);

  const mindMesh = mind.getMesh();
  if (!mindMesh) return null;

  return <primitive object={mindMesh} />;
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color={0xffffff} metalness={0.0} roughness={1.0} />
    </mesh>
  );
}

export function MindWebsiteScene() {
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
      <MindSphere />
    </Canvas>
  );
}



