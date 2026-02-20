import React, { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { useNavigate } from 'react-router-dom'
import { DhammaObject } from '../mindwebsite/classes/DhammaObject'
import violinModel from '../assets/violin.glb?url'
import heartModel from '../assets/crystal_heart.glb?url'
import paperPlaneModel from '../assets/paper_plane.glb?url'
import paperPlaneAssetModel from '../assets/paper_plane_asset.glb?url'
import brainModel from '../assets/brain_3d.glb?url'
import ghostModel from '../assets/ghost_of_tsushiito.glb?url'
import { loadMentalTableRows } from '../utils/mentalTable'

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
  const [loading, setLoading] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<string | null>(null)

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
                  navigate(`/mind-study/${selectedMind.id}`)
                }}
              >
                Inspect this mind →
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

