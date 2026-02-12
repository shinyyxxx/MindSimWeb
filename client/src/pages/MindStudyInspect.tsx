import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useNavigate, useParams } from 'react-router-dom'
import Mind from '../mindwebsite/classes/Mind'
import Mental from '../mindwebsite/classes/Mental'
import NeutralMental from '../mindwebsite/classes/neutral/NeutralMental'
import ContactMental from '../mindwebsite/classes/neutral/ContactMental'
import AttentionMental from '../mindwebsite/classes/neutral/AttentionMental'
import FeelingMental from '../mindwebsite/classes/neutral/FeelingMental'
import IntentionMental from '../mindwebsite/classes/neutral/IntentionMental'
import ConsciousnessMental from '../mindwebsite/classes/neutral/ConsciousnessMental'
import AwarenessMental from '../mindwebsite/classes/neutral/AwarenessMental'
import PerceptionMental from '../mindwebsite/classes/neutral/PerceptionMental'
import paperPlaneModel from '../assets/paper_plane.glb?url'
import perceptionBowlModel from '../assets/bowl.glb?url'
import type { InspectSelection } from '../types/InspectSelection'
import { EffectComposer, Outline } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

const apiKey = import.meta.env.VITE_GOOGLE_TTS_KEY

if (!apiKey) {
  throw new Error("Missing VITE_GOOGLE_TTS_KEY for Google TTS")
}


type MindStudyInspectParams = {
  mindId?: string
}

type NeutralSeed = {
  name: string
  color: string
  scale: number
  position: [number, number, number]
  variant:
    | 'neutral'
    | 'contact'
    | 'attention'
    | 'feeling'
    | 'intention'
    | 'consciousness'
    | 'awareness'
    | 'perception'
  detail?: string
  modelPath?: string
  modelTargetWorldSize?: number
  modelOffset?: { x?: number; y?: number; z?: number }
}

function NeutralMindContents({ mind, mentals }: { mind: Mind; mentals: Mental[] }) {
  const { gl } = useThree()

  useEffect(() => {
    mentals.forEach((mental) => mind.addMental(mental))
    return () => {
      mind.dispose()
    }
  }, [mind, mentals])

  useEffect(() => {
    const basisPath = 'https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/'
    mentals.forEach((mental) => {
      mental.loadModel(gl, { basisPath }).catch((err) => {
        console.error('Failed to load neutral mental model', err)
      })
    })
    return () => {
      mentals.forEach((mental) => mental.detachModel())
    }
  }, [gl, mentals])

  return null
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
      const desiredDistance = 2

      // Move directly toward the target and stop at a fixed distance to avoid spin.
      const dir = camera.position.clone().sub(target)
      if (dir.lengthSq() < 1e-6) {
        dir.set(0, 0.2, 1) // fallback if camera is exactly on target
      }
      dir.normalize()

      const desiredPos = target.clone().add(dir.multiplyScalar(desiredDistance))

      camera.position.lerp(desiredPos, 0.12)
      camera.lookAt(target)
    }
  })

  const mindMesh = mind.getMesh()
  if (!mindMesh) return null
  return <primitive object={mindMesh} />
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

function NeutralMentalsLayer({
  mind,
  mentals,
  selectedMentalName,
  onSelectMental,
  focusTargetRef,
  onHoverSelection,
}: {
  mind: Mind
  mentals: Mental[]
  selectedMentalName: string | null
  onSelectMental: (info: InspectSelection) => void
  focusTargetRef: React.MutableRefObject<THREE.Vector3 | null>
  onHoverSelection?: (objects: THREE.Object3D[]) => void
}) {
  const { gl, camera } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])
  const hoveredMeshRef = useRef<THREE.Object3D | null>(null)

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
  }, [camera, gl, mind, onSelectMental, pointer, raycaster, focusTargetRef])

  useEffect(() => {
    if (!onHoverSelection) return
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
  }, [camera, gl, mind, onHoverSelection, pointer, raycaster])

  useEffect(() => {
    if (!selectedMentalName) {
      mind.getMentals().forEach((m) => m.setFrozen(false))
      focusTargetRef.current = null
    }
  }, [selectedMentalName, focusTargetRef, mind])

  return null
}

