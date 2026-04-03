import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import Mind from '../mindwebsite/classes/Mind'
import Mental from '../mindwebsite/classes/Mental'
import PerceptionMental from '../mindwebsite/classes/neutral/PerceptionMental'
import ContactMental from '../mindwebsite/classes/neutral/ContactMental'
import FeelingMental from '../mindwebsite/classes/neutral/FeelingMental'
import IntentionMental from '../mindwebsite/classes/neutral/IntentionMental'
import AttentionMental from '../mindwebsite/classes/neutral/AttentionMental'
import ConcentrationMental from '../mindwebsite/classes/neutral/ConcentrationMental'
import LifeFacultyMental from '../mindwebsite/classes/neutral/LifeFacultyMental'
import GoodMental from '../mindwebsite/classes/good/GoodMental'
import BadMental from '../mindwebsite/classes/bad/BadMental'
import GreedMental from '../mindwebsite/classes/bad/GreedMental'
import HatredMental from '../mindwebsite/classes/bad/HatredMental'
import DelusionMental from '../mindwebsite/classes/bad/DelusionMental'
import WrongViewMental from '../mindwebsite/classes/bad/WrongViewMental'
import ConceitMental from '../mindwebsite/classes/bad/ConceitMental'
import DoubtMental from '../mindwebsite/classes/bad/DoubtMental'
import RestlessnessMental from '../mindwebsite/classes/bad/RestlessnessMental'
import ShamelessnessMental from '../mindwebsite/classes/bad/ShamelessnessMental'
import RecklessnessMental from '../mindwebsite/classes/bad/RecklessnessMental'
import SlothMental from '../mindwebsite/classes/bad/SlothMental'
import TorporMental from '../mindwebsite/classes/bad/TorporMental'
import WorryMental from '../mindwebsite/classes/bad/WorryMental'
import EnvyMental from '../mindwebsite/classes/bad/EnvyMental'
import StinginessMental from '../mindwebsite/classes/bad/StinginessMental'
import NeutralMental from '../mindwebsite/classes/neutral/NeutralMental'
import type { InspectSelection } from '../types/InspectSelection'
import { detailTextForVoiceNarration } from '../utils/inspectVoiceText'
import { InspectPanel } from '../components/InspectPanel'
import ProfilePanel from '../components/ProfilePanel'
import { EffectComposer, Outline } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import violinModel from '../assets/violin.glb?url'
import perceptionBowlModel from '../assets/bowl.glb?url'
import paperPlaneModel from '../assets/paper_plane.glb?url'
import angerEmojiModel from '../assets/emoji/anger_emoji.glb?url'
  
type Vec3 = [number, number, number]

type MentalSeed = {
  name: string
  color: string
  scale: number
  position: Vec3
  detail?: string
  modelPath?: string
  modelTargetWorldSize?: number
  modelOffset?: { x?: number; y?: number; z?: number }
  type?: 'perception'
  variant?:
    | 'good'
    | 'bad'
    | 'greed'
    | 'hatred'
    | 'delusion'
    | 'wrong_view'
    | 'conceit'
    | 'doubt'
    | 'restlessness'
    | 'shamelessness'
    | 'recklessness'
    | 'sloth'
    | 'torpor'
    | 'worry'
    | 'envy'
    | 'stinginess'
    | 'neutral'
    | 'perception'
    | 'contact'
    | 'feeling'
    | 'intention'
    | 'attention'
    | 'concentration'
    | 'life_faculty'
}

