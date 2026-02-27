import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { SenseObject } from '../mindwebsite/classes/SenseObject'

import telescopeModel from '../assets/telescope.glb?url'
import earModel from '../assets/ear.glb?url'
import noseModel from '../assets/nose.glb?url'
import tongueModel from '../assets/tongue.glb?url'
import heartModel from '../assets/crystal_heart.glb?url'
import pictureModel from '../assets/picture.glb?url'
import soundModel from '../assets/sound.glb?url'

const TELESCOPE_LIGHTS = [
  { position: [2, 2, 2] as [number, number, number], intensity: 3.5, color: '#ffffff' },
  { position: [-1.5, 1, 2] as [number, number, number], intensity: 2.5, color: '#e0f2fe' },
  { position: [0, -1, 2] as [number, number, number], intensity: 2, color: '#fef3c7' },
]

const SENSE_OBJECTS = [
  new SenseObject({ id: 'eyes', label: 'ดวงตา', modelPath: telescopeModel, position: [0, 0, 0], scale: 1, triggerLine: 'ดวงตา', ambientBoost: 1.2, pointLights: TELESCOPE_LIGHTS }),
  new SenseObject({ id: 'ear', label: 'หู', modelPath: earModel, position: [0, 0, 0], scale: 1, triggerLine: 'หู' }),
  new SenseObject({ id: 'nose', label: 'จมูก', modelPath: noseModel, position: [0, 0, 0], scale: 1, triggerLine: 'จมูก' }),
  new SenseObject({ id: 'tongue', label: 'ลิ้น', modelPath: tongueModel, position: [0, 0, 0], scale: 1, triggerLine: 'ลิ้น' }),
  new SenseObject({ id: 'body', label: 'กาย', position: [0, 0, 0], scale: 1, triggerLine: 'กาย', primitive: 'box', primitiveColor: '#64748b' }),
  new SenseObject({ id: 'mind', label: 'ใจ หรือ มโน', modelPath: heartModel, position: [0, 0, 0], scale: 1, triggerLine: 'ใจ หรือ มโน' }),
]

const EXTERNAL_OBJECTS = [
  new SenseObject({ id: 'picture', label: 'รูป', modelPath: pictureModel, position: [0, 0, 0], scale: 1, triggerLine: '' }),
  new SenseObject({ id: 'sound', label: 'เสียง', modelPath: soundModel, position: [0, 0, 0], scale: 1, triggerLine: '' }),
  new SenseObject({ id: 'smell', label: 'กลิ่น', position: [0, 0, 0], scale: 1, triggerLine: '', primitive: 'sphere', primitiveColor: '#a78bfa' }),
  new SenseObject({ id: 'taste', label: 'รส', position: [0, 0, 0], scale: 1, triggerLine: '', primitive: 'sphere', primitiveColor: '#f59e0b' }),
  new SenseObject({ id: 'touch', label: 'สิ่งสัมผัสทางกาย', position: [0, 0, 0], scale: 1, triggerLine: '', primitive: 'sphere', primitiveColor: '#64748b' }),
  new SenseObject({ id: 'dhamma', label: 'ธรรมารมณ์', position: [0, 0, 0], scale: 1, triggerLine: '', primitive: 'sphere', primitiveColor: '#ec4899' }),
]

;[telescopeModel, earModel, noseModel, tongueModel, heartModel, pictureModel, soundModel].forEach((url) =>
  useGLTF.preload(url)
)

const SENSE_NARRATIVE_LINES = [
  'วิถีจิตเกิดขึ้นได้จาก อายตนะภายใน และ อายตนะภายนอก',
  'อายตนะภายในคือช่องทางรับรู้ของเราได้แก่',
  'ดวงตา',
  'หู',
  'จมูก',
  'ลิ้น',
  'กาย',
  'ใจ หรือ มโน',
]

const BAHIRA_NARRATIVE_LINES = [
  'อายตนะภายนอกก็คือสิ่งที่เข้ามากระทบกับประตู 6 บานนั้นก็คือ รูป ที่ คู่กับตา เสียงคู่กับหู กลิ่นคู่กับจมูก รสคู่กับลิ้น สิ่งสัมผัสทางกายคู่กับกาย และธรรมารมณ์ หรือ เรื่องราว อารมณ์ ความคิดต่างๆที่มากระทบคู่กับใจ โดยเมื่อ อายตนะภายใน และ อายตนะภายนอก มากระทบกัน วิญญาณ ก็จะเกิดขึ้นมา',
]

