import React, { useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { DhammaObject } from '../mindwebsite/classes/DhammaObject'
import violinModel from '../assets/violin.glb?url'
import heartModel from '../assets/crystal_heart.glb?url'
import paperPlaneModel from '../assets/paper_plane.glb?url'
import paperPlaneAssetModel from '../assets/paper_plane_asset.glb?url'
import brainModel from '../assets/brain_3d.glb?url'
import ghostModel from '../assets/ghost_of_tsushiito.glb?url'

type Topic = {
  id: string
  title: string
  description: string
  highlights: string[]
}

const mainTopic: Topic = {
  id: 'five-aggregates',
  title: 'The Five Aggregates (Skandhas)',
  description:
    'A classical Buddhist framework describing what we call a “person.” Seeing how each aggregate works (and changes) helps loosen rigid views of self.',
  highlights: [
    'They arise together to create experience; none alone is a “self.”',
    'Each aggregate is conditioned: shaped by causes, changing moment to moment.',
    'Studying them clarifies how contact, feeling, and perception feed our reactions.',
  ],
}

const aggregates: DhammaObject[] = [
  new DhammaObject({
    id: 'rupa',
    title: 'Rūpa',
    modelLabel: 'Physical Form Model',
    modelPath: '/assets/humanMind/human.gltf',
    description: 'ส่วนที่เป็นรูปธรรมว่า ด้วยเรื่องของร่างกาย และอวัยวะทั้งหมดของมนุษย์ ไม่ว่าจะเป็นเนื้อ ไขมัน เส้นประสาท หัวใจ แขน ขา หรือแม้แต่สมอง',
    highlights: [
      'Covers both the body and external material objects.',
      'Impermament and dependent on causes (nutrition, temperature, etc.).',
      'Gives the stage on which sensations appear.',
    ],
  }),
  new DhammaObject({
    id: 'vedana',
    title: 'Vedanā',
    modelLabel: 'Feeling Tone Model',
    modelPath: heartModel,
    description: 'เวทนาขันธ์ส่วนที่เป็นนามธรรม หมายถึง ความรู้สึกที่เกิดขึ้น มีทั้งหมด 3 รูปแบบ คือ สุขเวทนา รู้สึกสุขสบาย, ทุกขเวทนา รู้สึกทุกข์ และอทุกขมสุขเวทนา รู้สึกไม่สุขไม่ทุกข์',
    highlights: [
      'Acts as the “color” of experience before stories start.',
      'Drives craving or aversion if not noticed clearly.',
      'Not the same as emotion; it is simpler and more immediate.',
    ],
  }),
  new DhammaObject({
    id: 'samjna',
    title: 'Saṃjñā',
    modelLabel: 'Perceptual Label Model',
    modelPath: brainModel,
    description: 'ส่วนที่เป็นนามธรรม คือ ความจำได้หมายรู้ในสิ่งที่ได้พบเจอ ไม่ว่าจะเป็นรู้รส รู้รูป รู้เสียง รู้ใจหรืออารมณ์ที่เกิดขึ้น เช่น รู้ว่าน้ำสีขาว ไม่มีรสชาติ คือ น้ำเปล่า รู้ว่าเมื่อแดดออกอากาศจะร้อน',
    highlights: [
      'Creates categories and names; fast and automatic.',
      'Can mislabel, leading to bias or misperception.',
      'Essential for learning but can also freeze fluid experience.',
    ],
  }),
  new DhammaObject({
    id: 'samskara',
    title: 'Saṃskāra',
    modelLabel: 'Habit & Intention Model',
    modelPath: paperPlaneModel,
    description: 'สวัสดีครับ วันนี้ผมมีเรื่องจะมาเล่าให้ท่านฟังครับ',
    highlights: [
      'Conditioned by past actions; they also set future conditioning.',
      'Include wholesome, unwholesome, and neutral tendencies.',
      'Watching formations reveals where freedom of response is possible.',
    ],
  }),
  new DhammaObject({
    id: 'vijnana',
    title: 'Vijñāna',
    modelLabel: 'Sense Consciousness Model',
    modelPath: ghostModel,
    description: 'The knowing aspect that lights up an object (seeing, hearing, tasting, etc.).',
    highlights: [
      'Six sense consciousnesses: eye, ear, nose, tongue, body, mind.',
      'Momentary; arises with its object and fades.',
      'Not a fixed observer—just the event of knowing.',
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
  const [navOpen, setNavOpen] = useState<boolean>(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [modelTransforms, setModelTransforms] = useState<
    Record<string, { scale: number; pos: { x: number; y: number; z: number } }>
  >(() =>
    Object.fromEntries(
      aggregates.map((agg) => [
        agg.id,
        {
          scale:
            agg.id === 'samjna'
              ? 2.6
              : agg.id === 'vedana'
                ? 2
                : agg.id === 'samskara'
                  ? 1
                : agg.id === 'vijnana'
                  ? 1
                  : 14,
          pos:
            agg.id === 'samjna'
              ? { x: 0, y: -0.5, z: 0 }
              : agg.id === 'vedana'
                ? { x: 0, y: -1.5, z: 0 }
                : agg.id === 'samskara'
                  ? { x: 0, y: 0, z: 0 }
                : agg.id === 'vijnana'
                  ? { x: 0, y: 0, z: 0.25 }
                  : { x: 0, y: 0, z: 0 },
        },
      ]),
    ),
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
                  onClick={() =>
                    setExpandedIds((prev) => {
                      const next = new Set(prev)
                      next.add(topic.id)
                      return next
                    })
                  }
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

          <div className="mindstudy-grid">
            {aggregates.map((topic) => {
              const isOpen = expandedIds.has(topic.id)
              const transform = modelTransforms[topic.id] ?? { scale: 14, pos: { x: 0, y: 0, z: 0 } }
              return (
                <article key={topic.id} className={`mindstudy-card ${isOpen ? 'open' : ''}`} id={topic.id}>
                  <button
                    type="button"
                    className="mindstudy-card-trigger"
                    onClick={() =>
                      setExpandedIds((prev) => {
                        const next = new Set(prev)
                        if (next.has(topic.id)) {
                          next.delete(topic.id)
                        } else {
                          next.add(topic.id)
                        }
                        return next
                      })
                    }
                    aria-expanded={isOpen}
                    aria-controls={`${topic.id}-body`}
                    aria-label={topic.title}
                  >
                    <div className="mindstudy-card-top">
                      <h3 className="mindstudy-card-title">{topic.title}</h3>
                      <span className={`mindstudy-caret ${isOpen ? 'open' : ''}`} aria-hidden>
                        ▼
                      </span>
                    </div>
                    <div className="mindstudy-model-only">
                      <AggregateModel
                        modelPath={topic.modelPath}
                        scale={transform.scale}
                        position={[transform.pos.x, transform.pos.y, transform.pos.z]}
                      />
                    </div>
                  </button>
                  <div id={`${topic.id}-body`} className={`mindstudy-card-body ${isOpen ? 'open' : ''}`}>
                    {isOpen && (
                      <>
                        <div className="mindstudy-card-header">
                          <span className="mindstudy-badge light">Aggregate</span>
                          <h3>{topic.title}</h3>
                          <p className="mindstudy-model">Model: {topic.modelLabel}</p>
                          <div className="mindstudy-card-actions">
                            <button
                              type="button"
                              className="mindstudy-speak"
                              onClick={() => topic.speakDescription()}
                              aria-label={`Speak ${topic.title} description in Thai`}
                            >
                              🔊 Thai
                            </button>
                          </div>
                          <p className="mindstudy-section-desc">{topic.description}</p>
                        </div>
                        <ul className="mindstudy-list">
                          {topic.highlights.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                        <div className="mindstudy-controls">
                          <h4>Model Controls</h4>
                          <div className="mindstudy-control-row">
                            <label>
                              Scale
                              <input
                                type="range"
                                min="1"
                                max="40"
                                step="1"
                                value={transform.scale}
                                onChange={(e) =>
                                  setModelTransforms((prev) => ({
                                    ...prev,
                                    [topic.id]: { ...transform, scale: Number(e.target.value) },
                                  }))
                                }
                              />
                              <input
                                type="number"
                                min="1"
                                max="40"
                                step="1"
                                value={transform.scale}
                                onChange={(e) =>
                                  setModelTransforms((prev) => ({
                                    ...prev,
                                    [topic.id]: { ...transform, scale: Number(e.target.value) },
                                  }))
                                }
                                style={{ width: '4rem', marginLeft: '0.5rem' }}
                              />
                            </label>
                          </div>
                          <div className="mindstudy-control-row">
                            <label>
                              Position X
                              <input
                                type="number"
                                step="0.5"
                                value={transform.pos.x}
                                onChange={(e) =>
                                  setModelTransforms((prev) => ({
                                    ...prev,
                                    [topic.id]: {
                                      ...transform,
                                      pos: { ...transform.pos, x: Number(e.target.value) },
                                    },
                                  }))
                                }
                                style={{ width: '4rem', marginLeft: '0.5rem' }}
                              />
                            </label>
                            <label style={{ marginLeft: '1rem' }}>
                              Y
                              <input
                                type="number"
                                step="0.5"
                                value={transform.pos.y}
                                onChange={(e) =>
                                  setModelTransforms((prev) => ({
                                    ...prev,
                                    [topic.id]: {
                                      ...transform,
                                      pos: { ...transform.pos, y: Number(e.target.value) },
                                    },
                                  }))
                                }
                                style={{ width: '4rem', marginLeft: '0.5rem' }}
                              />
                            </label>
                            <label style={{ marginLeft: '1rem' }}>
                              Z
                              <input
                                type="number"
                                step="0.5"
                                value={transform.pos.z}
                                onChange={(e) =>
                                  setModelTransforms((prev) => ({
                                    ...prev,
                                    [topic.id]: {
                                      ...transform,
                                      pos: { ...transform.pos, z: Number(e.target.value) },
                                    },
                                  }))
                                }
                                style={{ width: '4rem', marginLeft: '0.5rem' }}
                              />
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}

