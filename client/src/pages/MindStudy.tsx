import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { DuckPool, type DropDropletFn } from '../components/DuckPool'
import { DhammaObject } from '../mindwebsite/classes/DhammaObject'

const POOL_NARRATIVE_TH =
  'ลักษณะพื้นฐานของจิต มีลักษณะผ่องใสแต่เศร้าหมองเพราะอุปกิเลศที่จรมาอยู่ โดยธรรมชาติของจิตเหมือนน้ำใสๆที่ไม่มีอะไรมาผสมเลยเป็นกลางๆรับรู้เฉยๆแต่ที่มันมีความรู้สึกขึ้นมาได้ เช่น ขุ่นมัว ดีใจ เพราะมี้อุปกกิเลศ หรือก็คือ อารมณ์ ที่จรมาสู่จิต เหมือน หยดสี ที่ใส่ลงมา ทำให้จิตมีสีหรืออารมณ์ที่แตกต่างไปในแต่ละช่วง'

/** Narrative split into lines for subtitle sync with TTS */
const POOL_NARRATIVE_LINES = [
  'ลักษณะพื้นฐานของจิต มีลักษณะผ่องใสแต่เศร้าหมองเพราะอุปกิเลศที่จรมาอยู่ ',
  'โดยธรรมชาติของจิตเหมือนน้ำใสๆ ที่ไม่มีอะไรมาผสมเลยเป็นกลางๆ  รับรู้เฉยๆ',
  'แต่ที่มันมีความรู้สึกขึ้นมาได้ เช่น ขุ่นมัว ดีใจ เพราะมี้อุปกิเลศ หรือก็คือ อารมณ์ ที่จรมาสู่จิต',
  'เหมือน หยดสี ที่ใส่ลงมา',
  'ทำให้จิตมีสีหรืออารมณ์ที่แตกต่างไปในแต่ละช่วง',
]

import violinModel from '../assets/violin.glb?url'
import heartModel from '../assets/crystal_heart.glb?url'
import paperPlaneModel from '../assets/paper_plane.glb?url'
import paperPlaneAssetModel from '../assets/paper_plane_asset.glb?url'
import brainModel from '../assets/brain_3d.glb?url'
import ghostModel from '../assets/ghost_of_tsushiito.glb?url'
import { loadMentalTableRows } from '../utils/mentalTable'
import { CETASIKA_CATEGORIES, type CetasikaCard } from '../data/cetasikaGrid'
import { MentalSpherePreview } from '../components/MentalSpherePreview'

type Topic = {
  id: string
  title: string
  description: string
  highlights: string[]
}

const mainTopic: Topic = {
  id: 'mind-types',
  title: 'Four Types of Mind to Practice',
  description:
    'Switching between mind states is like swapping game modes. Studying four core modes—Calm, Focused, Curious, and Compassionate—helps you pick the right stance for the moment.',
  highlights: [
    'Each mode is trainable: you can skill up any of them with reps.',
    'Knowing your current mode makes reactions predictable (and shiftable).',
    'Balancing the four keeps you resilient instead of rigid.',
  ],
}

const GOOD_MENTAL_ACCENT = '#22c55e'
const BAD_MENTAL_ACCENT = '#ef4444'
const GOOD_MENTAL_TEXT = '#14532d'
const BAD_MENTAL_TEXT = '#7f1d1d'
const NEUTRAL_MENTAL_TEXT = '#1f2937'

