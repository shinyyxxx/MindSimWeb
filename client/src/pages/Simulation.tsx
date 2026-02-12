import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import Mind from '../mindwebsite/classes/Mind'
import Mental from '../mindwebsite/classes/Mental'
import PerceptionMental from '../mindwebsite/classes/neutral/PerceptionMental'
import GoodMental from '../mindwebsite/classes/good/GoodMental'
import BadMental from '../mindwebsite/classes/bad/BadMental'
import NeutralMental from '../mindwebsite/classes/neutral/NeutralMental'
import type { InspectSelection } from '../types/InspectSelection'
import { InspectPanel } from '../components/InspectPanel'
import ProfilePanel from '../components/ProfilePanel'
import { EffectComposer, Outline } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import violinModel from '../assets/violin.glb?url'
import perceptionBowlModel from '../assets/bowl.glb?url'
import paperPlaneModel from '../assets/paper_plane.glb?url'
  
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
  variant?: 'good' | 'bad' | 'neutral' | 'perception'
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
}: {
  mind: Mind
  mentals: Mental[]
  selectedMentalName: string | null
  onSelectMental: (info: InspectSelection) => void
  focusTargetRef: React.MutableRefObject<THREE.Vector3 | null>
  planeModelPath: string
  sendMode: boolean
  onSendSelection?: (info: { sender?: string | null; receiver?: string | null; status?: string }) => void
}) {
  const { gl, camera } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])
  const senderRef = useRef<Mental | null>(null)

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
            onSendSelection?.({ sender: found.getName(), receiver: null, status: 'Choose receiver' })
            return
          }
          if (currentSender === found) {
            // Same as sender; ignore to avoid self-send spam.
            return
          }
          const senderName = currentSender.getName()
          const receiverName = found.getName()
          onSendSelection?.({ sender: senderName, receiver: receiverName, status: 'Sending...' })
          currentSender
            .sendDataTo(gl, found, {
              planeModelPath,
              durationMs: 1400,
              arcHeight: 0.14,
              scale: 0.1,
            })
            .then(() => {
              onSendSelection?.({ sender: senderName, receiver: receiverName, status: 'Delivered' })
            })
            .catch((err) => {
              console.error('Failed to visualize send', err)
              onSendSelection?.({ sender: senderName, receiver: receiverName, status: 'Failed' })
            })
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
    if (!selectedMentalName) {
      // Unfreeze all when selection is cleared
      mind.getMentals().forEach((m) => m.setFrozen(false))
      focusTargetRef.current = null
    }
  }, [selectedMentalName, focusTargetRef])

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
    <Canvas camera={{ position: [0, 0, 10], fov: 75 }} shadows gl={{ antialias: true, toneMappingExposure: 0.6 }}>
      <XRStatusBridge
        onRendererReady={onRendererReady}
        onPresentingChange={(presenting) => {
          setIsVrPresenting(presenting)
          onVrPresentingChange?.(presenting)
        }}
      />
      {/* Bring back HDRI background, but keep it dim */}
      <Environment preset="dawn" background blur={1} backgroundIntensity={0.35} environmentIntensity={0.6} />
      <OrbitControls
        ref={controlsRef}
        enabled={!isVrPresenting}
        enableDamping={!selectedMentalName}
        dampingFactor={selectedMentalName ? 0 : 0.05}
        enableZoom
        enablePan={!selectedMentalName && !isVrPresenting}
        enableRotate={!selectedMentalName && !isVrPresenting}
        minDistance={2}
        maxDistance={10}
        target={[0, 0, 0]}
      />
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 8, 5]} intensity={2.0} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={50} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
      <directionalLight position={[-5, 3, -5]} intensity={1.5} />
      <pointLight position={[0, 6, 0]} intensity={2.0} distance={15} decay={2} />
      <pointLight position={[0, 0, 5]} intensity={1.5} distance={15} decay={2} />
      <GroundPlane />
      {showHumanModel && (
        <React.Suspense fallback={null}>
          <HumanBody mind={mind} controlsRef={controlsRef} />
        </React.Suspense>
      )}
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
      />
      <PanelPositionSync focusTargetRef={focusTargetRef} selectedMentalName={selectedMentalName} onUpdate={onUpdatePanelPosition} />
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
  const [vrPresenting, setVrPresenting] = useState(false)
  const [vrSupport, setVrSupport] = useState<'checking' | 'supported' | 'unsupported' | 'not_secure' | 'no_webxr'>('checking')
  const [vrMessage, setVrMessage] = useState<string | null>(null)
  const [vrDomOverlay, setVrDomOverlay] = useState(false)
  const overlayRootRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const [sendInfo, setSendInfo] = useState<{ sender?: string | null; receiver?: string | null; status?: string }>({
    status: 'Idle',
  })

  const mind = useMemo(() => {
    return new Mind({
      name: 'Mind',
      detail: 'Static demo mind',
      position: DEFAULT_MIND_POSITION,
      scale: DEFAULT_MIND_SCALE,
      transparent: true,
      opacity: 0.15,
      color: parseInt('3b82f6', 16),
      labelEnabled: true,
      labelWorldSize: 0.6,
      labelOffset: 0.25,
    })
  }, [])

  const mentals = useMemo<Mental[]>(() => {
    const seeds: MentalSeed[] = [
      // Good mentals (clustered left/front)
      { name: 'Good 1', color: '#22c55e', scale: 0.12, position: [-0.6, 0.2, 0.2], variant: 'good' },
      { name: 'Good 2', color: '#22c55e', scale: 0.12, position: [-0.8, 0.05, 0.1], variant: 'good' },
      { name: 'Good 3', color: '#22c55e', scale: 0.12, position: [-0.7, -0.1, -0.05], variant: 'good' },
      { name: 'Good 4', color: '#22c55e', scale: 0.12, position: [-0.5, 0.0, -0.2], variant: 'good' },

      // Bad mentals (clustered right/back)
      { name: 'Bad 1', color: '#ef4444', scale: 0.12, position: [0.6, 0.2, -0.2], variant: 'bad' },
      { name: 'Bad 2', color: '#ef4444', scale: 0.12, position: [0.8, 0.05, -0.1], variant: 'bad' },
      { name: 'Bad 3', color: '#ef4444', scale: 0.12, position: [0.7, -0.05, 0.05], variant: 'bad' },
      { name: 'Bad 4', color: '#ef4444', scale: 0.12, position: [0.5, 0.1, 0.2], variant: 'bad' },

      // Neutral mentals (spaced center)
      {
        name: 'Neutral 1',
        color: '#a1a1aa',
        scale: 0.14,
        position: [0.0, 0.12, 0.35],
        detail: 'Paper plane thought',
        modelPath: paperPlaneModel,
        modelTargetWorldSize: 0.08,
        modelOffset: { x: 0, y: -0.04, z: 0 },
        variant: 'neutral',
      },
      { name: 'Neutral 2', color: '#a1a1aa', scale: 0.14, position: [0.0, -0.05, -0.35], variant: 'neutral' },

      // Perception (kept)
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
    if (vrPresenting) return false
    if (!rendererRef.current) return true
    return vrSupport !== 'supported'
  })()

  const vrButtonTitle = (() => {
    if (!rendererRef.current) return '3D renderer is still loading...'
    if (vrPresenting) return 'Exit VR session'
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

    // Exit VR if already presenting
    if (gl.xr.isPresenting) {
      await gl.xr.getSession()?.end()
      return
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
        },
        { once: true }
      )
      gl.xr.setReferenceSpaceType('local-floor')
      await gl.xr.setSession(session)
      setVrPresenting(true)
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
          <button
            type="button"
            onClick={() => setShowHumanModel((prev) => !prev)}
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
              background: vrButtonDisabled ? '#334155' : vrPresenting ? '#ef4444' : '#0ea5e9',
              color: 'white',
              cursor: vrButtonDisabled ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: vrButtonDisabled ? 0.8 : 1,
            }}
          >
            {vrPresenting ? 'Exit VR' : 'VR Mode'}
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <span>Sender: {sendInfo.sender ?? '—'}</span>
            <span>Receiver: {sendInfo.receiver ?? '—'}</span>
            <span>Status: {sendInfo.status ?? 'Idle'}</span>
            <span>
              VR:{' '}
              {vrPresenting
                ? vrDomOverlay
                  ? 'On (Overlay)'
                  : 'On'
                : vrSupport === 'supported'
                  ? 'Ready'
                  : vrSupport === 'checking'
                    ? 'Checking'
                    : 'Unavailable'}
            </span>
            {vrMessage && <span style={{ color: '#fbbf24' }}>{vrMessage}</span>}
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
          defaultMindPosition={DEFAULT_MIND_POSITION}
          defaultMindScale={DEFAULT_MIND_SCALE}
          onRendererReady={(gl) => {
            rendererRef.current = gl
          }}
          onVrPresentingChange={(presenting) => {
            setVrPresenting(presenting)
            if (presenting) {
              setVrMessage(null)
            } else {
              setVrDomOverlay(false)
            }
          }}
        />
      </div>
    </main>
  )
}