function HumanBody({
  mind,
  controlsRef,
  url = `${import.meta.env.BASE_URL}assets/humanMind/human.gltf`,
  targetHeight = 6,
  groundY = -2,
  bodyOpacity = 0.02,
  mindYOffsetWorld = 0.9,
  humanZOffsetWorld = 0.12,
  mindScale: mindScaleProp = 0.35,
}: {
  mind: Mind
  controlsRef?: React.RefObject<OrbitControlsImpl | null>
  url?: string
  targetHeight?: number
  groundY?: number
  bodyOpacity?: number
  mindYOffsetWorld?: number
  humanZOffsetWorld?: number
  mindScale?: number
}) {
  const gltf = useGLTF(url) as unknown as { scene: THREE.Group }

  // Clone so we can safely tweak materials without affecting Drei's GLTF cache.
  const humanScene = useMemo(() => gltf.scene.clone(true), [gltf.scene])

  const { scaleFactor, humanPosition, chestWorld } = useMemo(() => {
    const bbox = new THREE.Box3().setFromObject(humanScene)
    const size = bbox.getSize(new THREE.Vector3())
    const center = bbox.getCenter(new THREE.Vector3())

    const safeHeight = Math.max(0.00001, size.y)
    const s = targetHeight / safeHeight

    // Center the model in X/Z and put its lowest point on the ground plane.
    const posX = -center.x * s
    // Base Z used for the "true" chest anchor (mind stays here).
    const posZBase = -center.z * s
    // Visual-only Z offset: moves the human mesh without dragging the mind along.
    // Positive Z moves the model toward the camera (forward).
    const posZ = posZBase + humanZOffsetWorld
    const posY = groundY - bbox.min.y * s

    // Chest anchor: higher in the torso so the mind sits more naturally in the chest.
    const chestLocal = new THREE.Vector3(center.x, bbox.min.y + size.y * 0.68, center.z + size.z * 0.06)
    const chestW = new THREE.Vector3(posX, posY, posZBase).add(chestLocal.multiplyScalar(s))

    return {
      scaleFactor: s,
      humanPosition: new THREE.Vector3(posX, posY, posZ),
      chestWorld: chestW,
    }
  }, [groundY, humanScene, humanZOffsetWorld, targetHeight])

  useLayoutEffect(() => {
    // Fit the mind comfortably inside the torso, then place it in the chest.
    // Scale Y offset with body size so the mind stays in the chest at any targetHeight.
    const scaledMindY = mindYOffsetWorld * (targetHeight / 18)
    // Place mind inside the torso: use a fraction of body Z offset so it sits between back and front.
    const mindZ = chestWorld.z + humanZOffsetWorld * 0.45
    mind.setScale(mindScaleProp)
    mind.setPosition(chestWorld.x, chestWorld.y + scaledMindY, mindZ)

    // Keep orbit pivot aligned with the mind/chest without relying on a React re-render.
    const ctl = controlsRef?.current
    if (ctl) {
      ctl.target.set(chestWorld.x, chestWorld.y + scaledMindY, mindZ)
      ctl.update()
    }
  }, [chestWorld.x, chestWorld.y, chestWorld.z, mind, mindYOffsetWorld, mindScaleProp, targetHeight, humanZOffsetWorld])

  useMemo(() => {
    // Make the body easy to see through so the mind is visible "inside".
    humanScene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      const mat = mesh.material
      const apply = (m: THREE.Material) => {
        const pm = m as THREE.MeshStandardMaterial
        pm.transparent = true
        // Explicit opacity so the body is more visible (user-requested).
        pm.opacity = THREE.MathUtils.clamp(bodyOpacity, 0, 1)
        pm.depthWrite = false
        pm.needsUpdate = true
      }
      if (Array.isArray(mat)) mat.forEach(apply)
      else if (mat) apply(mat)
    })
    return humanScene
  }, [bodyOpacity, humanScene])

  return (
    <group position={[humanPosition.x, humanPosition.y, humanPosition.z]} scale={scaleFactor}>
      <primitive object={humanScene} />
    </group>
  )
}

function MindSphere({
  mind,
  selectedMentalName,
  focusTargetRef,
}: {
  mind: Mind
  selectedMentalName: string | null
  focusTargetRef: React.MutableRefObject<THREE.Vector3 | null>
}) {
  const { camera } = useThree()

  useEffect(() => {
    return () => {
      mind.dispose()
    }
  }, [mind])

  useFrame((_state, delta) => {
    mind.updatePhysics(delta)

    if (selectedMentalName && focusTargetRef.current) {
      const target = focusTargetRef.current
      const radius = mind.getRadius?.() ?? 1
      const desiredDistance = Math.max(0.35, Math.min(radius * 0.55, 0.6))

      // Approach from a consistent forward/up offset to avoid sliding underneath
      const approachDir = new THREE.Vector3(0, 0.2, 1).normalize() // slight upward bias
      const desiredPos = target.clone().add(approachDir.multiplyScalar(desiredDistance))

      camera.position.lerp(desiredPos, 0.08)
      camera.lookAt(target)
    }
  })

  const mindMesh = mind.getMesh()
  if (!mindMesh) return null
  return <primitive object={mindMesh} />
}