function OptionMenu({
  selection,
  panelPosition,
  onClose,
  onVoice,
  voiceLoading,
}: {
  selection: InspectSelection
  panelPosition: { x: number; y: number } | null
  onClose: () => void
  onVoice: (selection: InspectSelection) => void
  voiceLoading: boolean
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
      {renderOption('View Detail', 'Inspect this sphere closely', () => {})}
      {renderOption('Voice', 'Hear a narrated explanation', () => onVoice(selection), voiceLoading)}
      {renderOption('How it works?', 'Learn the mechanics in-game', () => {})}
      </div>
    </div>
  )
}

function NeutralMindScene({
  mind,
  mentals,
  selectedMentalName,
  onSelectMental,
  onUpdatePanelPosition,
  highlightSelection,
}: {
  mind: Mind
  mentals: Mental[]
  selectedMentalName: string | null
  onSelectMental: (info: InspectSelection) => void
  onUpdatePanelPosition?: (pos: { x: number; y: number } | null) => void
  highlightSelection?: THREE.Object3D[]
}) {
  const focusTargetRef = useRef<THREE.Vector3 | null>(null)
  const [hoverSelection, setHoverSelection] = useState<THREE.Object3D[]>([])
  const combinedSelection = useMemo(
    () => [...hoverSelection, ...(highlightSelection ?? [])],
    [hoverSelection, highlightSelection],
  )

  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 60 }} shadows gl={{ antialias: true, toneMappingExposure: 0.7 }}>
      <Environment preset="dawn" background blur={1} backgroundIntensity={0.4} environmentIntensity={0.65} />
      <OrbitControls
        enableDamping={!selectedMentalName}
        dampingFactor={selectedMentalName ? 0 : 0.05}
        enableZoom
        enablePan={!selectedMentalName}
        enableRotate={!selectedMentalName}
        minDistance={2}
        maxDistance={18}
        target={[mind.position.x, mind.position.y, mind.position.z]}
      />
      <ambientLight intensity={0.3} />
      <directionalLight position={[6, 8, 6]} intensity={0.95} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <pointLight position={[0, 5, 0]} intensity={0.7} distance={12} decay={2} />
      <pointLight position={[0, 0, 5]} intensity={0.55} distance={12} decay={2} />
      <GroundPlane />
      <NeutralMindContents mind={mind} mentals={mentals} />
      <MindSphere mind={mind} selectedMentalName={selectedMentalName} focusTargetRef={focusTargetRef} />
      <NeutralMentalsLayer
        mind={mind}
        mentals={mentals}
        selectedMentalName={selectedMentalName}
        onSelectMental={onSelectMental}
        focusTargetRef={focusTargetRef}
        onHoverSelection={setHoverSelection}
      />
      <PanelPositionSync focusTargetRef={focusTargetRef} selectedMentalName={selectedMentalName} onUpdate={onUpdatePanelPosition} />
      <EffectComposer multisampling={2} autoClear={false}>
        <Outline
          selection={combinedSelection}
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