const defaultAggregates: DhammaObject[] = [
  new DhammaObject({
    id: 'calm',
    title: 'Calm & Balanced',
    modelLabel: 'Soft Presence Model',
    modelPath: ghostModel,
    description: 'A mind that is steady and non-reactive—breath is smooth, body is light, and attention holds without force.',
    highlights: [
      'Breath and posture feel even; signals safety to the nervous system.',
      'Helps you respond instead of react when things spike.',
      'Best built with gentle, continuous practice (not straining).',
    ],
  }),
  new DhammaObject({
    id: 'focused',
    title: 'Focused & Collected😎',
    modelLabel: 'Attention Beam Model',
    modelPath: brainModel,
    description: 'A mind that locks onto one task with clarity—distractions fade to the edges while the target stays crisp.',
    highlights: [
      'Narrow spotlight; great for deep work or precise listening.',
      'Over-tight focus can tire quickly—pair with Calm to stay sustainable.',
      'Strengthens by setting clear intentions and reducing noise.',
    ],
  }),
  new DhammaObject({
    id: 'curious',
    title: 'Curious & Investigative',
    modelLabel: 'Scout Model',
    modelPath: paperPlaneAssetModel,
    description: 'A mind that explores and maps—open to patterns, asking “what is this?” instead of “do I like this?”',
    highlights: [
      'Wide, playful attention; spots anomalies and new angles.',
      'Reduces defensiveness by staying in question-mode.',
      'Pairs well with Focused: scout widely, then zoom in.',
    ],
  }),
  new DhammaObject({
    id: 'compassionate',
    title: 'Warm & Compassionate',
    modelLabel: 'Heartfield Model',
    modelPath: heartModel,
    description: 'A mind that includes others with warmth—soft eyes, generous assumptions, and care for shared wellbeing.',
    highlights: [
      'Turns threat responses down, easing social tension.',
      'Builds trust and cooperation in teams and relationships.',
      'Grows through small acts: wishing well, listening fully.',
    ],
  }),
]

function AggregateModel({
  modelPath,
  scale,
  position,
}: {
  modelPath: string
  scale: number
  position: [number, number, number]
}): React.ReactElement {
  useEffect(() => {
    useGLTF.preload(modelPath)
  }, [modelPath])

  const { scene } = useGLTF(modelPath)
  const clonedScene = useMemo(() => scene.clone(), [scene])

  return (
    <Canvas
      className="mindstudy-model-canvas"
      style={{ width: '100%', height: 320 }}
      camera={{ position: [0, 4, 6], fov: 30 }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 4]} intensity={1.25} />
      <primitive object={clonedScene} position={position} scale={scale} />
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  )
}

