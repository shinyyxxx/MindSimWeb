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
import FaithMental from '../mindwebsite/classes/good/FaithMental'
import MindfulnessMental from '../mindwebsite/classes/good/MindfulnessMental'
import MoralShameMental from '../mindwebsite/classes/good/MoralShameMental'
import MoralDreadMental from '../mindwebsite/classes/good/MoralDreadMental'
import NonGreedMental from '../mindwebsite/classes/good/NonGreedMental'
import NonHatredMental from '../mindwebsite/classes/good/NonHatredMental'
import EquanimityMental from '../mindwebsite/classes/good/EquanimityMental'
import TranquilityBodyMental from '../mindwebsite/classes/good/TranquilityBodyMental'
import TranquilityMindMental from '../mindwebsite/classes/good/TranquilityMindMental'
import LightnessBodyMental from '../mindwebsite/classes/good/LightnessBodyMental'
import LightnessMindMental from '../mindwebsite/classes/good/LightnessMindMental'
import PliancyBodyMental from '../mindwebsite/classes/good/PliancyBodyMental'
import PliancyMindMental from '../mindwebsite/classes/good/PliancyMindMental'
import WieldinessBodyMental from '../mindwebsite/classes/good/WieldinessBodyMental'
import WieldinessMindMental from '../mindwebsite/classes/good/WieldinessMindMental'
import ProficiencyBodyMental from '../mindwebsite/classes/good/ProficiencyBodyMental'
import ProficiencyMindMental from '../mindwebsite/classes/good/ProficiencyMindMental'
import RectitudeBodyMental from '../mindwebsite/classes/good/RectitudeBodyMental'
import RectitudeMindMental from '../mindwebsite/classes/good/RectitudeMindMental'
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
import { InspectPanel } from '../components/InspectPanel'
import ProfilePanel from '../components/ProfilePanel'
import { EffectComposer, Outline } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import violinModel from '../assets/violin.glb?url'
import perceptionBowlModel from '../assets/bowl.glb?url'
import paperPlaneModel from '../assets/paper_plane.glb?url'
import angerEmojiModel from '../assets/emoji/anger_emoji.glb?url'
  
type Vec3 = [number, number, number]

const DEFAULT_MIND_POSITION: Vec3 = [0, -0.4, 0]
const DEFAULT_MIND_SCALE = 1.6