function MentalsLayer({
  mind,
  mentals,
  selectedMentalName,
  onSelectMental,
  focusTargetRef,
  planeModelPath,
  sendMode,
  onSendSelection,
  onHoverSelection,
  onSendMeshSelection,
}: {
  mind: Mind
  mentals: Mental[]
  selectedMentalName: string | null
  onSelectMental: (info: InspectSelection) => void
  focusTargetRef: React.MutableRefObject<THREE.Vector3 | null>
  planeModelPath: string
  sendMode: boolean
  onSendSelection?: (info: { sender?: string | null; receiver?: string | null; status?: string }) => void
  onHoverSelection?: (objects: THREE.Object3D[]) => void
  onSendMeshSelection?: (meshes: THREE.Object3D[]) => void
}) {
  const { gl, camera } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])
  const senderRef = useRef<Mental | null>(null)
  const hoveredMeshRef = useRef<THREE.Object3D | null>(null)

  useEffect(() => {
    mentals.forEach((mental) => mind.addMental(mental))
  }, [mentals, mind])

  // Load any attached models so they sit inside the bubbles
  useEffect(() => {
    const basisPath = 'https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/'
    const list = mind.getMentals()

    list.forEach((mental) => {
      mental.loadModel(gl, { basisPath }).catch((err) => {
        console.error('Failed to load mental model', err)
      })
    })

    return () => {
      list.forEach((mental) => mental.detachModel())
    }
  }, [gl, mind, mentals])

  useEffect(() => {
    const canvas = gl.domElement

    const handlePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(pointer, camera)

      const list = mind.getMentals()
      const targets: THREE.Object3D[] = []
      list.forEach((mental) => {
        const mesh = mental.getMesh()
        if (mesh) targets.push(mesh)
      })

      const hits = raycaster.intersectObjects(targets, true)
      if (!hits.length) return

      const hit = hits[0].object
      const found = list.find((mental) => {
        const mesh = mental.getMesh()
        if (!mesh) return false
        let node: THREE.Object3D | null = hit
        while (node) {
          if (node === mesh) return true
          node = node.parent
        }
        return false
      })

      if (found) {
        if (sendMode) {
          // In send mode: first click picks sender, second click sends to receiver.
          const currentSender = senderRef.current
          if (!currentSender) {
            senderRef.current = found
            const senderMesh = found.getMesh()
            // Highlight the sender when first selected
            if (senderMesh && onSendMeshSelection) {
              onSendMeshSelection([senderMesh])
            }
            onSendSelection?.({ sender: found.getName(), receiver: null, status: 'Choose receiver' })
            return
          }
          if (currentSender === found) {
            // Same as sender; ignore to avoid self-send spam.
            return
          }
          const senderName = currentSender.getName()
          const receiverName = found.getName()
          const receiverMesh = found.getMesh()
          
          // Unhighlight sender and highlight only the receiver
          if (receiverMesh && onSendMeshSelection) {
            onSendMeshSelection([receiverMesh])
          }
          
          onSendSelection?.({ sender: senderName, receiver: receiverName, status: 'Sending...' })
          const sendPromise = currentSender.sendDataTo(gl, found, {
            planeModelPath,
            durationMs: 1400,
            arcHeight: 0.14,
            scale: 0.1,
          })

          if (!sendPromise || typeof (sendPromise as Promise<void>).then !== 'function') {
            onSendSelection?.({ sender: senderName, receiver: receiverName, status: 'Failed (no send promise)' })
            senderRef.current = null
            return
          }

          ;(sendPromise as Promise<void>)
            .then(() => {
              onSendSelection?.({ sender: senderName, receiver: receiverName, status: 'Delivered' })
              // Keep receiver highlighted until another one is clicked
            })
            .catch((err) => {
              console.error('Failed to visualize send', err)
              onSendSelection?.({ sender: senderName, receiver: receiverName, status: 'Failed' })
              // Keep receiver highlighted even on error
            })
          // Reset sender so next click can pick a new sender
          senderRef.current = null
          return
        }

        // Stop motion while inspecting
        found.setFrozen(true)
        const worldPos = new THREE.Vector3()
        found.getMesh()?.getWorldPosition(worldPos)
        focusTargetRef.current = worldPos
        const screenPos = {
          x: event.clientX + window.scrollX,
          y: event.clientY + window.scrollY,
        }

        const idx = list.indexOf(found)
        onSelectMental({
          name: found.getName(),
          detail: found.getDetail(),
          type: found.getType?.() ?? 'mental',
          labelNumber: idx + 1,
          screenPosition: screenPos,
          modelPath: found.getModelPath?.(),
        })
      }
    }

    canvas.addEventListener('pointerdown', handlePointer)
    return () => {
      canvas.removeEventListener('pointerdown', handlePointer)
    }
  }, [camera, gl, mind, onSelectMental, pointer, raycaster, focusTargetRef, planeModelPath, sendMode, onSendSelection])

  useEffect(() => {
    if (!onHoverSelection) return
    // Disable hover highlighting when in send mode (send meshes will be highlighted instead)
    if (sendMode) return
    
    const canvas = gl.domElement

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(pointer, camera)

      const list = mind.getMentals()
      const targets: THREE.Object3D[] = []
      list.forEach((mental) => {
        const mesh = mental.getMesh()
        if (mesh) targets.push(mesh)
      })

      const hits = raycaster.intersectObjects(targets, true)
      if (!hits.length) {
        if (hoveredMeshRef.current) {
          hoveredMeshRef.current = null
          onHoverSelection([])
        }
        return
      }

      const hit = hits[0].object
      const foundMesh = targets.find((mesh) => {
        let node: THREE.Object3D | null = hit
        while (node) {
          if (node === mesh) return true
          node = node.parent
        }
        return false
      })

      if (foundMesh && foundMesh !== hoveredMeshRef.current) {
        hoveredMeshRef.current = foundMesh
        onHoverSelection([foundMesh])
      }
    }

    canvas.addEventListener('pointermove', handlePointerMove)
    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove)
      if (hoveredMeshRef.current) {
        hoveredMeshRef.current = null
      }
    }
  }, [camera, gl, mind, onHoverSelection, pointer, raycaster, sendMode])

  useEffect(() => {
    if (!selectedMentalName) {
      // Unfreeze all when selection is cleared
      mind.getMentals().forEach((m) => m.setFrozen(false))
      focusTargetRef.current = null
    }
  }, [selectedMentalName, focusTargetRef])

  // Clear send highlights when send mode is exited
  useEffect(() => {
    if (!sendMode && onSendMeshSelection) {
      onSendMeshSelection([])
      senderRef.current = null
    }
  }, [sendMode, onSendMeshSelection])

  return null
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color={0x808080} metalness={0.1} roughness={0.5} />
    </mesh>
  )
}

