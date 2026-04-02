import React, { useCallback, useEffect, useMemo, useState } from 'react'
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

import { CETASIKA_CATEGORIES, type CetasikaCard } from '../data/cetasikaGrid'
import { MentalSpherePreview } from '../components/MentalSpherePreview'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface StaticMental {
  id: number
  name: string
  pali: string
  thai: string
  slug: string
  category: string
  description: string
  highlights: string[]
}

interface StaticMentalGroup {
  id: number
  name: string
  name_thai: string
  name_en: string
  mental_ids: number[]
}

interface StaticMind {
  id: number
  name: string
  pali: string
  thai: string
  category: string
  subgroup: string
  description: string
  mental_ids: number[]
}

interface StaticMindGroup {
  id: number
  name: string
  name_thai: string
  name_en: string
  mind_ids: number[]
}

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
const DIAGRAM_COLORS = ['#b76c84', '#ef9b54', '#69ad4f', '#7eb7e8', '#9f88db', '#e9b45a']

const defaultAggregates: DhammaObject[] = [
  new DhammaObject({
    id: 'calm',
    title: 'Calm & Balanced',
    modelLabel: 'Soft Presence Model',
    modelPath: '',
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
    modelPath: '',
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
    modelPath: '',
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
    modelPath: '',
    description: 'A mind that includes others with warmth—soft eyes, generous assumptions, and care for shared wellbeing.',
    highlights: [
      'Turns threat responses down, easing social tension.',
      'Builds trust and cooperation in teams and relationships.',
      'Grows through small acts: wishing well, listening fully.',
    ],
  }),
]

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

  const [staticMentals, setStaticMentals] = useState<StaticMental[]>([])
  const [staticMentalGroups, setStaticMentalGroups] = useState<StaticMentalGroup[]>([])
  const [staticMinds, setStaticMinds] = useState<StaticMind[]>([])
  const [staticMindGroups, setStaticMindGroups] = useState<StaticMindGroup[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch(`${API_BASE}/api/static/mentals`).then((r) => r.json()),
      fetch(`${API_BASE}/api/static/mental-groups`).then((r) => r.json()),
      fetch(`${API_BASE}/api/static/minds`).then((r) => r.json()),
      fetch(`${API_BASE}/api/static/mind-groups`).then((r) => r.json()),
    ])
      .then(([mentalsRes, mentalGroupsRes, mindsRes, mindGroupsRes]) => {
        const fetchedMinds: StaticMind[] = mindsRes.minds ?? []
        fetchedMinds.forEach((mind) => {
          console.log('mind response:', mind)
          console.log('[MindStudy] mind detail:', {
            id: mind.id,
            name: mind.name,
            thai: mind.thai,
            pali: mind.pali,
            category: mind.category,
            subgroup: mind.subgroup,
            description: mind.description,
            mentalIds: mind.mental_ids,
            mentalCount: mind.mental_ids?.length ?? 0,
          })
        })
        console.log('[MindStudy] Static data loaded:', {
          mentals: mentalsRes.count,
          mentalGroups: mentalGroupsRes.count,
          minds: mindsRes.count,
          mindGroups: mindGroupsRes.count,
        })
        if (cancelled) return
        setStaticMentals(mentalsRes.mentals ?? [])
        setStaticMentalGroups(mentalGroupsRes.mental_groups ?? [])
        setStaticMinds(fetchedMinds)
        setStaticMindGroups(mindGroupsRes.mind_groups ?? [])
        setAggregates(
          fetchedMinds.map(
            (mind) =>
              new DhammaObject({
                id: `mind-${mind.id}`,
                title: mind.thai || mind.name,
                description: `${mind.name}${mind.pali ? ` (${mind.pali})` : ''} อยู่ในหมวด ${mind.category}`,
                highlights: [
                  `Pali: ${mind.pali || '-'}`,
                  `Category: ${mind.category || '-'}`,
                  `Associated mentals: ${mind.mental_ids?.length ?? 0}`,
                ],
                modelLabel: mind.category || 'Mind',
                modelPath: '',
              }),
          ),
        )
        setLoadError(null)
      })
      .catch((err) => {
        console.warn('[MindStudy] Failed to load static data:', err)
        if (!cancelled) {
          setAggregates(defaultAggregates)
          setLoadError('Unable to load data from /api/static/minds; showing fallback content.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

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

  const mindDiagramGroups = useMemo(() => {
    const aggregateById = new Map(aggregates.map((mind) => [String(mind.id), mind]))
    const staticMindById = new Map(staticMinds.map((mind) => [mind.id, mind]))

    const groupsFromApiRaw = staticMindGroups
      .map((group, index) => {
        const minds = group.mind_ids
          .map((mindId) => staticMindById.get(mindId))
          .filter((mind): mind is StaticMind => Boolean(mind))
          .map((mind) => aggregateById.get(`mind-${mind.id}`))
          .filter((mind): mind is DhammaObject => Boolean(mind))
        const isKamavacaraSobhanaGroup = /Kamavacara Sobhana|กามาวจรโสภณ/i.test(
          `${group.name} ${group.name_thai} ${group.name_en}`,
        )
        return {
          id: `mind-group-${group.id}`,
          title: isKamavacaraSobhanaGroup ? 'กามาวจรกุศลจิต' : (group.name_thai || group.name_en || group.name),
          subtitle: isKamavacaraSobhanaGroup ? 'Kāmāvacara Kusala (24)' : (group.name_en || group.name),
          color: DIAGRAM_COLORS[index % DIAGRAM_COLORS.length],
          minds,
        }
      })
      .filter((group) => group.minds.length > 0)

    const kamavacaraGroups = groupsFromApiRaw.filter((group) =>
      /กามาวจร|Kāmāvacara|Kamavacara/i.test(`${group.title} ${group.subtitle}`),
    )

    const groupsFromApi =
      kamavacaraGroups.length > 1
        ? (() => {
            const nonKamavacaraGroups = groupsFromApiRaw.filter(
              (group) => !/กามาวจร|Kāmāvacara|Kamavacara/i.test(`${group.title} ${group.subtitle}`),
            )
            const mergedKamavacaraGroup = {
              id: 'mind-group-kamavacara-merged',
              title: 'กามาวจรกุศลจิต',
              subtitle: 'Kāmāvacara Kusala (24)',
              color: '#9fbe4c',
              minds: kamavacaraGroups.flatMap((group) => group.minds),
            }
            const ahetukaIndex = nonKamavacaraGroups.findIndex((group) =>
              /อเหตุก|Ahetuka/i.test(`${group.title} ${group.subtitle}`),
            )
            if (ahetukaIndex >= 0) {
              return [
                ...nonKamavacaraGroups.slice(0, ahetukaIndex + 1),
                mergedKamavacaraGroup,
                ...nonKamavacaraGroups.slice(ahetukaIndex + 1),
              ]
            }
            return [...nonKamavacaraGroups, mergedKamavacaraGroup]
          })()
        : groupsFromApiRaw

    const groupsWithMahaggataSplit = groupsFromApi.flatMap((group) => {
      if (!/มหัคคต|Mahaggata/i.test(`${group.title} ${group.subtitle}`)) return [group]
      const rupaMinds = group.minds.filter((mind) => {
        const id = Number(String(mind.id).replace('mind-', ''))
        return id >= 55 && id <= 69
      })
      const arupaMinds = group.minds.filter((mind) => {
        const id = Number(String(mind.id).replace('mind-', ''))
        return id >= 70 && id <= 81
      })
      return [
        ...(rupaMinds.length
          ? [{
              id: `${group.id}-rupa`,
              title: 'รูปาวจรจิต',
              subtitle: 'Rupavacara (15)',
              color: '#e7af64',
              minds: rupaMinds,
            }]
          : []),
        ...(arupaMinds.length
          ? [{
              id: `${group.id}-arupa`,
              title: 'อรูปาวจรจิต',
              subtitle: 'Arupavacara (12)',
              color: '#95bfdc',
              minds: arupaMinds,
            }]
          : []),
      ]
    })

    if (groupsWithMahaggataSplit.length) return groupsWithMahaggataSplit

    const fallbackByCategory = new Map<string, DhammaObject[]>()
    staticMinds.forEach((mind) => {
      const aggregate = aggregateById.get(`mind-${mind.id}`)
      if (!aggregate) return
      const key = mind.category || 'Other'
      if (!fallbackByCategory.has(key)) fallbackByCategory.set(key, [])
      fallbackByCategory.get(key)?.push(aggregate)
    })

    if (fallbackByCategory.size) {
      return Array.from(fallbackByCategory.entries()).map(([key, minds], index) => ({
        id: `mind-category-${key}`,
        title: key,
        subtitle: 'Category',
        color: DIAGRAM_COLORS[index % DIAGRAM_COLORS.length],
        minds,
      }))
    }

    return [
      {
        id: 'mind-fallback',
        title: 'Mind Diagram',
        subtitle: 'Fallback',
        color: DIAGRAM_COLORS[0],
        minds: aggregates,
      },
    ]
  }, [aggregates, staticMinds, staticMindGroups])

  const staticMindByAggregateId = useMemo(
    () => new Map(staticMinds.map((mind) => [`mind-${mind.id}`, mind])),
    [staticMinds],
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

          <div className="mindstudy-diagram-surface" id="mind-diagram">
            <p className="mindstudy-grid-hint">
              Circular mind diagram from `/api/static/minds`.
              {loading ? ' Loading…' : ''}
              {!loading && loadError ? ` ${loadError}` : ''}
            </p>
            <div className="mindstudy-diagram">
              {mindDiagramGroups.map((group) => (
                <article key={group.id} className="mindstudy-diagram-group">
                  <div className="mindstudy-diagram-group-head">
                    <span
                      className="mindstudy-diagram-group-dot"
                      style={{ background: group.color }}
                      aria-hidden
                    />
                    <h3>{group.title}</h3>
                    <p>{group.subtitle}</p>
                  </div>
                  {(() => {
                    const title = `${group.title} ${group.subtitle}`
                    const isAkusala = /อกุศล|Akusala/i.test(title)
                    const isAhetuka = /อเหตุก|Ahetuka/i.test(title)
                    const isKamavacaraSobhana = /โสภณ|Sobhana|กามาวจร|Kāmāvacara|Kamavacara/i.test(title)
                    const isArupavacara = /อรูปาวจร|Arupavacara|Arūpāvacara/i.test(title)
                    const isRupavacara = !isArupavacara && /รูปาวจร|Rupavacara|Rūpāvacara/i.test(title)
                    const isLokuttara = /โลกุตตร|Lokuttara/i.test(title)

                    const subgroupDefs: Array<{
                      key: string
                      label: string
                      color: string
                      match: (mindTitle: string, mindId: string, subgroup?: string) => boolean
                    }> = isAkusala
                      ? [
                          { key: 'lobha', label: 'โลภมูลจิต ๘', color: '#b76c84', match: (mindTitle) => mindTitle.includes('โลภมูลจิต') },
                          { key: 'dosa', label: 'โทสมูลจิต ๒', color: '#ef9b54', match: (mindTitle) => mindTitle.includes('โทสมูลจิต') },
                          { key: 'moha', label: 'โมหมูลจิต ๒', color: '#d9b49c', match: (mindTitle) => mindTitle.includes('โมหมูลจิต') },
                        ]
                      : isAhetuka
                        ? [
                            {
                              key: 'ahetuka-akusala-vipaka',
                              label: 'อกุศลวิปากจิต ๗',
                              color: '#9fbe4c',
                              match: (mindTitle, mindId, subgroup) =>
                                subgroup === 'ahetuka_akusala_vipaka' ||
                                (Number(mindId.replace('mind-', '')) >= 13 && Number(mindId.replace('mind-', '')) <= 19) ||
                                mindTitle.includes('อกุศลวิบาก'),
                            },
                            {
                              key: 'ahetuka-kusala-vipaka',
                              label: 'อเหตุกกุศลวิปากจิต ๘',
                              color: '#a9c75a',
                              match: (mindTitle, mindId, subgroup) =>
                                subgroup === 'ahetuka_kusala_vipaka' ||
                                (Number(mindId.replace('mind-', '')) >= 20 && Number(mindId.replace('mind-', '')) <= 27) ||
                                (mindTitle.includes('กุศลวิบาก') && !mindTitle.includes('อกุศลวิบาก')),
                            },
                            {
                              key: 'ahetuka-kiriya',
                              label: 'อเหตุกกิริยาจิต ๓',
                              color: '#8eb8dc',
                              match: (mindTitle, mindId, subgroup) =>
                                subgroup === 'ahetuka_kiriya' ||
                                (Number(mindId.replace('mind-', '')) >= 28 && Number(mindId.replace('mind-', '')) <= 30) ||
                                mindTitle.includes('กิริยาจิต'),
                            },
                          ]
                        : isKamavacaraSobhana
                          ? [
                              {
                                key: 'maha-kusala',
                                label: 'มหากุศลจิต ๘',
                                color: '#ef9b54',
                                match: (_mindTitle, mindId, subgroup) =>
                                  subgroup === 'maha_kusala' ||
                                  (Number(mindId.replace('mind-', '')) >= 31 && Number(mindId.replace('mind-', '')) <= 38),
                              },
                              {
                                key: 'maha-vipaka',
                                label: 'มหาวิปากจิต ๘',
                                color: '#9fbe4c',
                                match: (_mindTitle, mindId, subgroup) =>
                                  subgroup === 'maha_vipaka' ||
                                  (Number(mindId.replace('mind-', '')) >= 39 && Number(mindId.replace('mind-', '')) <= 46),
                              },
                              {
                                key: 'maha-kiriya',
                                label: 'มหากิริยาจิต ๘',
                                color: '#8eb8dc',
                                match: (_mindTitle, mindId, subgroup) =>
                                  subgroup === 'maha_kiriya' ||
                                  (Number(mindId.replace('mind-', '')) >= 47 && Number(mindId.replace('mind-', '')) <= 54),
                              },
                            ]
                          : isRupavacara
                            ? [
                                {
                                  key: 'rupa-kusala',
                                  label: 'รูปาวจรกุศลจิต ๕',
                                  color: '#f0b563',
                                  match: (_t, id, subgroup) =>
                                    subgroup === 'rupavacara_kusala' ||
                                    (Number(id.replace('mind-', '')) >= 55 && Number(id.replace('mind-', '')) <= 59),
                                },
                                {
                                  key: 'rupa-vipaka',
                                  label: 'รูปาวจรวิปากจิต ๕',
                                  color: '#a7c95d',
                                  match: (_t, id, subgroup) =>
                                    subgroup === 'rupavacara_vipaka' ||
                                    (Number(id.replace('mind-', '')) >= 60 && Number(id.replace('mind-', '')) <= 64),
                                },
                                {
                                  key: 'rupa-kiriya',
                                  label: 'รูปาวจรกิริยาจิต ๕',
                                  color: '#8eb8dc',
                                  match: (_t, id, subgroup) =>
                                    subgroup === 'rupavacara_kiriya' ||
                                    (Number(id.replace('mind-', '')) >= 65 && Number(id.replace('mind-', '')) <= 69),
                                },
                              ]
                            : isArupavacara
                              ? [
                                {
                                  key: 'arupa-kusala',
                                  label: 'อรูปาวจรกุศลจิต ๔',
                                  color: '#e39a73',
                                  match: (_t, id, subgroup) =>
                                    subgroup === 'arupavacara_kusala' ||
                                    (Number(id.replace('mind-', '')) >= 70 && Number(id.replace('mind-', '')) <= 73),
                                },
                                {
                                  key: 'arupa-vipaka',
                                  label: 'อรูปาวจรวิปากจิต ๔',
                                  color: '#b4cd75',
                                  match: (_t, id, subgroup) =>
                                    subgroup === 'arupavacara_vipaka' ||
                                    (Number(id.replace('mind-', '')) >= 74 && Number(id.replace('mind-', '')) <= 77),
                                },
                                {
                                  key: 'arupa-kiriya',
                                  label: 'อรูปาวจรกิริยาจิต ๔',
                                  color: '#95bfdc',
                                  match: (_t, id, subgroup) =>
                                    subgroup === 'arupavacara_kiriya' ||
                                    (Number(id.replace('mind-', '')) >= 78 && Number(id.replace('mind-', '')) <= 81),
                                },
                              ]
                            : isLokuttara
                              ? [
                                  {
                                    key: 'lokuttara-magga',
                                    label: 'มรรคจิต ๔',
                                    color: '#e89d74',
                                    match: (_t, id, subgroup) =>
                                      subgroup === 'magga' ||
                                      (Number(id.replace('mind-', '')) >= 82 && Number(id.replace('mind-', '')) <= 85),
                                  },
                                  {
                                    key: 'lokuttara-phala',
                                    label: 'ผลจิต ๔',
                                    color: '#8fbbe0',
                                    match: (_t, id, subgroup) =>
                                      subgroup === 'phala' ||
                                      (Number(id.replace('mind-', '')) >= 86 && Number(id.replace('mind-', '')) <= 89),
                                  },
                                ]
                              : []

                    if (!subgroupDefs.length) {
                      return (
                        <div className="mindstudy-diagram-circles">
                          {group.minds.map((topic, index) => {
                            const idMatch = String(topic.id).match(/mind-(\d+)/)
                            const nodeLabel = idMatch ? idMatch[1] : `${index + 1}`
                            return (
                              <button
                                key={topic.id}
                                id={String(topic.id)}
                                type="button"
                                className="mindstudy-diagram-node"
                                style={{
                                  background: `${group.color}22`,
                                  borderColor: group.color,
                                  color: '#1f2937',
                                }}
                                onClick={() => {
                                  setSelectedMind(topic)
                                  setModalOpen(true)
                                }}
                                aria-label={topic.title}
                              >
                                <span className="mindstudy-diagram-node-index">{nodeLabel}</span>
                                <span className="mindstudy-diagram-node-title">{topic.title}</span>
                              </button>
                            )
                          })}
                        </div>
                      )
                    }

                    return (
                      <div className="mindstudy-diagram-subgroups">
                        {subgroupDefs.map((subgroup) => {
                          const subgroupMinds = group.minds.filter((mind) => {
                            const staticMind = staticMindByAggregateId.get(String(mind.id))
                            return subgroup.match(mind.title, String(mind.id), staticMind?.subgroup)
                          })
                          if (!subgroupMinds.length) return null
                          return (
                            <div key={subgroup.key} className="mindstudy-diagram-subgroup-row">
                              <div className="mindstudy-diagram-circles compact">
                                {subgroupMinds.map((topic, index) => {
                                  const idMatch = String(topic.id).match(/mind-(\d+)/)
                                  const nodeLabel = idMatch ? idMatch[1] : `${index + 1}`
                                  return (
                                    <button
                                      key={topic.id}
                                      id={String(topic.id)}
                                      type="button"
                                      className="mindstudy-diagram-node compact"
                                      style={{
                                        background: `${subgroup.color}33`,
                                        borderColor: subgroup.color,
                                        color: '#1f2937',
                                      }}
                                      onClick={() => {
                                        setSelectedMind(topic)
                                        setModalOpen(true)
                                      }}
                                      aria-label={topic.title}
                                    >
                                      <span className="mindstudy-diagram-node-index">{nodeLabel}</span>
                                    </button>
                                  )
                                })}
                              </div>
                              <div className="mindstudy-diagram-subgroup-label-wrap">
                                <span className="mindstudy-diagram-subgroup-brace" style={{ color: subgroup.color }} aria-hidden>
                                  {'}'}
                                </span>
                                <span className="mindstudy-diagram-subgroup-label" style={{ color: subgroup.color }}>
                                  {subgroup.label}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </article>
              ))}
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