function XRStatusBridge({
  onRendererReady,
  onPresentingChange,
}: {
  onRendererReady?: (gl: THREE.WebGLRenderer) => void
  onPresentingChange?: (presenting: boolean) => void
}) {
  const { gl } = useThree()
  const lastPresentingRef = useRef<boolean | null>(null)

  useEffect(() => {
    gl.xr.enabled = true
    onRendererReady?.(gl)
  }, [gl, onRendererReady])

  useFrame(() => {
    const presenting = gl.xr.isPresenting
    if (lastPresentingRef.current !== presenting) {
      lastPresentingRef.current = presenting
      onPresentingChange?.(presenting)
    }
  })

  return null
}

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
    | 'faith'
    | 'mindfulness'
    | 'moral_shame'
    | 'moral_dread'
    | 'non_greed'
    | 'non_hatred'
    | 'equanimity'
    | 'tranquility_body'
    | 'tranquility_mind'
    | 'lightness_body'
    | 'lightness_mind'
    | 'pliancy_body'
    | 'pliancy_mind'
    | 'wieldiness_body'
    | 'wieldiness_mind'
    | 'proficiency_body'
    | 'proficiency_mind'
    | 'rectitude_body'
    | 'rectitude_mind'
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
  url = '/assets/humanMind/human.gltf',
  targetHeight = 1.7,
  groundY = 0,
  bodyOpacity = 0.12,
  mindWorldScale = 0.1,
  mindFollowsHumanOffset = true,
  mindYOffsetWorld = 0.02,
  mindZOffsetWorld = -0.03,
  humanZOffsetWorld = -1.2,
}: {
  mind: Mind
  controlsRef?: React.RefObject<OrbitControlsImpl | null>
  url?: string
  targetHeight?: number
  groundY?: number
  bodyOpacity?: number
  mindWorldScale?: number
  mindFollowsHumanOffset?: boolean
  mindYOffsetWorld?: number
  mindZOffsetWorld?: number
  humanZOffsetWorld?: number
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
    // Base Z used for the "true" chest anchor (desktop keeps the mind fixed).
    const posZBase = -center.z * s
    // Visual-only Z offset: moves the human mesh without dragging the mind along.
    // Positive Z moves the model toward the camera (forward).
    const posZ = posZBase + humanZOffsetWorld
    const posY = groundY - bbox.min.y * s

    // Chest anchor: higher in the torso so the mind sits more naturally in the chest.
    const chestLocal = new THREE.Vector3(center.x, bbox.min.y + size.y * 0.68, center.z + size.z * 0.06)
    const chestAnchorZ = mindFollowsHumanOffset ? posZ : posZBase
    const chestW = new THREE.Vector3(posX, posY, chestAnchorZ).add(chestLocal.multiplyScalar(s))

    return {
      scaleFactor: s,
      humanPosition: new THREE.Vector3(posX, posY, posZ),
      chestWorld: chestW,
    }
  }, [groundY, humanScene, humanZOffsetWorld, mindFollowsHumanOffset, targetHeight])

  useLayoutEffect(() => {
    // Fit the mind comfortably inside the torso, then place it in the chest.
    mind.setScale(mindWorldScale)
    mind.setPosition(chestWorld.x, chestWorld.y + mindYOffsetWorld, chestWorld.z + mindZOffsetWorld)

    // Keep orbit pivot aligned with the mind/chest without relying on a React re-render.
    const ctl = controlsRef?.current
    if (ctl) {
      ctl.target.set(chestWorld.x, chestWorld.y + mindYOffsetWorld, chestWorld.z + mindZOffsetWorld)
      ctl.update()
    }
  }, [chestWorld.x, chestWorld.y, chestWorld.z, mind, mindWorldScale, mindYOffsetWorld, mindZOffsetWorld])

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
  showHumanModel,
  xrMode,
  defaultMindPosition,
  defaultMindScale,
  onRendererReady,
  onVrPresentingChange,
}: {
  mind: Mind
  mentals: Mental[]
  selectedMentalName: string | null
  onSelectMental: (info: InspectSelection) => void
  onUpdatePanelPosition?: (pos: { x: number; y: number } | null) => void
  sendMode: boolean
  onSendSelection?: (info: { sender?: string | null; receiver?: string | null; status?: string }) => void
  showHumanModel: boolean
  xrMode: 'vr' | 'ar' | null
  defaultMindPosition: Vec3
  defaultMindScale: number
  onRendererReady?: (gl: THREE.WebGLRenderer) => void
  onVrPresentingChange?: (presenting: boolean) => void
}) {
  const focusTargetRef = useRef<THREE.Vector3 | null>(null)
  const [hoverSelection, setHoverSelection] = useState<THREE.Object3D[]>([])
  const [sendMeshSelection, setSendMeshSelection] = useState<THREE.Object3D[]>([])
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const [isVrPresenting, setIsVrPresenting] = useState(false)
  const isArMode = xrMode === 'ar'
  const showMentalsLayer = !isArMode || sendMode
  const showHumanInScene = showHumanModel && (!isArMode || !sendMode)

  // Use send mesh selection when in send mode, otherwise use hover selection
  const outlineSelection = sendMode && sendMeshSelection.length > 0 ? sendMeshSelection : hoverSelection

  // When hiding the human model, put the mind back to its default position/scale.
  useLayoutEffect(() => {
    if (showHumanModel) return
    mind.setScale(defaultMindScale)
    mind.setPosition(defaultMindPosition)

    const ctl = controlsRef.current
    if (ctl) {
      ctl.target.set(defaultMindPosition[0], defaultMindPosition[1], defaultMindPosition[2])
      ctl.update()
    }
  }, [defaultMindPosition, defaultMindScale, mind, showHumanModel])

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 75 }}
      shadows={!isArMode}
      gl={{ antialias: true, toneMappingExposure: 0.6, alpha: isArMode }}
      onCreated={({ gl }) => {
        if (isArMode) gl.setClearColor(0x000000, 0)
      }}
    >
      <XRStatusBridge
        onRendererReady={onRendererReady}
        onPresentingChange={(presenting) => {
          setIsVrPresenting(presenting)
          onVrPresentingChange?.(presenting)
        }}
      />
      {/* In AR, avoid overriding the camera passthrough with an HDR background */}
      {!isArMode && <Environment preset="dawn" background blur={1} backgroundIntensity={0.35} environmentIntensity={0.6} />}
      <OrbitControls
        ref={controlsRef}
        enabled={!isVrPresenting}
        enableDamping={!selectedMentalName}
        dampingFactor={selectedMentalName ? 0 : 0.05}
        enableZoom
        enablePan={!selectedMentalName && !isVrPresenting}
        enableRotate={!selectedMentalName && !isVrPresenting}
        minDistance={0.35}
        maxDistance={24}
        target={[mind.position.x, mind.position.y, mind.position.z]}
      />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 5]} intensity={0.9} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={50} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
      <directionalLight position={[-5, 3, -5]} intensity={0.45} />
      <pointLight position={[0, 6, 0]} intensity={0.8} distance={15} decay={2} />
      <pointLight position={[0, 0, 5]} intensity={0.6} distance={15} decay={2} />
      {!isArMode && <GroundPlane />}
      {showHumanInScene && (
        <React.Suspense fallback={null}>
          <HumanBody
            mind={mind}
            controlsRef={controlsRef}
          />
        </React.Suspense>
      )}
      <MindSphere mind={mind} selectedMentalName={selectedMentalName} focusTargetRef={focusTargetRef} />
      {showMentalsLayer && (
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
      )}
      <PanelPositionSync focusTargetRef={focusTargetRef} selectedMentalName={selectedMentalName} onUpdate={onUpdatePanelPosition} />
      {showMentalsLayer && (
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
      )}
    </Canvas>
  )
}