function MindZoneBoundaries({ mind }: { mind: Mind }) {
  const mindRadius = mind.getRadius()
  const mindPosition = mind.position
  const mindScale = mind.scale
  
  // Local space radius (before scaling)
  const localRadius = mindRadius / mindScale
  const neutralBoundaryY = -0.3 // Local space boundary for neutral zone
  
  // Calculate circle radius at the neutral boundary height
  const horizontalCircleRadius = Math.sqrt(Math.max(0, localRadius * localRadius - neutralBoundaryY * neutralBoundaryY))

  return (
    <group position={[mindPosition.x, mindPosition.y, mindPosition.z]}>
      {/* Vertical plane (YZ plane) separating good (left, X<0) and bad (right, X>0) zones */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[localRadius * 2.5, localRadius * 2.5]} />
        <meshBasicMaterial
          color={0x00ff00}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Vertical plane wireframe for better visibility */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[localRadius * 2.5, localRadius * 2.5]} />
        <meshBasicMaterial
          color={0x00ff00}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>
      
      {/* Horizontal plane (XZ plane) separating neutral (below, Y<neutralBoundaryY) from good/bad (above) zones */}
      <mesh position={[0, neutralBoundaryY * mindScale, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[localRadius * 2.5, localRadius * 2.5]} />
        <meshBasicMaterial
          color={0xff0000}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Horizontal plane wireframe for better visibility */}
      <mesh position={[0, neutralBoundaryY * mindScale, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[localRadius * 2.5, localRadius * 2.5]} />
        <meshBasicMaterial
          color={0xff0000}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>
      
      {/* Great circle on sphere surface for left/right boundary (vertical circle in YZ plane) */}
      <lineSegments rotation={[Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.CircleGeometry(localRadius, 64)]} />
        <lineBasicMaterial color={0x00ff00} linewidth={3} />
      </lineSegments>
      
      {/* Horizontal circle on sphere surface for neutral boundary */}
      {horizontalCircleRadius > 0 && (
        <lineSegments position={[0, neutralBoundaryY * mindScale, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <edgesGeometry args={[new THREE.CircleGeometry(horizontalCircleRadius, 64)]} />
          <lineBasicMaterial color={0xff0000} linewidth={3} />
        </lineSegments>
      )}
    </group>
  )
}

function PanelPositionSync({
  focusTargetRef,
  selectedMentalName,
  onUpdate,
}: {
  focusTargetRef: React.MutableRefObject<THREE.Vector3 | null>
  selectedMentalName: string | null
  onUpdate: ((pos: { x: number; y: number } | null) => void) | undefined
}) {
  const { camera, gl } = useThree()

  useFrame(() => {
    if (!onUpdate) return
    if (!selectedMentalName || !focusTargetRef.current) {
      onUpdate(null)
      return
    }

    const target = focusTargetRef.current.clone()
    const ndc = target.project(camera)
    const rect = gl.domElement.getBoundingClientRect()

    const x = rect.left + (ndc.x + 1) * 0.5 * rect.width + window.scrollX
    const y = rect.top + (1 - (ndc.y + 1) * 0.5) * rect.height + window.scrollY
    onUpdate({ x, y })
  })

  return null
}

function ThreeScene({
  mind,
  mentals,
  selectedMentalName,
  onSelectMental,
  onUpdatePanelPosition,
  sendMode,
  onSendSelection,
}: {
  mind: Mind
  mentals: Mental[]
  selectedMentalName: string | null
  onSelectMental: (info: InspectSelection) => void
  onUpdatePanelPosition?: (pos: { x: number; y: number } | null) => void
  sendMode: boolean
  onSendSelection?: (info: { sender?: string | null; receiver?: string | null; status?: string }) => void
}) {
  const focusTargetRef = useRef<THREE.Vector3 | null>(null)
  const [hoverSelection, setHoverSelection] = useState<THREE.Object3D[]>([])
  const [sendMeshSelection, setSendMeshSelection] = useState<THREE.Object3D[]>([])
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  // Use send mesh selection when in send mode, otherwise use hover selection
  const outlineSelection = sendMode && sendMeshSelection.length > 0 ? sendMeshSelection : hoverSelection

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }} shadows gl={{ antialias: true, toneMappingExposure: 0.6 }}>
      <Environment preset="dawn" background blur={1} backgroundIntensity={0.35} environmentIntensity={0.6} />
      <OrbitControls
        ref={controlsRef}
        enableDamping={!selectedMentalName}
        dampingFactor={selectedMentalName ? 0 : 0.05}
        enableZoom
        enablePan={!selectedMentalName}
        enableRotate={!selectedMentalName}
        minDistance={0.5}
        maxDistance={24}
        target={[mind.position.x, mind.position.y, mind.position.z]}
      />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={50} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
      <directionalLight position={[-5, 3, -5]} intensity={0.45} />
      <pointLight position={[0, 6, 0]} intensity={0.8} distance={15} decay={2} />
      <pointLight position={[0, 0, 5]} intensity={0.6} distance={15} decay={2} />
      <GroundPlane />
      <React.Suspense fallback={null}>
        <HumanBody mind={mind} controlsRef={controlsRef} />
      </React.Suspense>
      <MindSphere mind={mind} selectedMentalName={selectedMentalName} focusTargetRef={focusTargetRef} />
      <MentalsLayer
        mind={mind}
        mentals={mentals}
        selectedMentalName={selectedMentalName}
        onSelectMental={onSelectMental}
        focusTargetRef={focusTargetRef}
        planeModelPath={paperPlaneModel}
        sendMode={sendMode}
        onSendSelection={onSendSelection}
        onHoverSelection={setHoverSelection}
        onSendMeshSelection={setSendMeshSelection}
      />
      <PanelPositionSync focusTargetRef={focusTargetRef} selectedMentalName={selectedMentalName} onUpdate={onUpdatePanelPosition} />
      <EffectComposer multisampling={2} autoClear={false}>
        <Outline
          selection={outlineSelection}
          blendFunction={BlendFunction.ALPHA}
          visibleEdgeColor={0xffffff}
          hiddenEdgeColor={0x190a05}
          edgeStrength={30}
          resolutionScale={1}
          xRay
        />
      </EffectComposer>
    </Canvas>
  )
}