export function MindStudy(): React.ReactElement {
  const navigate = useNavigate()
  const [aggregates, setAggregates] = useState<DhammaObject[]>(defaultAggregates)
  const [navOpen, setNavOpen] = React.useState<boolean>(true)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [selectedMind, setSelectedMind] = useState<DhammaObject | null>(null)
  const [learnMoreConfirmOpen, setLearnMoreConfirmOpen] = useState<boolean>(false)
  const [showDuckPool, setShowDuckPool] = useState<boolean>(false)
  const [selectedCetasika, setSelectedCetasika] = useState<CetasikaCard | null>(null)
  const [cetasikaModalOpen, setCetasikaModalOpen] = useState<boolean>(false)
  const [hoveredCetasikaId, setHoveredCetasikaId] = useState<string | null>(null)
  const [neutralNavOpen, setNeutralNavOpen] = useState(false)
  const [badNavOpen, setBadNavOpen] = useState(false)
  const [goodNavOpen, setGoodNavOpen] = useState(false)
  const [narrativePlaying, setNarrativePlaying] = useState<boolean>(false)
  const [subtitleLine, setSubtitleLine] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const dropDropletRef = React.useRef<DropDropletFn | null>(null)

  const audioRef = React.useRef<HTMLAudioElement | null>(null)

  const playPoolNarrative = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (narrativePlaying) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setNarrativePlaying(false)
      setSubtitleLine(null)
      return
    }
    const apiKey = import.meta.env.VITE_GOOGLE_TTS_KEY
    if (!apiKey && !window.speechSynthesis) {
      alert('No TTS available. Add VITE_GOOGLE_TTS_KEY to .env for Google Cloud TTS, or use a browser with Speech Synthesis.')
      return
    }
    if (!apiKey) {
      console.warn('VITE_GOOGLE_TTS_KEY not set. Using browser TTS (may be less smooth).')
    }
    setNarrativePlaying(true)
    let index = 0
    let cancelled = false
    const DROPLET_LINE = 'เหมือน หยดสี ที่ใส่ลงมา'
    const DROPLET_COLORS: [number, number, number][] = [
      [1, 0, 0],
      [0, 0, 1],
      [0, 1, 0],
      [1, 0.92, 0.016],
      [0.659, 0.333, 0.969],
      [0.024, 0.714, 0.831],
      [0.976, 0.451, 0.086],
    ]
    const DROPLET_POSITIONS: [number, number][] = [
      [-1.5, -1],
      [0, 1],
      [1.5, -0.5],
      [-1, 1.2],
      [1.2, 0.8],
      [-0.8, -1.5],
      [1.5, 1],
    ]
    const scheduleDropletDrops = () => {
      const drop = dropDropletRef.current
      if (!drop) return
      DROPLET_COLORS.forEach(([r, g, b], i) => {
        const [x, z] = DROPLET_POSITIONS[i]
        setTimeout(() => drop(x, z, r, g, b), i * 850)
      })
    }
    const playWithGoogleTTS = (text: string): Promise<void> =>
      new Promise((resolve, reject) => {
        if (!apiKey) {
          const u = new SpeechSynthesisUtterance(text)
          u.lang = 'th-TH'
          u.rate = 0.9
          u.onend = () => resolve()
          u.onerror = () => reject(new Error('Web TTS failed'))
          window.speechSynthesis?.speak(u)
          return
        }
        fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode: 'th-TH', name: 'th-TH-Standard-A' },
            audioConfig: { audioEncoding: 'MP3', speakingRate: 0.95 },
          }),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`TTS request failed: ${res.status}`)
            return res.json()
          })
          .then((data) => {
            if (!data.audioContent) throw new Error('No audioContent in TTS response')
            const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`)
            audioRef.current = audio
            audio.onended = () => {
              audioRef.current = null
              resolve()
            }
            audio.onerror = () => {
              audioRef.current = null
              reject(new Error('Audio playback failed'))
            }
            return audio.play()
          })
          .then(() => {})
          .catch(reject)
      })
    const speakNext = async () => {
      if (cancelled || index >= POOL_NARRATIVE_LINES.length) {
        setNarrativePlaying(false)
        setSubtitleLine(null)
        return
      }
      const line = POOL_NARRATIVE_LINES[index]
      setSubtitleLine(line)
      if (line === DROPLET_LINE) scheduleDropletDrops()
      try {
        await playWithGoogleTTS(line)
      } catch (err) {
        console.error('TTS error', err)
        setNarrativePlaying(false)
        setSubtitleLine(null)
        return
      }
      index += 1
      speakNext()
    }
    speakNext()
    return () => {
      cancelled = true
    }
  }, [narrativePlaying])

  useEffect(() => {
    if (!showDuckPool) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setNarrativePlaying(false)
      setSubtitleLine(null)
    }
  }, [showDuckPool])

  useEffect(() => {
    let cancelled = false
    const modelPaths = [ghostModel, brainModel, paperPlaneAssetModel, heartModel, violinModel]

    const loadFromExcel = async () => {
      setLoading(true)
      try {
        const rows = await loadMentalTableRows()
        if (cancelled) return

        if (!rows.length) {
          setLoadError('MentalTable.xlsx is empty; showing defaults.')
          setAggregates(defaultAggregates)
          return
        }

        const mapped = rows.map(
          (row, index) =>
            new DhammaObject({
              id: row.id,
              title: row.name,
              description: row.description,
              highlights: row.highlights,
              modelLabel: row.group || 'Mental type',
              modelPath: modelPaths[index % modelPaths.length],
            }),
        )

        setAggregates(mapped)
        setLoadError(null)
      } catch (err) {
        console.error('Failed to load MentalTable.xlsx', err)
        if (!cancelled) {
          setAggregates(defaultAggregates)
          setLoadError('Unable to read MentalTable.xlsx; showing defaults.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadFromExcel()
    return () => {
      cancelled = true
    }
  }, [])

  const modelTransforms = useMemo(
    () =>
      Object.fromEntries(
        aggregates.map((agg) => [
          agg.id,
          {
            scale:
              agg.id === 'focused'
                ? 2.4
                : agg.id === 'compassionate'
                  ? 2
                  : agg.id === 'curious'
                    ? 1
                  : agg.id === 'calm'
                    ? 1
                    : 1.6,
            pos:
              agg.id === 'focused'
                ? { x: -0.25, y: -0.5, z: 0 }
                : agg.id === 'compassionate'
                  ? { x: -0.3, y: -1.5, z: 0 }
                  : agg.id === 'curious'
                    ? { x: -0.25, y: 0, z: 0 }
                  : agg.id === 'calm'
                    ? { x: 0, y: 0, z: 0.25 }
                    : { x: 0, y: 0, z: 0 },
          },
        ]),
      ),
    [aggregates],
  )

  return (
    <main className="page">
      <div className="mindstudy-hero">
        <div>
          <p className="mindstudy-kicker">Study Guide</p>
          <h1 className="mindstudy-title">Mind Study: The Five Aggregates</h1>
          <p className="mindstudy-lead">
            Use the side outline to jump between aggregates. Each section keeps the writing concise so the core
            ideas stay aligned and easy to scan.
          </p>
        </div>
      </div>

      <div className="mindstudy-shell">
        <aside className="mindstudy-sidebar">
          <div className="mindstudy-nav">
            <p className="mindstudy-nav-label">Topics</p>
            <button
              type="button"
              className="mindstudy-nav-toggle"
              onClick={() => setNavOpen((prev) => !prev)}
              aria-expanded={navOpen}
              aria-controls="mindstudy-nav-subtopics"
            >
              <span>{mainTopic.title}</span>
              <span className={`mindstudy-caret ${navOpen ? 'open' : ''}`} aria-hidden>
                ▼
              </span>
            </button>
            <div
              id="mindstudy-nav-subtopics"
              className={`mindstudy-nav-children ${navOpen ? 'open' : ''}`}
              role="region"
              aria-label="Subtopics"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  type="button"
                  className="mindstudy-nav-item sub"
                  style={{ textAlign: 'left', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onClick={() => setNeutralNavOpen((o) => !o)}
                  aria-expanded={neutralNavOpen}
                >
                  <span>Cetasikas — Neutral (13)</span>
                  <span className={`mindstudy-caret ${neutralNavOpen ? 'open' : ''}`} aria-hidden>▼</span>
                </button>
                <div
                  className={`mindstudy-nav-children mindstudy-nav-children-nested ${neutralNavOpen ? 'open' : ''}`}
                  style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 8 }}
                >
                  <a className="mindstudy-nav-item sub" href="#cetasikas-neutral-universal">
                    สัพพจิตตสาธารณ (7)
                  </a>
                  <a className="mindstudy-nav-item sub" href="#cetasikas-neutral-pakinnaka">
                    ปกิณณก (6)
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  type="button"
                  className="mindstudy-nav-item sub"
                  style={{ textAlign: 'left', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onClick={() => setBadNavOpen((o) => !o)}
                  aria-expanded={badNavOpen}
                >
                  <span style={{ color: BAD_MENTAL_TEXT }}>Cetasikas — Bad (14)</span>
                  <span className={`mindstudy-caret ${badNavOpen ? 'open' : ''}`} aria-hidden>▼</span>
                </button>
                <div
                  className={`mindstudy-nav-children mindstudy-nav-children-nested ${badNavOpen ? 'open' : ''}`}
                  style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 8 }}
                >
                  <a className="mindstudy-nav-item sub" href="#cetasikas-bad-moha" style={{ color: BAD_MENTAL_TEXT }}>โมหจตุกกะ (4)</a>
                  <a className="mindstudy-nav-item sub" href="#cetasikas-bad-lobha" style={{ color: BAD_MENTAL_TEXT }}>โลภจตุกกะ (3)</a>
                  <a className="mindstudy-nav-item sub" href="#cetasikas-bad-dosa" style={{ color: BAD_MENTAL_TEXT }}>โทจตุกกะ (4)</a>
                  <a className="mindstudy-nav-item sub" href="#cetasikas-bad-thinamiddha" style={{ color: BAD_MENTAL_TEXT }}>ถีนมิทธะ (2)</a>
                  <a className="mindstudy-nav-item sub" href="#cetasikas-bad-vicikiccha" style={{ color: BAD_MENTAL_TEXT }}>วิจิกิจฉา (1)</a>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  type="button"
                  className="mindstudy-nav-item sub"
                  style={{ textAlign: 'left', width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  onClick={() => setGoodNavOpen((o) => !o)}
                  aria-expanded={goodNavOpen}
                >
                  <span style={{ color: GOOD_MENTAL_TEXT }}>Cetasikas — Good (25)</span>
                  <span className={`mindstudy-caret ${goodNavOpen ? 'open' : ''}`} aria-hidden>▼</span>
                </button>
                <div
                  className={`mindstudy-nav-children mindstudy-nav-children-nested ${goodNavOpen ? 'open' : ''}`}
                  style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 8 }}
                >
                  <a className="mindstudy-nav-item sub" href="#cetasikas-good-sobhana" style={{ color: GOOD_MENTAL_TEXT }}>โสภณสาธารณ (19)</a>
                  <a className="mindstudy-nav-item sub" href="#cetasikas-good-virati" style={{ color: GOOD_MENTAL_TEXT }}>วิรตี (3)</a>
                  <a className="mindstudy-nav-item sub" href="#cetasikas-good-appamanna" style={{ color: GOOD_MENTAL_TEXT }}>อัปปมัญญา (2)</a>
                  <a className="mindstudy-nav-item sub" href="#cetasikas-good-panna" style={{ color: GOOD_MENTAL_TEXT }}>ปัญญา (1)</a>
                </div>
              </div>
              {aggregates.map((topic) => (
                <a
                  key={topic.id}
                  className="mindstudy-nav-item sub"
                  href={`#${topic.id}`}
                >
                  {topic.getPreview()}
                </a>
              ))}
            </div>
          </div>
        </aside>

        <section className="mindstudy-content">
          <article className="mindstudy-section" id={mainTopic.id}>
            <div className="mindstudy-section-header">
              <span className="mindstudy-badge">Overview</span>
              <h2>{mainTopic.title}</h2>
              <p className="mindstudy-section-desc">{mainTopic.description}</p>
            </div>
            <ul className="mindstudy-list">
              {mainTopic.highlights.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>

          <article className="mindstudy-section mindstudy-cognitive-box" id="cognitive-start">
            <button
              type="button"
              className="mindstudy-cognitive-box-trigger"
              onClick={() => navigate('/mind-study/cognitive-start')}
              aria-label="Go to How Cognitive process starts"
            >
              <span className="mindstudy-badge light">Foundation</span>
              <h3 className="mindstudy-cognitive-box-title">How Cognitive process starts</h3>
              <span className="mindstudy-caret" aria-hidden>→</span>
            </button>
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

          <article className="mindstudy-section mindstudy-cognitive-box" id="learn-more">
            <button
              type="button"
              className="mindstudy-cognitive-box-trigger"
              onClick={() => setLearnMoreConfirmOpen(true)}
              aria-label="Learn more about the mind"
            >
              <span className="mindstudy-badge light">Learn more</span>
              <h3 className="mindstudy-cognitive-box-title">Learn more about the mind</h3>
              <span className="mindstudy-caret" aria-hidden>→</span>
            </button>
          </article>

          {CETASIKA_CATEGORIES.map((cat) => {
            const isNeutral = cat.titleEn.startsWith('Neutral')
            const isGood = cat.titleEn.startsWith('Good')
            const accentColor = isGood
              ? GOOD_MENTAL_ACCENT
              : isNeutral
                ? '#94a3b8'
                : BAD_MENTAL_ACCENT
            const topicTextColor = isNeutral ? NEUTRAL_MENTAL_TEXT : isGood ? GOOD_MENTAL_TEXT : BAD_MENTAL_TEXT
            const sectionId = isNeutral ? 'cetasikas-neutral' : isGood ? 'cetasikas-good' : 'cetasikas-bad'

            if (cat.subcategories?.length) {
              return (
                <article
                  key={cat.titleEn}
                  id={sectionId}
                  className="mindstudy-section"
                  style={{
                    borderLeft: `4px solid ${accentColor}`,
                    paddingLeft: 16,
                    marginBottom: 32,
                  }}
                >
                  <div className="mindstudy-section-header">
                    <span className="mindstudy-badge" style={{ background: accentColor }}>
                      {cat.titleEn}
                    </span>
                    <h2 style={{ color: topicTextColor }}>{cat.title}</h2>
                    <p className="mindstudy-section-desc" style={{ color: topicTextColor }}>
                      {cat.count} factors in {cat.subcategories.length} sub-categories. Tap a card to inspect.
                    </p>
                  </div>
                  {cat.subcategories.map((sub, subIdx) => {
                    const subId = sub.id ?? `cetasikas-sub-${subIdx}`
                    return (
                      <div
                        key={subId}
                        id={subId}
                        className="mindstudy-subsection"
                        style={{
                          marginTop: 20,
                          padding: 16,
                          borderRadius: 12,
                          border: `2px solid ${accentColor}`,
                        }}
                      >
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: topicTextColor, marginBottom: 12 }}>
                          {sub.title} — {sub.titleEn}
                        </h3>
                        <div className="mindstudy-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                          {sub.items.map((item, index) => {
                            const levelLabel = (index + 1).toString().padStart(2, '0')
                            return (
                              <article
                                key={item.id}
                                className="mindstudy-card"
                                onMouseEnter={() => setHoveredCetasikaId(item.id)}
                                onMouseLeave={() => setHoveredCetasikaId(null)}
                              >
                                <button
                                  type="button"
                                  className="mindstudy-card-trigger"
                                  onClick={() => {
                                    setSelectedCetasika(item)
                                    setCetasikaModalOpen(true)
                                  }}
                                  aria-label={`${item.pali} (${item.thai})`}
                                >
                                  <div className="mindstudy-card-topline">
                                    <span className="mindstudy-level-pill">{levelLabel}</span>
                                    <span className="mindstudy-mode-hint">Hover for sphere · Tap to inspect</span>
                                  </div>
                                  <div className="mindstudy-card-top">
                                    <div className="mindstudy-card-text">
                                      <h3 className="mindstudy-card-title" style={{ fontSize: 14 }}>{item.pali}</h3>
                                      <p className="mindstudy-card-sub" style={{ fontSize: 11 }}>{item.thai} · {item.className}</p>
                                    </div>
                                    <span className="mindstudy-caret" aria-hidden>→</span>
                                  </div>
                                  <div className="mindstudy-card-preview" style={{ height: 100, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accentColor}18`, borderRadius: 8, overflow: 'hidden' }}>
                                    {hoveredCetasikaId === item.id ? (
                                      <MentalSpherePreview card={item} accentColor={accentColor} />
                                    ) : (
                                      <span style={{ fontSize: 28, fontWeight: 700, color: accentColor }}>{item.pali.charAt(0)}</span>
                                    )}
                                  </div>
                                </button>
                              </article>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </article>
              )
            }

            return (
              <article
                key={cat.titleEn}
                id={sectionId}
                className="mindstudy-section"
                style={{
                  borderLeft: `4px solid ${accentColor}`,
                  paddingLeft: 16,
                  marginBottom: 32,
                }}
              >
                <div className="mindstudy-section-header">
                  <span className="mindstudy-badge" style={{ background: accentColor }}>
                    {cat.titleEn}
                  </span>
                  <h2 style={{ color: topicTextColor }}>{cat.title}</h2>
                  <p className="mindstudy-section-desc" style={{ color: topicTextColor }}>
                    {cat.count} factors. Tap a card to inspect.
                  </p>
                </div>
                <div className="mindstudy-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
                  {cat.items.map((item, index) => {
                    const levelLabel = (index + 1).toString().padStart(2, '0')
                    return (
                      <article
                        key={item.id}
                        className="mindstudy-card"
                        onMouseEnter={() => setHoveredCetasikaId(item.id)}
                        onMouseLeave={() => setHoveredCetasikaId(null)}
                      >
                        <button
                          type="button"
                          className="mindstudy-card-trigger"
                          onClick={() => {
                            setSelectedCetasika(item)
                            setCetasikaModalOpen(true)
                          }}
                          aria-label={`${item.pali} (${item.thai})`}
                        >
                          <div className="mindstudy-card-topline">
                            <span className="mindstudy-level-pill">{levelLabel}</span>
                            <span className="mindstudy-mode-hint">Hover for sphere · Tap to inspect</span>
                          </div>
                          <div className="mindstudy-card-top">
                            <div className="mindstudy-card-text">
                              <h3 className="mindstudy-card-title" style={{ fontSize: 14 }}>{item.pali}</h3>
                              <p className="mindstudy-card-sub" style={{ fontSize: 11 }}>{item.thai} · {item.className}</p>
                            </div>
                            <span className="mindstudy-caret" aria-hidden>→</span>
                          </div>
                          <div className="mindstudy-card-preview" style={{ height: 100, minHeight: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${accentColor}18`, borderRadius: 8, overflow: 'hidden' }}>
                            {hoveredCetasikaId === item.id ? (
                              <MentalSpherePreview card={item} accentColor={accentColor} />
                            ) : (
                              <span style={{ fontSize: 28, fontWeight: 700, color: accentColor }}>{item.pali.charAt(0)}</span>
                            )}
                          </div>
                        </button>
                      </article>
                    )
                  })}
                </div>
              </article>
            )
          })}

          <div className="mindstudy-grid-surface">
            <p className="mindstudy-grid-hint">
              Select a level tile to open the model and study notes.
              {loading ? ' Loading minds from MentalTable.xlsx…' : ''}
              {!loading && loadError ? ` ${loadError}` : ''}
            </p>
            <div className="mindstudy-grid">
              {aggregates.map((topic, index) => {
                const levelNumber = index + 1
                const levelLabel = levelNumber.toString().padStart(2, '0')
                const transform = modelTransforms[topic.id] ?? { scale: 1.6, pos: { x: 0, y: 0, z: 0 } }
                return (
                  <article key={topic.id} className="mindstudy-card" id={topic.id}>
                    <button
                      type="button"
                      className="mindstudy-card-trigger"
                      onClick={() => {
                        setSelectedMind(topic)
                        setModalOpen(true)
                      }}
                      aria-label={topic.title}
                    >
                      <div className="mindstudy-card-topline">
                        <span className="mindstudy-level-pill">Level {levelLabel}</span>
                        <span className="mindstudy-mode-hint">Tap to inspect</span>
                      </div>
                      <div className="mindstudy-card-top">
                        <div className="mindstudy-card-text">
                          <h3 className="mindstudy-card-title">{topic.title}</h3>
                          <p className="mindstudy-card-sub">{topic.modelLabel}</p>
                        </div>
                        <span className="mindstudy-caret" aria-hidden>
                          →
                        </span>
                      </div>
                      <div className="mindstudy-card-preview">
                        <div className="mindstudy-model-only">
                          <AggregateModel
                            modelPath={topic.modelPath}
                            scale={transform.scale}
                            position={[transform.pos.x, transform.pos.y, transform.pos.z]}
                          />
                        </div>
                      </div>
                    </button>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      </div>
      {showDuckPool && (
        <div
          className="mindstudy-droplet-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Compute water – duck pool"
        >
          <div className="mindstudy-droplet-header">
            <div>
              <span className="mindstudy-level-pill small">Mind like water</span>
              <small style={{ display: 'block', marginTop: 6, color: 'rgba(226,232,240,0.9)', fontSize: 12 }}>
                Click Play to hear the narration. Colored droplets appear when the narrator speaks.
              </small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="mindstudy-pool-narrative-play"
                onClick={playPoolNarrative}
                aria-label={narrativePlaying ? 'Stop narration' : 'Play narration'}
                aria-pressed={narrativePlaying}
              >
                {narrativePlaying ? (
                  <>
                    <span className="mindstudy-pool-narrative-icon" aria-hidden>⏹</span>
                    Stop
                  </>
                ) : (
                  <>
                    <span className="mindstudy-pool-narrative-icon" aria-hidden>▶</span>
                    Play
                  </>
                )}
              </button>
              <button
                type="button"
                className="mindstudy-modal-close"
                onClick={() => setShowDuckPool(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="mindstudy-droplet-canvas-wrap">
            <DuckPool
              style={{ width: '100%', height: '100%', minHeight: 320 }}
              allowUserDrops={false}
              onDropDropletReady={(fn) => { dropDropletRef.current = fn }}
            />
            {subtitleLine !== null && (
              <div className="mindstudy-pool-subtitle" role="status" aria-live="polite">
                <span lang="th">{subtitleLine}</span>
              </div>
            )}
          </div>
          <div className="mindstudy-droplet-actions">
            <button className="mindstudy-btn ghost" onClick={() => setShowDuckPool(false)}>
              Close
            </button>
            <button
              className="mindstudy-btn primary"
              onClick={() => {
                setShowDuckPool(false)
                navigate('/mind-study/cognitive')
              }}
            >
              Go to Cognitive →
            </button>
          </div>
        </div>
      )}
      {learnMoreConfirmOpen && (
        <div
          className="mindstudy-modal-backdrop"
          role="presentation"
          onClick={() => setLearnMoreConfirmOpen(false)}
        >
          <div
            className="mindstudy-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm watch"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mindstudy-modal-glow" aria-hidden />
            <div className="mindstudy-modal-header">
              <span className="mindstudy-level-pill small">Learn more</span>
              <button
                className="mindstudy-modal-close"
                onClick={() => setLearnMoreConfirmOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="mindstudy-modal-body">
              <h3>Do you want to watch this?</h3>
            </div>
            <div className="mindstudy-modal-actions">
              <button className="mindstudy-btn ghost" onClick={() => setLearnMoreConfirmOpen(false)}>
                Cancel
              </button>
              <button
                className="mindstudy-btn primary"
                onClick={() => {
                  setLearnMoreConfirmOpen(false)
                  setShowDuckPool(true)
                }}
              >
                Yes, watch
              </button>
            </div>
          </div>
        </div>
      )}
      {modalOpen && selectedMind && (
        <div className="mindstudy-modal-backdrop" role="presentation" onClick={() => setModalOpen(false)}>
          <div
            className="mindstudy-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Inspect ${selectedMind.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mindstudy-modal-glow" aria-hidden />
            <div className="mindstudy-modal-header">
              <span className="mindstudy-level-pill small">Inspect</span>
              <button className="mindstudy-modal-close" onClick={() => setModalOpen(false)} aria-label="Close dialog">
                ✕
              </button>
            </div>
            <div className="mindstudy-modal-body">
              <h3>{selectedMind.title}</h3>
              <p className="mindstudy-modal-sub">{selectedMind.modelLabel}</p>
              <p className="mindstudy-section-desc">{selectedMind.description}</p>
              <ul className="mindstudy-list modal-list">
                {selectedMind.highlights.slice(0, 3).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="mindstudy-modal-actions">
              <button className="mindstudy-btn ghost" onClick={() => setModalOpen(false)}>
                Maybe later
              </button>
              <button
                className="mindstudy-btn primary"
                onClick={() => {
                  setModalOpen(false)
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      {cetasikaModalOpen && selectedCetasika && (
        <div className="mindstudy-modal-backdrop" role="presentation" onClick={() => setCetasikaModalOpen(false)}>
          <div
            className="mindstudy-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Inspect ${selectedCetasika.pali}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mindstudy-modal-glow" aria-hidden />
            <div className="mindstudy-modal-header">
              <span className="mindstudy-level-pill small">Cetasika</span>
              <button className="mindstudy-modal-close" onClick={() => setCetasikaModalOpen(false)} aria-label="Close dialog">
                ✕
              </button>
            </div>
            <div className="mindstudy-modal-body">
              <h3>{selectedCetasika.pali} ({selectedCetasika.thai})</h3>
              <p className="mindstudy-modal-sub">{selectedCetasika.className}</p>
              <p className="mindstudy-section-desc">{selectedCetasika.description}</p>
              <ul className="mindstudy-list modal-list">
                {selectedCetasika.highlights.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
            <div className="mindstudy-modal-actions">
              <button className="mindstudy-btn ghost" onClick={() => setCetasikaModalOpen(false)}>
                Maybe later
              </button>
              <button
                className="mindstudy-btn primary"
                onClick={() => {
                  setCetasikaModalOpen(false)
                  setSelectedCetasika(null)
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