export function Simulation(): React.ReactElement {
  const [selected, setSelected] = useState<InspectSelection | null>(null)
  const [panelPosition, setPanelPosition] = useState<{ x: number; y: number } | null>(null)
  const [profile, setProfile] = useState<InspectSelection | null>(null)
  const [profileAttrs, setProfileAttrs] = useState<Array<{ key: string; value: string }>>([])
  const [profileMarkers, setProfileMarkers] = useState<Array<{ key: string; value: string; position: { x: number; y: number; z: number } }>>([])
  const [attrKey, setAttrKey] = useState('')
  const [attrValue, setAttrValue] = useState('')
  const [sendMode, setSendMode] = useState(false)
  const [showHumanModel, setShowHumanModel] = useState(true)

  type XrSupport = 'checking' | 'supported' | 'unsupported' | 'not_secure' | 'no_webxr'
  const [activeXrMode, setActiveXrMode] = useState<'vr' | 'ar' | null>(null)

  const [vrPresenting, setVrPresenting] = useState(false)
  const [vrSupport, setVrSupport] = useState<XrSupport>('checking')
  const [vrMessage, setVrMessage] = useState<string | null>(null)
  const [vrDomOverlay, setVrDomOverlay] = useState(false)

  const [arPresenting, setArPresenting] = useState(false)
  const [arSupport, setArSupport] = useState<XrSupport>('checking')
  const [arMessage, setArMessage] = useState<string | null>(null)
  const [arDomOverlay, setArDomOverlay] = useState(false)

  const overlayRootRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const requestedXrModeRef = useRef<'vr' | 'ar' | null>(null)
  const [sendInfo, setSendInfo] = useState<{ sender?: string | null; receiver?: string | null; status?: string }>({
    status: 'Idle',
  })

  useEffect(() => {
    if (activeXrMode !== 'ar') return
    setShowHumanModel(true)
    setSendMode(false)
    setSelected(null)
    setProfile(null)
  }, [activeXrMode])

  const mind = useMemo(() => {
    return new Mind({
      name: 'Mind',
      detail: 'Static demo mind',
      position: DEFAULT_MIND_POSITION,
      scale: DEFAULT_MIND_SCALE,
      transparent: true,
      opacity: 0.15,
      color: parseInt('3b82f6', 16),
      labelEnabled: false,
      labelWorldSize: 0.6,
      labelOffset: 0.25,
    })
  }, [])

  useEffect(() => {
    mind.setLabelEnabled(!showHumanModel)
  }, [mind, showHumanModel])

  const mentals = useMemo<Mental[]>(() => {
    const seeds: MentalSeed[] = [
      // Good mentals (left zone, X < 0, Y > -0.3)
      // (Randomly picked once from the added "common beautiful" set — fixed mapping at runtime)
      { name: 'Faith (Saddhā)', color: '#22c55e', scale: 0.12, position: [-0.5, 0.1, 0.1], variant: 'faith' },
      { name: 'Mindfulness (Sati)', color: '#22c55e', scale: 0.12, position: [-0.6, -0.1, -0.1], variant: 'mindfulness' },
      { name: 'Moral Shame (Hiri)', color: '#22c55e', scale: 0.12, position: [-0.4, 0.0, 0.2], variant: 'moral_shame' },
      { name: 'Moral Dread (Ottappa)', color: '#22c55e', scale: 0.12, position: [-0.5, -0.15, -0.2], variant: 'moral_dread' },

      { name: 'Non-greed (Alobha)', color: '#22c55e', scale: 0.12, position: [-0.68, 0.18, 0.18], variant: 'non_greed' },
      { name: 'Non-hatred (Adosa)', color: '#22c55e', scale: 0.12, position: [-0.42, 0.16, -0.06], variant: 'non_hatred' },
      { name: 'Equanimity (Tatramajjhattatā)', color: '#22c55e', scale: 0.12, position: [-0.56, 0.14, -0.22], variant: 'equanimity' },
      { name: 'Tranquility (Mental Body)', color: '#22c55e', scale: 0.12, position: [-0.74, 0.12, 0.02], variant: 'tranquility_body' },
      { name: 'Tranquility (Mind)', color: '#22c55e', scale: 0.12, position: [-0.36, 0.10, 0.06], variant: 'tranquility_mind' },
      { name: 'Lightness (Mental Body)', color: '#22c55e', scale: 0.12, position: [-0.62, 0.06, 0.26], variant: 'lightness_body' },
      { name: 'Lightness (Mind)', color: '#22c55e', scale: 0.12, position: [-0.48, 0.04, -0.30], variant: 'lightness_mind' },
      { name: 'Pliancy (Mental Body)', color: '#22c55e', scale: 0.12, position: [-0.70, 0.02, -0.14], variant: 'pliancy_body' },
      { name: 'Pliancy (Mind)', color: '#22c55e', scale: 0.12, position: [-0.40, -0.02, 0.22], variant: 'pliancy_mind' },
      { name: 'Wieldiness (Mental Body)', color: '#22c55e', scale: 0.12, position: [-0.58, -0.06, 0.00], variant: 'wieldiness_body' },
      { name: 'Proficiency (Mind)', color: '#22c55e', scale: 0.12, position: [-0.72, -0.12, 0.12], variant: 'proficiency_mind' },
      { name: 'Rectitude (Mind)', color: '#22c55e', scale: 0.12, position: [-0.46, -0.18, -0.10], variant: 'rectitude_mind' },


      // Bad mentals (right zone, X > 0, Y > -0.3) — using anger emoji model for all, for now
      { name: 'Greed', color: '#ef4444', scale: 0.12, position: [0.48, 0.12, -0.10], variant: 'greed' },
      { name: 'Hatred', color: '#ef4444', scale: 0.12, position: [0.60, 0.10, 0.05], variant: 'hatred' },
      { name: 'Delusion', color: '#ef4444', scale: 0.12, position: [0.42, 0.06, -0.22], variant: 'delusion' },
      { name: 'Wrong View', color: '#ef4444', scale: 0.12, position: [0.54, 0.04, 0.22], variant: 'wrong_view' },
      { name: 'Conceit', color: '#ef4444', scale: 0.12, position: [0.66, 0.02, -0.06], variant: 'conceit' },
      { name: 'Doubt', color: '#ef4444', scale: 0.12, position: [0.46, -0.02, 0.12], variant: 'doubt' },
      { name: 'Restlessness', color: '#ef4444', scale: 0.12, position: [0.58, -0.04, -0.18], variant: 'restlessness' },
      { name: 'Shamelessness', color: '#ef4444', scale: 0.12, position: [0.40, -0.06, 0.02], variant: 'shamelessness' },
      { name: 'Recklessness', color: '#ef4444', scale: 0.12, position: [0.52, -0.08, -0.02], variant: 'recklessness' },
      { name: 'Sloth', color: '#ef4444', scale: 0.12, position: [0.64, -0.10, 0.14], variant: 'sloth' },
      { name: 'Torpor', color: '#ef4444', scale: 0.12, position: [0.44, -0.12, -0.12], variant: 'torpor' },
      { name: 'Worry', color: '#ef4444', scale: 0.12, position: [0.56, -0.14, 0.00], variant: 'worry' },
      { name: 'Envy', color: '#ef4444', scale: 0.12, position: [0.68, -0.16, -0.16], variant: 'envy' },
      { name: 'Stinginess', color: '#ef4444', scale: 0.12, position: [0.50, -0.18, 0.18], variant: 'stinginess' },

      // Neutral mentals (bottom zone, Y < -0.3)
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
      if (m.variant === 'faith') {
        return new FaithMental({
          name: m.name,
          detail: m.detail ?? '',
          color: m.color,
          scale: m.scale,
          position: m.position,
          labelEnabled: false,
          motionSpeed: 0.002,
        })
      }
      if (m.variant === 'mindfulness') {
        return new MindfulnessMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'moral_shame') {
        return new MoralShameMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'moral_dread') {
        return new MoralDreadMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'non_greed') {
        return new NonGreedMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'non_hatred') {
        return new NonHatredMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'equanimity') {
        return new EquanimityMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'tranquility_body') {
        return new TranquilityBodyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'tranquility_mind') {
        return new TranquilityMindMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'lightness_body') {
        return new LightnessBodyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'lightness_mind') {
        return new LightnessMindMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'pliancy_body') {
        return new PliancyBodyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'pliancy_mind') {
        return new PliancyMindMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'wieldiness_body') {
        return new WieldinessBodyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'wieldiness_mind') {
        return new WieldinessMindMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'proficiency_body') {
        return new ProficiencyBodyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'proficiency_mind') {
        return new ProficiencyMindMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'rectitude_body') {
        return new RectitudeBodyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
      }
      if (m.variant === 'rectitude_mind') {
        return new RectitudeMindMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
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
    let cancelled = false
    ;(async () => {
      // WebXR requires a secure context (https or localhost).
      if (!window.isSecureContext) {
        if (!cancelled) setVrSupport('not_secure')
        return
      }

      const xr = (navigator as unknown as { xr?: { isSessionSupported?: (mode: string) => Promise<boolean> } }).xr
      if (!xr) {
        if (!cancelled) setVrSupport('no_webxr')
        return
      }

      if (typeof xr.isSessionSupported === 'function') {
        try {
          const ok = await xr.isSessionSupported('immersive-vr')
          if (!cancelled) setVrSupport(ok ? 'supported' : 'unsupported')
        } catch {
          if (!cancelled) setVrSupport('unsupported')
        }
      } else {
        // Some browsers may not expose isSessionSupported; allow the user to try.
        if (!cancelled) setVrSupport('supported')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!window.isSecureContext) {
        if (!cancelled) setArSupport('not_secure')
        return
      }

      const xr = (navigator as unknown as { xr?: { isSessionSupported?: (mode: string) => Promise<boolean> } }).xr
      if (!xr) {
        if (!cancelled) setArSupport('no_webxr')
        return
      }

      if (typeof xr.isSessionSupported === 'function') {
        try {
          const ok = await xr.isSessionSupported('immersive-ar')
          if (!cancelled) setArSupport(ok ? 'supported' : 'unsupported')
        } catch {
          if (!cancelled) setArSupport('unsupported')
        }
      } else {
        if (!cancelled) setArSupport('supported')
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSelect = (info: InspectSelection) => {
    setSelected(info)
    setPanelPosition(info.screenPosition ?? null)
  }

  const handleClose = () => {
    setSelected(null)
    setPanelPosition(null)
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

  const vrButtonDisabled = (() => {
    if (activeXrMode === 'vr') return false
    if (!rendererRef.current) return true
    return vrSupport !== 'supported'
  })()

  const vrButtonTitle = (() => {
    if (!rendererRef.current) return '3D renderer is still loading...'
    if (activeXrMode === 'vr') return 'Exit VR session'
    if (vrSupport === 'checking') return 'Checking VR support...'
    if (vrSupport === 'not_secure') return 'WebXR requires HTTPS or localhost'
    if (vrSupport === 'no_webxr') return 'WebXR not available in this browser/device'
    if (vrSupport === 'unsupported') return 'immersive-vr is not supported (no headset / not enabled)'
    return 'Enter VR'
  })()

  const handleToggleVr = async () => {
    const gl = rendererRef.current
    if (!gl) {
      setVrMessage('VR not ready yet (renderer still loading)')
      return
    }

    if (!window.isSecureContext) {
      setVrMessage('VR requires HTTPS or localhost')
      return
    }

    const xr = (navigator as unknown as { xr?: { requestSession: Function; isSessionSupported?: (mode: string) => Promise<boolean> } }).xr
    if (!xr) {
      setVrMessage('WebXR not supported in this browser/device')
      return
    }

    requestedXrModeRef.current = 'vr'

    // Toggle / switch: if something is presenting, end it first.
    if (gl.xr.isPresenting) {
      const sameMode = activeXrMode === 'vr'
      await gl.xr.getSession()?.end()
      if (sameMode) {
        requestedXrModeRef.current = null
        return
      }
    }

    try {
      if (typeof xr.isSessionSupported === 'function') {
        const ok = await xr.isSessionSupported('immersive-vr')
        if (!ok) {
          setVrMessage('immersive-vr not supported (connect a headset / enable WebXR)')
          setVrSupport('unsupported')
          return
        }
      }

      const baseInit: any = {
        optionalFeatures: ['local-floor', 'bounded-floor'],
      }

      // Try to enable DOM Overlay so the HTML toolbar stays visible in VR.
      // If not supported, we fall back to regular VR (UI will disappear).
      let session: any
      try {
        session = await (xr.requestSession as any)('immersive-vr', {
          ...baseInit,
          optionalFeatures: [...baseInit.optionalFeatures, 'dom-overlay'],
          domOverlay: { root: overlayRootRef.current ?? document.body },
        })
        setVrDomOverlay(true)
      } catch (overlayErr) {
        console.warn('DOM Overlay not available, falling back', overlayErr)
        session = await (xr.requestSession as any)('immersive-vr', baseInit)
        setVrDomOverlay(false)
        setVrMessage('Entered VR without DOM overlay (toolbar will be hidden). Press Esc to exit.')
      }

      session.addEventListener(
        'end',
        () => {
          setVrPresenting(false)
          setVrDomOverlay(false)
          if (activeXrMode === 'vr') setActiveXrMode(null)
          requestedXrModeRef.current = null
        },
        { once: true }
      )
      gl.xr.setReferenceSpaceType('local-floor')
      await gl.xr.setSession(session)
      setVrPresenting(true)
      setArPresenting(false)
      setActiveXrMode('vr')
      requestedXrModeRef.current = 'vr'
      // If we have DOM overlay, clear messages; otherwise keep the hint.
      if (session?.domOverlayState?.type) {
        // If browser reports an overlay type, assume overlay is active.
        setVrDomOverlay(true)
        setVrMessage(null)
      }
    } catch (err) {
      console.error('Failed to enter VR', err)
      setVrMessage('Failed to enter VR (see console)')
      setVrPresenting(false)
      requestedXrModeRef.current = null
    }
  }

  const arButtonDisabled = (() => {
    if (activeXrMode === 'ar') return false
    if (!rendererRef.current) return true
    return arSupport !== 'supported'
  })()

  const arButtonTitle = (() => {
    if (!rendererRef.current) return '3D renderer is still loading...'
    if (activeXrMode === 'ar') return 'Exit AR session'
    if (arSupport === 'checking') return 'Checking AR support...'
    if (arSupport === 'not_secure') return 'WebXR requires HTTPS or localhost'
    if (arSupport === 'no_webxr') return 'WebXR not available in this browser/device'
    if (arSupport === 'unsupported') return 'immersive-ar is not supported on this device/browser'
    return 'Enter AR'
  })()

  const handleToggleAr = async () => {
    const gl = rendererRef.current
    if (!gl) {
      setArMessage('AR not ready yet (renderer still loading)')
      return
    }

    if (!window.isSecureContext) {
      setArMessage('AR requires HTTPS or localhost')
      return
    }

    const xr = (navigator as unknown as { xr?: { requestSession: Function; isSessionSupported?: (mode: string) => Promise<boolean> } }).xr
    if (!xr) {
      setArMessage('WebXR not supported in this browser/device')
      return
    }

    requestedXrModeRef.current = 'ar'

    // Toggle / switch: if something is presenting, end it first.
    if (gl.xr.isPresenting) {
      const sameMode = activeXrMode === 'ar'
      await gl.xr.getSession()?.end()
      if (sameMode) {
        requestedXrModeRef.current = null
        return
      }
    }

    try {
      if (typeof xr.isSessionSupported === 'function') {
        const ok = await xr.isSessionSupported('immersive-ar')
        if (!ok) {
          setArMessage('immersive-ar not supported (use a phone/tablet with AR support)')
          setArSupport('unsupported')
          return
        }
      }

      const baseInit: any = {
        // Prefer floor-aligned reference space so models aren't "floating".
        // Fall back handled below if not supported.
        optionalFeatures: ['local-floor'],
      }

      let session: any
      try {
        session = await (xr.requestSession as any)('immersive-ar', {
          ...baseInit,
          optionalFeatures: [...baseInit.optionalFeatures, 'dom-overlay'],
          domOverlay: { root: overlayRootRef.current ?? document.body },
        })
        setArDomOverlay(true)
      } catch (overlayErr) {
        console.warn('DOM Overlay not available, falling back', overlayErr)
        session = await (xr.requestSession as any)('immersive-ar', baseInit)
        setArDomOverlay(false)
        setArMessage('Entered AR without DOM overlay. Tap to exit if UI is hidden.')
      }

      session.addEventListener(
        'end',
        () => {
          setArPresenting(false)
          setArDomOverlay(false)
          if (activeXrMode === 'ar') setActiveXrMode(null)
          requestedXrModeRef.current = null
        },
        { once: true }
      )

      try {
        gl.xr.setReferenceSpaceType('local-floor')
      } catch {
        gl.xr.setReferenceSpaceType('local')
      }
      await gl.xr.setSession(session)
      setArPresenting(true)
      setVrPresenting(false)
      setActiveXrMode('ar')
      requestedXrModeRef.current = 'ar'

      if (session?.domOverlayState?.type) {
        setArDomOverlay(true)
        setArMessage(null)
      }
    } catch (err) {
      console.error('Failed to enter AR', err)
      setArMessage('Failed to enter AR (see console)')
      setArPresenting(false)
      requestedXrModeRef.current = null
    }
  }

  return (
    <main className="page simulation-page">
      <div ref={overlayRootRef} className="simulation-full" style={{ position: 'relative' }}>
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
              setSendMode((prev) => {
                const next = !prev
                if (activeXrMode === 'ar') setShowHumanModel(!next)
                return next
              })
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
          <button
            type="button"
            onClick={() => {
              setShowHumanModel((prev) => {
                const next = !prev
                if (activeXrMode === 'ar' && next) setSendMode(false)
                return next
              })
            }}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: showHumanModel ? '#8b5cf6' : '#64748b',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Switch Model
          </button>
          <button
            type="button"
            onClick={handleToggleVr}
            disabled={vrButtonDisabled}
            title={vrButtonTitle}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: vrButtonDisabled ? '#334155' : activeXrMode === 'vr' ? '#ef4444' : '#0ea5e9',
              color: 'white',
              cursor: vrButtonDisabled ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: vrButtonDisabled ? 0.8 : 1,
            }}
          >
            {activeXrMode === 'vr' ? 'Exit VR' : 'VR Mode'}
          </button>
          <button
            type="button"
            onClick={handleToggleAr}
            disabled={arButtonDisabled}
            title={arButtonTitle}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: arButtonDisabled ? '#334155' : activeXrMode === 'ar' ? '#ef4444' : '#f97316',
              color: 'white',
              cursor: arButtonDisabled ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: arButtonDisabled ? 0.8 : 1,
            }}
          >
            {activeXrMode === 'ar' ? 'Exit AR' : 'AR Mode'}
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <span>Sender: {sendInfo.sender ?? '—'}</span>
            <span>Receiver: {sendInfo.receiver ?? '—'}</span>
            <span>Status: {sendInfo.status ?? 'Idle'}</span>
            <span>
              VR:{' '}
              {activeXrMode === 'vr'
                ? vrDomOverlay
                  ? 'On (Overlay)'
                  : 'On'
                : vrSupport === 'supported'
                  ? 'Ready'
                  : vrSupport === 'checking'
                    ? 'Checking'
                    : 'Unavailable'}
            </span>
            <span>
              AR:{' '}
              {activeXrMode === 'ar'
                ? arDomOverlay
                  ? 'On (Overlay)'
                  : 'On'
                : arSupport === 'supported'
                  ? 'Ready'
                  : arSupport === 'checking'
                    ? 'Checking'
                    : 'Unavailable'}
            </span>
            {vrMessage && <span style={{ color: '#fbbf24' }}>{vrMessage}</span>}
            {arMessage && <span style={{ color: '#fbbf24' }}>{arMessage}</span>}
          </div>
        </div>
        {selected && (
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
          showHumanModel={showHumanModel}
          xrMode={activeXrMode}
          defaultMindPosition={DEFAULT_MIND_POSITION}
          defaultMindScale={DEFAULT_MIND_SCALE}
          onRendererReady={(gl) => {
            rendererRef.current = gl
          }}
          onVrPresentingChange={(presenting) => {
            if (presenting) {
              const session: any = rendererRef.current?.xr.getSession?.()
              const blendMode = session?.environmentBlendMode as string | undefined
              const inferredMode: 'vr' | 'ar' | null =
                requestedXrModeRef.current ??
                activeXrMode ??
                (blendMode === 'alpha-blend' ? 'ar' : blendMode ? 'vr' : null)

              if (inferredMode === 'ar') {
                setActiveXrMode('ar')
                setArPresenting(true)
                setVrPresenting(false)
                setArMessage(null)
              } else {
                setActiveXrMode('vr')
                setVrPresenting(true)
                setArPresenting(false)
                setVrMessage(null)
              }
            } else {
              setVrPresenting(false)
              setArPresenting(false)
              setVrDomOverlay(false)
              setArDomOverlay(false)
              setActiveXrMode(null)
              requestedXrModeRef.current = null
            }
          }}
        />
      </div>
    </main>
  )
}