function OptionMenu({
  selection,
  panelPosition,
  onClose,
  onVoice,
  voiceLoading,
  onViewDetail,
}: {
  selection: InspectSelection
  panelPosition: { x: number; y: number } | null
  onClose: () => void
  onVoice: (selection: InspectSelection) => void
  voiceLoading: boolean
  onViewDetail: (selection: InspectSelection) => void
}) {
  const menuStyle: React.CSSProperties = {
    position: 'absolute',
    left: panelPosition?.x ?? 24,
    top: (panelPosition?.y ?? 24) - 12,
    transform: 'translate(-50%, -100%)',
    minWidth: 240,
    background: 'linear-gradient(145deg, rgba(30,41,82,0.9), rgba(17,94,163,0.72))',
    border: '1px solid rgba(125, 211, 252, 0.35)',
    boxShadow: '0 12px 40px rgba(0,0,0,0.35), 0 0 18px rgba(59,130,246,0.4)',
    borderRadius: 14,
    padding: 16,
    color: '#e5e7eb',
    backdropFilter: 'blur(12px)',
    zIndex: 20,
  }

  const optionStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 13px',
    borderRadius: 12,
    background: 'linear-gradient(120deg, rgba(59,130,246,0.18), rgba(16,185,129,0.16))',
    border: '1px solid rgba(255,255,255,0.08)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  }

  const renderOption = (label: string, description: string, onClick: () => void, disabled?: boolean) => (
    <button
      key={label}
      type="button"
      style={{
        ...optionStyle,
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={() => {
        if (disabled) return
        onClick()
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(120deg, rgba(96,165,250,0.28), rgba(16,185,129,0.24))'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(120deg, rgba(59,130,246,0.18), rgba(16,185,129,0.16))'
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: 'linear-gradient(135deg, rgba(59,130,246,0.55), rgba(16,185,129,0.55))',
          border: '1px solid rgba(96,165,250,0.45)',
          boxShadow: '0 0 12px rgba(34,211,238,0.35)',
        }}
      />
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#f8fafc', letterSpacing: 0.2 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#dbeafe', marginTop: 2, opacity: 0.9 }}>{description}</div>
        {disabled && label === 'Voice' ? (
          <div style={{ fontSize: 11, color: '#bfdbfe', marginTop: 2 }}>Generating audio…</div>
        ) : null}
      </div>
    </button>
  )

  return (
    <div style={menuStyle}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 14, boxShadow: '0 0 0 1px rgba(125,211,252,0.25), inset 0 1px 0 rgba(255,255,255,0.04)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1.4, color: '#bfdbfe', textTransform: 'uppercase' }}>Mental Sphere</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: '#f8fafc', textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>{selection.name}</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'rgba(15,23,42,0.5)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#e5e7eb',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {renderOption('View Detail', 'Inspect this sphere closely', () => onViewDetail(selection))}
        {renderOption('Voice', 'Hear a narrated explanation', () => onVoice(selection), voiceLoading)}
        {renderOption('How it works?', 'Learn the mechanics in-game', () => {})}
      </div>
    </div>
  )
}

export function MindStudyCognitive(): React.ReactElement {
  const [selected, setSelected] = useState<InspectSelection | null>(null)
  const [panelPosition, setPanelPosition] = useState<{ x: number; y: number } | null>(null)
  const [inspectOpen, setInspectOpen] = useState(false)
  const [voiceLoading, setVoiceLoading] = useState(false)
  const [profile, setProfile] = useState<InspectSelection | null>(null)
  const [profileAttrs, setProfileAttrs] = useState<Array<{ key: string; value: string }>>([])
  const [profileMarkers, setProfileMarkers] = useState<Array<{ key: string; value: string; position: { x: number; y: number; z: number } }>>([])
  const [attrKey, setAttrKey] = useState('')
  const [attrValue, setAttrValue] = useState('')
  const [sendMode, setSendMode] = useState(false)
  const [sendInfo, setSendInfo] = useState<{ sender?: string | null; receiver?: string | null; status?: string }>({
    status: 'Idle',
  })

  const mind = useMemo(() => {
    return new Mind({
      name: 'Mind',
      detail: 'Static demo mind',
      position: [0, -0.4, 0],
      scale: 1.6,
      transparent: true,
      opacity: 0.3,
      color: parseInt('3b82f6', 16),
      labelEnabled: true,
      labelWorldSize: 0.45,
      labelOffset: 0.05,
    })
  }, [])

  const mentals = useMemo<Mental[]>(() => {
    const seeds: MentalSeed[] = [

      { name: 'Contact', color: '#a1a1aa', scale: 0.14, position: [0.0, -0.45, 0.1], detail: 'Paper plane thought', modelPath: paperPlaneModel, modelTargetWorldSize: 0.08, modelOffset: { x: 0, y: -0.04, z: 0 }, variant: 'contact' },
      { name: 'Attention', color: '#a1a1aa', scale: 0.14, position: [-0.1, -0.5, -0.15], variant: 'attention' },
      { name: 'Feeling', color: '#a1a1aa', scale: 0.14, position: [0.15, -0.4, 0.0], variant: 'feeling' },
      { name: 'Intention', color: '#a1a1aa', scale: 0.14, position: [0.05, -0.52, 0.05], variant: 'intention' },
      { name: 'Concentration', color: '#a1a1aa', scale: 0.14, position: [-0.18, -0.42, 0.02], variant: 'concentration' },
      { name: 'Life Faculty', color: '#a1a1aa', scale: 0.14, position: [0.18, -0.48, -0.08], variant: 'life_faculty' },
      {
        name: 'Perception',
        color: '#60a5fa',
        scale: 0.2,
        position: [-0.14, 0.16, 0.24],
        detail: 'Perception mental with bowl model',
        modelPath: perceptionBowlModel,
        modelTargetWorldSize: 0.02,
        modelOffset: { x: 0, y: -0.3, z: 0.5 },
        variant: 'perception',
      },
    ]

    return seeds.map((m) => {
      if (m.variant === 'perception') {
        return new PerceptionMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          modelPath: m.modelPath,
          modelTargetWorldSize: m.modelTargetWorldSize,
          modelOffset: m.modelOffset,
          motionSpeed: 0.0015,
          opacity: 0.5,
        })
      }
      if (m.variant === 'contact') {
        return new ContactMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          modelPath: m.modelPath,
          modelTargetWorldSize: m.modelTargetWorldSize,
          modelOffset: m.modelOffset,
          motionSpeed: 0.0015,
          opacity: 0.5,
        })
      }
      if (m.variant === 'feeling') {
        return new FeelingMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0.0015,
          opacity: 0.5,
        })
      }
      if (m.variant === 'intention') {
        return new IntentionMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0.0015,
          opacity: 0.5,
        })
      }
      if (m.variant === 'attention') {
        return new AttentionMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0.0015,
          opacity: 0.5,
        })
      }
      if (m.variant === 'concentration') {
        return new ConcentrationMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0.0015,
          opacity: 0.5,
        })
      }
      if (m.variant === 'life_faculty') {
        return new LifeFacultyMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0.0015,
          opacity: 0.5,
        })
      }
      if (m.variant === 'good') {
        const mental = new GoodMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0.002,
        })
        return mental
      }
      if (m.variant === 'greed') {
        return new GreedMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'hatred') {
        return new HatredMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'delusion') {
        return new DelusionMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'wrong_view') {
        return new WrongViewMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'conceit') {
        return new ConceitMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'doubt') {
        return new DoubtMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'restlessness') {
        return new RestlessnessMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'shamelessness') {
        return new ShamelessnessMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'recklessness') {
        return new RecklessnessMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'sloth') {
        return new SlothMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'torpor') {
        return new TorporMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'worry') {
        return new WorryMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'envy') {
        return new EnvyMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'stinginess') {
        return new StinginessMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
      }
      if (m.variant === 'bad') {
        const mental = new BadMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0,
          modelPath: m.modelPath ?? angerEmojiModel,
          modelTargetWorldSize: m.modelTargetWorldSize ?? 0.08,
          modelOffset: m.modelOffset ?? { x: 0, y: -0.02, z: 0 },
        })
        mental.setFrozen(true)
        return mental
      }
      if (m.variant === 'neutral') {
        const mental = new NeutralMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0.0015,
          modelPath: m.modelPath,
          modelTargetWorldSize: m.modelTargetWorldSize,
          modelOffset: m.modelOffset,
        })
        return mental
      }
      return new Mental({
        name: m.name,
        detail: m.detail ?? '',
        color: m.color,
        scale: m.scale,
        position: m.position,
        labelEnabled: false,
        modelPath: m.modelPath,
        modelTargetWorldSize: m.modelTargetWorldSize,
        modelOffset: m.modelOffset,
      })
    })
  }, [])

  useEffect(() => {
    if (!selected) setInspectOpen(false)
  }, [selected])

  const handleSelect = (info: InspectSelection) => {
    setSelected(info)
    setPanelPosition(info.screenPosition ?? null)
  }

  const handleClose = () => {
    setSelected(null)
    setPanelPosition(null)
    setInspectOpen(false)
  }

  const handleViewDetail = (info: InspectSelection) => {
    setSelected(info)
    setInspectOpen(true)
  }

  const handleVoice = async (selection: InspectSelection) => {
    const apiKey = import.meta.env.VITE_GOOGLE_TTS_KEY
    if (!apiKey) {
      alert('Missing VITE_GOOGLE_TTS_KEY. Add it to your .env to enable voice.')
      return
    }
    const voiceDetail = detailTextForVoiceNarration(selection.detail)
    const text = voiceDetail ? `${selection.name}. ${voiceDetail}` : selection.name
    setVoiceLoading(true)
    try {
      const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: 'th-TH', name: 'th-TH-Standard-A' },
          audioConfig: { audioEncoding: 'MP3' },
        }),
      })
      if (!res.ok) throw new Error(`TTS request failed: ${res.status}`)
      const data = await res.json()
      if (!data.audioContent) throw new Error('No audioContent in TTS response')
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`)
      audio.play().catch((err) => console.error('Audio playback failed', err))
    } catch (err) {
      console.error('TTS error', err)
      alert('Voice playback failed. Check console for details.')
    } finally {
      setVoiceLoading(false)
    }
  }

  const handleShowProfile = (info: InspectSelection) => {
    setProfile(info)
    const mental = mentals.find((m) => m.getName() === info.name && m.getType?.() === 'perception_mental')
    if (mental && mental instanceof PerceptionMental) {
      setProfileAttrs(mental.getAttributes())
      setProfileMarkers(mental.getAttributeMarkers())
    } else {
      setProfileAttrs([])
      setProfileMarkers([])
    }
  }

  const handleCloseProfile = () => {
    setProfile(null)
    setProfileAttrs([])
    setProfileMarkers([])
    setAttrKey('')
    setAttrValue('')
  }

  const handleAddAttribute = () => {
    const key = attrKey.trim()
    if (!key) return
    const mental = mentals.find((m) => m.getName() === profile?.name && m.getType?.() === 'perception_mental')
    if (mental && mental instanceof PerceptionMental) {
      mental.addAttribute(key, attrValue)
      setProfileAttrs(mental.getAttributes())
      setProfileMarkers(mental.getAttributeMarkers())
      setAttrKey('')
      setAttrValue('')
    }
  }

  return (
    <main className="page simulation-page">
      <div className="simulation-full" style={{ position: 'relative' }}>
        <div
          className="send-toolbar"
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 10,
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.55)',
            borderRadius: 8,
            color: 'white',
            fontSize: 13,
            backdropFilter: 'blur(6px)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setSendMode((prev) => !prev)
              setSendInfo({ status: 'Idle', sender: null, receiver: null })
            }}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: sendMode ? '#22c55e' : '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {sendMode ? 'Exit Send Mode' : 'Send Paper Plane'}
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <span>Sender: {sendInfo.sender ?? '—'}</span>
            <span>Receiver: {sendInfo.receiver ?? '—'}</span>
            <span>Status: {sendInfo.status ?? 'Idle'}</span>
          </div>
        </div>
        {selected && !inspectOpen && (
          <OptionMenu
            selection={selected}
            panelPosition={panelPosition}
            onClose={handleClose}
            onVoice={handleVoice}
            voiceLoading={voiceLoading}
            onViewDetail={handleViewDetail}
          />
        )}
        {selected && inspectOpen && (
          <InspectPanel
            selection={selected}
            panelPosition={panelPosition}
            onClose={handleClose}
            onShowProfile={handleShowProfile}
          />
        )}
        {profile && (
          <ProfilePanel
            profile={profile}
            attrs={profileAttrs}
            markers={profileMarkers}
            attrKey={attrKey}
            attrValue={attrValue}
            onAttrKeyChange={setAttrKey}
            onAttrValueChange={setAttrValue}
            onAddAttribute={handleAddAttribute}
            onClose={handleCloseProfile}
          />
        )}
        <ThreeScene
          mind={mind}
          mentals={mentals}
          selectedMentalName={selected?.name ?? null}
          onSelectMental={handleSelect}
          onUpdatePanelPosition={setPanelPosition}
          sendMode={sendMode}
          onSendSelection={setSendInfo}
        />
      </div>
    </main>
  )
}