function SenseObjectModelPart({ senseObject }: { senseObject: SenseObject }) {
  useGLTF.preload(senseObject.modelPath!)
  const { scene } = useGLTF(senseObject.modelPath!)
  const clonedScene = useMemo(() => scene.clone(true), [scene])
  return <primitive object={clonedScene} />
}

function SenseObjectPrimitivePart({ senseObject }: { senseObject: SenseObject }) {
  return (
    <mesh>
      {senseObject.primitive === 'box' ? (
        <boxGeometry args={[0.8, 0.8, 0.8]} />
      ) : (
        <sphereGeometry args={[0.5, 32, 32]} />
      )}
      <meshStandardMaterial color={senseObject.primitiveColor} roughness={0.4} metalness={0.1} />
    </mesh>
  )
}

function SenseObjectScene({ senseObject }: { senseObject: SenseObject }) {
  return (
    <group position={[0, 0, 0]} scale={1}>
      <ambientLight intensity={senseObject.ambientBoost} />
      {senseObject.pointLights.map((pl, i) => (
        <pointLight
          key={i}
          position={pl.position}
          intensity={pl.intensity ?? 1}
          color={pl.color ?? '#ffffff'}
          distance={8}
          decay={2}
        />
      ))}
      {senseObject.modelPath ? (
        <SenseObjectModelPart senseObject={senseObject} />
      ) : (
        <SenseObjectPrimitivePart senseObject={senseObject} />
      )}
    </group>
  )
}

function SenseObjectCanvas({ senseObject }: { senseObject: SenseObject }): React.ReactElement {
  return (
    <Canvas
      className="mindstudy-model-canvas"
      style={{ width: '100%', height: 200 }}
      camera={{ position: [0, 0, 4], fov: 35 }}
    >
      <color attach="background" args={['#e1f5fe']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 6, 4]} intensity={1.25} />
      <Suspense fallback={null}>
        <SenseObjectScene senseObject={senseObject} />
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  )
}