export function MindStudyInspect(): React.ReactElement {
  const { mindId = 'mind' } = useParams<MindStudyInspectParams>()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<InspectSelection | null>(null)
  const [panelPosition, setPanelPosition] = useState<{ x: number; y: number } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightSelection, setHighlightSelection] = useState<THREE.Object3D[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [voiceLoading, setVoiceLoading] = useState(false)

  const readableMindName = useMemo(() => {
    const names: Record<string, string> = {
      calm: 'Calm & Balanced',
      focused: 'Focused & Collected',
      curious: 'Curious & Investigative',
      compassionate: 'Warm & Compassionate',
    }
    if (names[mindId]) return names[mindId]
    const plain = mindId.replace(/[-_]/g, ' ')
    return plain.length ? plain.charAt(0).toUpperCase() + plain.slice(1) : 'Mind'
  }, [mindId])

  const mind = useMemo(
    () =>
      new Mind({
        name: readableMindName,
        detail: 'Neutral mentals playground',
        position: [0, -0.25, 0],
        scale: 1.6,
        transparent: true,
        opacity: 0.18,
        color: parseInt('3b82f6', 16),
        labelEnabled: true,
        labelWorldSize: 0.6,
        labelOffset: 0.28,
      }),
    [readableMindName],
  )

  const neutralMentals = useMemo<Mental[]>(() => {
    const seeds: NeutralSeed[] = [
      {
        name: 'Neutral Ground',
        color: '#9ca3af',
        scale: 0.14,
        position: [-0.08, -0.46, -0.12],
        variant: 'neutral',
        detail: 'Baseline neutral mental factor',
      },
      {
        name: 'Contact',
        color: '#a1a1aa',
        scale: 0.14,
        position: [0.0, -0.45, 0.1],
        variant: 'contact',
        detail: 'Meeting of sense base and object',
        modelPath: paperPlaneModel,
        modelTargetWorldSize: 0.08,
        modelOffset: { x: 0, y: -0.04, z: 0 },
      },
      {
        name: 'Attention',
        color: '#a1a1aa',
        scale: 0.14,
        position: [-0.18, -0.48, 0.06],
        variant: 'attention',
        detail: 'Directing the mind toward an object',
      },
      {
        name: 'Feeling',
        color: '#a1a1aa',
        scale: 0.14,
        position: [0.16, -0.44, -0.06],
        variant: 'feeling',
        detail: 'Tone of pleasant, unpleasant, or neutral',
      },
      {
        name: 'Intention',
        color: '#a1a1aa',
        scale: 0.14,
        position: [0.05, -0.52, 0.05],
        variant: 'intention',
        detail: 'The shaping force behind actions',
      },
      {
        name: 'Consciousness',
        color: '#a1a1aa',
        scale: 0.14,
        position: [-0.22, -0.42, -0.02],
        variant: 'consciousness',
        detail: 'Knowing of the object',
      },
      {
        name: 'Awareness',
        color: '#a1a1aa',
        scale: 0.14,
        position: [0.22, -0.50, 0.12],
        variant: 'awareness',
        detail: 'Monitoring quality of mind',
      },
      {
        name: 'Perception',
        color: '#60a5fa',
        scale: 0.18,
        position: [-0.14, 0.08, 0.18],
        variant: 'perception',
        detail: 'เจตสิกจำอารมณ์ทุกอย่างที่ปรากฏสืบต่อเป็นเรื่องราว สัตว์ บุคคล ต่างๆ สัญญาเจตสิก จำความรู้สึกสุขทุกข์ ดีใจ เสียใจ เฉยๆ ในอารมณ์ทุกอย่าง สัญญาเจตสิก เป็นปัจจัยที่สำคัญที่ส่งเสริมความผูกพันยึดมั่นในชีวิต เช่นเดียวกับเวทนาเจตสิกซึ่งเมื่อรู้สึกสุขหรือดีใจ เป็นต้น ก็ย่อมสำคัญยึดมั่นผูกพันต้องการความรู้สึกนั้นๆ เรื่อยๆ ไป',
        modelPath: perceptionBowlModel,
        modelTargetWorldSize: 0.022,
        modelOffset: { x: 0, y: -0.28, z: 0.42 },
      },
    ]

    return seeds.map((seed) => {
      const baseOptions = {
        name: seed.name,
        detail: seed.detail ?? '',
        color: seed.color,
        scale: seed.scale,
        position: seed.position,
        labelEnabled: false,
        motionSpeed: 0.0015,
        modelPath: seed.modelPath,
        modelTargetWorldSize: seed.modelTargetWorldSize,
        modelOffset: seed.modelOffset,
        opacity: 0.5,
      }

      switch (seed.variant) {
        case 'contact':
          return new ContactMental(baseOptions)
        case 'attention':
          return new AttentionMental(baseOptions)
        case 'feeling':
          return new FeelingMental(baseOptions)
        case 'intention':
          return new IntentionMental(baseOptions)
        case 'consciousness':
          return new ConsciousnessMental(baseOptions)
        case 'awareness':
          return new AwarenessMental(baseOptions)
        case 'perception':
          return new PerceptionMental(baseOptions)
        case 'neutral':
        default:
          return new NeutralMental(baseOptions)
      }
    })
  }, [])

  const mentalNames = useMemo(() => neutralMentals.map((m) => m.getName()), [neutralMentals])

  const handleSelect = (info: InspectSelection) => {
    setSelected(info)
    setPanelPosition(info.screenPosition ?? null)
  }

  const handleClose = () => {
    setSelected(null)
    setPanelPosition(null)
  }

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) {
      setHighlightSelection([])
      return
    }

    const matches: THREE.Object3D[] = []
    const mindMesh = mind.getMesh()
    if (mindMesh && mind.getName().toLowerCase().includes(term)) {
      matches.push(mindMesh)
    }

    mind.getMentals().forEach((mental) => {
      if (mental.getName().toLowerCase().includes(term)) {
        const mesh = mental.getMesh()
        if (mesh) matches.push(mesh)
      }
    })

    setHighlightSelection(matches)
  }

  const handleVoice = async (selection: InspectSelection) => {
    const apiKey = import.meta.env.VITE_GOOGLE_TTS_KEY
    if (!apiKey) {
      alert('Missing VITE_GOOGLE_TTS_KEY. Add it to your .env to enable voice.')
      return
    }
    const text = selection.detail ? `${selection.name}. ${selection.detail}` : selection.name
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

      if (!res.ok) {
        throw new Error(`TTS request failed: ${res.status}`)
      }

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

  const mindBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: 12,
    left: 12,
    padding: '10px 14px',
    borderRadius: 12,
    background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(16,185,129,0.8))',
    color: '#f8fafc',
    fontWeight: 800,
    letterSpacing: 0.2,
    boxShadow: '0 10px 26px rgba(0,0,0,0.25), 0 0 12px rgba(59,130,246,0.35)',
    border: '1px solid rgba(255,255,255,0.22)',
    zIndex: 15,
  }

  return (
    <main className="page simulation-page">
      <div className="mindstudy-hero" style={{ paddingBottom: 12 }}>
        <div>
          <div style={{ display: 'flex'}}>
            <button className="mindstudy-btn ghost" type="button" onClick={() => navigate('/mind-study')}>
              ← Back to Mind Study
            </button>
          </div>
        </div>
      </div>

      <div className="simulation-full" style={{ position: 'relative', minHeight: '70vh', borderRadius: 16, overflow: 'hidden' }}>
        <div style={mindBadgeStyle}>{readableMindName}</div>
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 10,
            pointerEvents: 'none',
            zIndex: 12,
          }}
        >
          {searchOpen ? (
            <>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  background: 'rgba(17, 24, 39, 0.9)',
                  color: '#e5e7eb',
                  padding: '10px 10px',
                  borderRadius: 12,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  pointerEvents: 'auto',
                }}
              >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearch()
                  }}
                  placeholder="Search mind / mental"
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(148, 163, 184, 0.6)',
                    background: 'rgba(30, 41, 59, 0.95)',
                    color: '#e5e7eb',
                    minWidth: 220,
                  }}
                />
                <button
                  className="mindstudy-btn primary"
                  type="button"
                  onClick={handleSearch}
                  style={{ padding: '10px 12px', height: 44, display: 'flex', alignItems: 'center', gap: 6, fontSize: 18 }}
                >
                  🔍
                </button>
                <button
                  className="mindstudy-btn ghost"
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  style={{ padding: '10px 12px', height: 44, fontSize: 16 }}
                >
                  ✕
                </button>
              </div>
              <div
                style={{
                  background: 'rgba(17, 24, 39, 0.9)',
                  color: '#e5e7eb',
                  padding: '10px 12px',
                  borderRadius: 12,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  maxHeight: 180,
                  overflow: 'auto',
                  minWidth: 240,
                  pointerEvents: 'auto',
                }}
              >
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, color: '#9ca3af', marginBottom: 6 }}>Mind</div>
                <div style={{ marginBottom: 10 }}>{mind.getName()}</div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, color: '#9ca3af', marginBottom: 4 }}>Mentals</div>
                <ul style={{ margin: 0, paddingLeft: 16, display: 'grid', gap: 4 }}>
                  {mentalNames.map((m) => (
                    <li key={m} style={{ lineHeight: 1.2 }}>{m}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              style={{
                width: 54,
                height: 54,
                borderRadius: 12,
                background: 'rgba(17, 24, 39, 0.9)',
                color: '#e5e7eb',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 22,
                pointerEvents: 'auto',
              }}
            >
              🔍
            </button>
          )}
        </div>
        {selected && (
          <OptionMenu
            selection={selected}
            panelPosition={panelPosition}
            onClose={handleClose}
            onVoice={handleVoice}
            voiceLoading={voiceLoading}
          />
        )}
        <NeutralMindScene
          mind={mind}
          mentals={neutralMentals}
          selectedMentalName={selected?.name ?? null}
          onSelectMental={handleSelect}
          onUpdatePanelPosition={setPanelPosition}
          highlightSelection={highlightSelection}
        />
      </div>
    </main>
  )
}

