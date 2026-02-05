import React, { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { DhammaObject } from '../mindwebsite/classes/DhammaObject'
import violinModel from '../assets/violin.glb?url'

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
    title: 'Rūpa — Form',
    modelLabel: 'Physical Form Model',
    description: 'ส่วนที่เป็นรูปธรรม ว่าด้วยเรื่องของร่างกายและอวัยวะทั้งหมดของมนุษย์ ไม่ว่าจะเป็นเนื้อ ไขมัน เส้นประสาท หัวใจ แขน ขา หรือแม้แต่สมอง',
    highlights: [
      'Covers both the body and external material objects.',
      'Impermament and dependent on causes (nutrition, temperature, etc.).',
      'Gives the stage on which sensations appear.',
    ],
  }),
  new DhammaObject({
    id: 'vedana',
    title: 'Vedanā — Feeling (Sensation)',
    modelLabel: 'Feeling Tone Model',
    description: 'เวทนาขันธ์ส่วนที่เป็นนามธรรม หมายถึง ความรู้สึกที่เกิดขึ้น มีทั้งหมด 3 รูปแบบ คือ สุขเวทนา รู้สึกสุขสบาย, ทุกขเวทนา รู้สึกทุกข์ และอทุกขมสุขเวทนา รู้สึกไม่สุขไม่ทุกข์',
    highlights: [
      'Acts as the “color” of experience before stories start.',
      'Drives craving or aversion if not noticed clearly.',
      'Not the same as emotion; it is simpler and more immediate.',
    ],
  }),
  new DhammaObject({
    id: 'samjna',
    title: 'Saṃjñā — Perception',
    modelLabel: 'Perceptual Label Model',
    description: 'ส่วนที่เป็นนามธรรม คือ ความจำได้หมายรู้ในสิ่งที่ได้พบเจอ ไม่ว่าจะเป็นรู้รส รู้รูป รู้เสียง รู้ใจหรืออารมณ์ที่เกิดขึ้น เช่น รู้ว่าน้ำสีขาว ไม่มีรสชาติ คือ น้ำเปล่า รู้ว่าเมื่อแดดออกอากาศจะร้อน',
    highlights: [
      'Creates categories and names; fast and automatic.',
      'Can mislabel, leading to bias or misperception.',
      'Essential for learning but can also freeze fluid experience.',
    ],
  }),
  new DhammaObject({
    id: 'samskara',
    title: 'Saṃskāra — Mental Formations',
    modelLabel: 'Habit & Intention Model',
    description: 'Intentions, habits, emotions, impulses, and the forces that incline us to act.',
    highlights: [
      'Conditioned by past actions; they also set future conditioning.',
      'Include wholesome, unwholesome, and neutral tendencies.',
      'Watching formations reveals where freedom of response is possible.',
    ],
  }),
  new DhammaObject({
    id: 'vijnana',
    title: 'Vijñāna — Consciousness',
    modelLabel: 'Sense Consciousness Model',
    description: 'The knowing aspect that lights up an object (seeing, hearing, tasting, etc.).',
    highlights: [
      'Six sense consciousnesses: eye, ear, nose, tongue, body, mind.',
      'Momentary; arises with its object and fades.',
      'Not a fixed observer—just the event of knowing.',
    ],
  }),
]

function ViolinAggregateModel(): React.ReactElement {
  const { scene } = useGLTF(violinModel)
  const clonedScene = useMemo(() => scene.clone(), [scene])

  return (
    <Canvas
      className="mindstudy-model-canvas"
      style={{ width: '100%', height: 320 }}
      camera={{ position: [0, 20, 6], fov: 30 }}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 4]} intensity={1.25} />
      <primitive object={clonedScene} position={[-2, -1, 1]} scale={14} />
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  )
}

useGLTF.preload(violinModel)

export function MindStudy(): React.ReactElement {
  const [navOpen, setNavOpen] = useState<boolean>(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

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
                    <div className="mindstudy-model-only">
                      <ViolinAggregateModel />
                    </div>
                    <span className={`mindstudy-caret ${isOpen ? 'open' : ''}`} aria-hidden>
                      ▼
                    </span>
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