function DualCanvasBox({ internal, external }: { internal: SenseObject; external: SenseObject }): React.ReactElement {
  return (
    <div style={{ display: 'flex', gap: 8, width: '100%', minHeight: 200 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <SenseObjectCanvas senseObject={internal} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <SenseObjectCanvas senseObject={external} />
      </div>
    </div>
  )
}

type NarrativeMode = 'internal' | 'external'

export function MindStudyCognitiveStart(): React.ReactElement {
  const navigate = useNavigate()
  const [narrativeMode, setNarrativeMode] = useState<NarrativeMode>('internal')
  const [narrativePlaying, setNarrativePlaying] = useState(false)
  const [subtitleLine, setSubtitleLine] = useState<string | null>(null)
  const [subtitleVisible, setSubtitleVisible] = useState(true)

  const setModeAndStop = useCallback((mode: NarrativeMode) => {
    if (narrativePlaying && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setNarrativePlaying(false)
      setSubtitleLine(null)
    }
    setNarrativeMode(mode)
  }, [narrativePlaying])

  const playNarrative = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    if (narrativePlaying) {
      window.speechSynthesis.cancel()
      setNarrativePlaying(false)
      setSubtitleLine(null)
      return
    }
    setNarrativePlaying(true)
    if (narrativeMode === 'external') {
      const line = BAHIRA_NARRATIVE_LINES[0]
      setSubtitleLine(line)
      const u = new SpeechSynthesisUtterance(line)
      u.lang = 'th-TH'
      u.rate = 0.9
      u.onend = () => {
        setNarrativePlaying(false)
        setSubtitleLine(null)
      }
      u.onerror = () => {
        setNarrativePlaying(false)
        setSubtitleLine(null)
      }
      window.speechSynthesis.speak(u)
    } else {
      let index = 0
      const speakNext = () => {
        if (index >= SENSE_NARRATIVE_LINES.length) {
          setNarrativePlaying(false)
          setSubtitleLine(null)
          return
        }
        const line = SENSE_NARRATIVE_LINES[index]
        setSubtitleLine(line)
        const u = new SpeechSynthesisUtterance(line)
        u.lang = 'th-TH'
        u.rate = 0.9
        u.onend = () => {
          index += 1
          speakNext()
        }
        u.onerror = () => {
          setNarrativePlaying(false)
          setSubtitleLine(null)
        }
        window.speechSynthesis.speak(u)
      }
      speakNext()
    }
  }, [narrativePlaying, narrativeMode])

  return (
    <main className="page">
      <div className="mindstudy-hero">
        <div>
          <p className="mindstudy-kicker">Cognitive Foundation</p>
          <h1 className="mindstudy-title">How Cognitive Process Starts</h1>
          <p className="mindstudy-lead">
            อายตนะ (sense bases) are the six channels through which we perceive the world. Explore each one below.
          </p>
        </div>
      </div>

      <div className="mindstudy-shell">
        <aside className="mindstudy-sidebar">
          <div className="mindstudy-nav">
            <p className="mindstudy-nav-label">Topics</p>
            <a href="#ayatana" className="mindstudy-nav-item">
              อายตนะภายใน & อายตนะภายนอก
            </a>
            <a href="#cognitive" className="mindstudy-nav-item sub">
              How Cognitive process work?
            </a>
          </div>
        </aside>
        <section className="mindstudy-content">
          <article className="mindstudy-section mindstudy-grid-surface" id="ayatana">
            <div className="mindstudy-section-header" style={{ marginBottom: 16 }}>
              <span className="mindstudy-badge">อายตนะ</span>
              <h2 style={{ margin: '8px 0 4px' }}>อายตนะภายใน & อายตนะภายนอก</h2>
              <p className="mindstudy-section-desc" style={{ marginBottom: 12 }}>
                อายตนะภายในคือช่องทางรับรู้ 6 ประการ อายตนะภายนอกคือสิ่งที่มากระทบ คู่กัน
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`mindstudy-btn ${narrativeMode === 'internal' ? 'primary' : 'ghost'}`}
                    onClick={() => setModeAndStop('internal')}
                    aria-pressed={narrativeMode === 'internal'}
                    style={{ padding: '8px 14px', fontSize: 13 }}
                  >
                    อายตนะภายใน
                  </button>
                  <button
                    type="button"
                    className={`mindstudy-btn ${narrativeMode === 'external' ? 'primary' : 'ghost'}`}
                    onClick={() => setModeAndStop('external')}
                    aria-pressed={narrativeMode === 'external'}
                    style={{ padding: '8px 14px', fontSize: 13 }}
                  >
                    อายตนะภายนอก
                  </button>
                </div>
                <button
                  type="button"
                  className="mindstudy-btn primary"
                  onClick={playNarrative}
                  aria-label={narrativePlaying ? 'Stop narration' : 'Play narration'}
                  aria-pressed={narrativePlaying}
                  style={{ padding: '10px 18px', fontSize: 14, fontWeight: 700 }}
                >
                  {narrativePlaying ? '⏹ Stop' : '▶ Play'}
                </button>
              </div>
              {subtitleVisible && (
                <div
                  role="status"
                  aria-live="polite"
                  style={{
                    background: 'rgba(15,23,42,0.08)',
                    padding: '10px 14px',
                    borderRadius: 10,
                    fontSize: 14,
                    color: '#334155',
                    border: '1px solid rgba(15,23,42,0.1)',
                  }}
                >
                  {subtitleLine !== null ? (
                    <span lang="th">{subtitleLine}</span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Choose narrative above, then click Play</span>
                  )}
                </div>
              )}
            </div>
            <div className="mindstudy-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {SENSE_OBJECTS.map((obj, i) => (
                <article
                  key={obj.id}
                  className="mindstudy-card"
                  style={
                    narrativeMode === 'internal' && subtitleLine === obj.triggerLine
                      ? { borderColor: '#60a5fa', boxShadow: '0 0 0 2px rgba(96,165,250,0.4)' }
                      : undefined
                  }
                >
                  <div className="mindstudy-card-trigger" style={{ cursor: 'default', padding: 16 }}>
                    <div className="mindstudy-card-topline">
                      <span className="mindstudy-level-pill small">{obj.label}</span>
                      <span className="mindstudy-level-pill small" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                        ↔ {EXTERNAL_OBJECTS[i].label}
                      </span>
                    </div>
                    <div className="mindstudy-card-preview">
                      <div className="mindstudy-model-only">
                        <DualCanvasBox internal={obj} external={EXTERNAL_OBJECTS[i]} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="mindstudy-section mindstudy-cognitive-box" id="cognitive">
            <button
              type="button"
              className="mindstudy-cognitive-box-trigger"
              onClick={() => navigate('/mind-study/cognitive')}
              aria-label="Go to How Cognitive process work?"
            >
              <span className="mindstudy-badge light">Cognitive</span>
              <h3 className="mindstudy-cognitive-box-title">How Cognitive process work?</h3>
              <span className="mindstudy-caret" aria-hidden>→</span>
            </button>
          </article>
        </section>
      </div>

      <div style={{ padding: '0 24px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <button
          type="button"
          className="mindstudy-btn ghost"
          onClick={() => navigate('/mind-study')}
          style={{ marginTop: 8 }}
        >
          ← Back to Mind Study
        </button>
      </div>
    </main>
  )
}
