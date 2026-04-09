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

import { type CetasikaCard } from '../data/cetasikaGrid'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8004'

interface StaticMental {
  id: number
  name: string
  pali: string
  thai: string
  slug: string
  category: string
  description: string
  characteristic: string
  function: string
  manifestation: string
  proximate_cause: string
}

interface StaticMentalGroup {
  id: number
  name: string
  name_thai: string
  name_en: string
  description: string
  mental_ids: number[]
}

interface StaticMind {
  id: number
  name: string
  name_en: string
  pali: string
  thai: string
  category: string
  subgroup: string
  description: string
  description_thai: string
  mental_ids: number[]
}

interface StaticMindGroup {
  id: number
  name: string
  name_thai: string
  name_en: string
  description: string
  mind_ids: number[]
}

interface StaticRupa {
  id: number
  name: string
  name_en: string
  pali: string
  description: string
  group: string
  subgroup: string
}

type Topic = {
  id: string
  title: string
  description: string
  highlights: string[]
}

const mainTopic: Topic = {
  id: 'abhidhamma-overview',
  title: 'Abhidhamma Piṭaka — overview',
  description:
    'The Abhidhamma Piṭaka (อภิธรรมปิฎก) is the third “basket” of the Pali Tipiṭaka. Where the Suttas often teach in narrative and practical terms, the Abhidhamma presents the same Dhamma in a systematic way: precise classifications of dhammas (phenomena), how consciousness (citta) arises together with mental factors (cetasikas), and how materiality (rūpa) is described. It is a map of experience in terms of conditionality, not a replacement for ethical practice or calm.',
  highlights: [
    'Tipiṭaka in brief: Sutta Piṭaka (discourses), Vinaya Piṭaka (discipline), and Abhidhamma Piṭaka (analytical exposition).',
    'Classically, seven Abhidhamma books are named (e.g. Dhammasaṅgaṇī, Vibhaṅga, Kathāvatthu, Puggalapaññatti, Dhātukathā, Yamaka, Paṭṭhāna), with Paṭṭhāna in particular treating relations of condition in depth.',
    'The mental, mind, and rūpa sections below mirror this tradition: use them to connect lists and diagrams to how the texts unpack each moment of experience.',
  ],
}

const GOOD_MENTAL_ACCENT = '#22c55e'
const BAD_MENTAL_ACCENT = '#ef4444'
const GOOD_MENTAL_TEXT = '#14532d'
const BAD_MENTAL_TEXT = '#7f1d1d'
const NEUTRAL_MENTAL_TEXT = '#1f2937'
const DIAGRAM_COLORS = ['#b76c84', '#ef9b54', '#69ad4f', '#7eb7e8', '#9f88db', '#e9b45a']

/** Cetasika chart palette (green / orange / yellow / deep-orange + red highlights) */
const MENTAL_CHART = {
  neutralGreen: '#4CAF50',
  akusalaOrange: '#FF9800',
  sobhanaYellow: '#FFEB3B',
  viratiDeepOrange: '#FF5722',
  highlightRed: '#F44336',
} as const

const RUPA_GROUP_META: Record<string, { titleEn: string; titleTh: string; color: string }> = {
  nipphanna: { titleEn: 'Concrete Materiality (18)', titleTh: 'นิปผันนรูป 18', color: '#7eb7e8' },
  anipphanna: { titleEn: 'Non-concrete Materiality (10)', titleTh: 'อนิปผันนรูป 10', color: '#9f88db' },
}

const RUPA_SUBGROUP_META: Record<string, { titleEn: string; titleTh: string; color: string }> = {
  mahabhuta: { titleEn: 'Great Elements (4)', titleTh: 'มหาภูตรูป 4', color: '#7eb7e8' },
  pasada: { titleEn: 'Sensitivity (5)', titleTh: 'ปสาทรูป 5', color: '#69ad4f' },
  visaya: { titleEn: 'Sense-field (4)', titleTh: 'วิสัยรูป 4', color: '#ef9b54' },
  bhava: { titleEn: 'Sex / Gender (2)', titleTh: 'ภาวรูป 2', color: '#b76c84' },
  hadaya: { titleEn: 'Heart-base (1)', titleTh: 'หทยรูป 1', color: '#e9b45a' },
  jivita: { titleEn: 'Life Faculty (1)', titleTh: 'ชีวิตินทรีย์รูป 1', color: '#8eb8dc' },
  ahara: { titleEn: 'Nutriment (1)', titleTh: 'อาหารรูป 1', color: '#a7c95d' },
  pariccheda: { titleEn: 'Space Element (1)', titleTh: 'ปริจเฉทรูป 1', color: '#d9b49c' },
  vinatti: { titleEn: 'Intimation (2)', titleTh: 'วิญญัติรูป 2', color: '#e39a73' },
  vikara: { titleEn: 'Mutability (3)', titleTh: 'วิการรูป 3', color: '#95bfdc' },
  lakkhana: { titleEn: 'Characteristics (4)', titleTh: 'ลักขณรูป 4', color: '#9fbe4c' },
}

const RUPA_SUBGROUP_ORDER = [
  'mahabhuta',
  'pasada',
  'visaya',
  'bhava',
  'hadaya',
  'jivita',
  'ahara',
  'pariccheda',
  'vinatti',
  'vikara',
  'lakkhana',
]

function mentalSphereRingClass(mentalId: number): string {
  if (mentalId === 52) return 'mental-ring-thick'
  if ([13, 27, 47, 48, 49].includes(mentalId)) return 'mental-ring'
  return ''
}

/** Thai digits ๐–๙ for subgroup counts (same style as citta subgroup labels). */
const THAI_DIGITS = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'] as const

function toThaiDigitString(n: number): string {
  return String(Math.max(0, Math.floor(n)))
    .split('')
    .map((d) => THAI_DIGITS[Number(d)] ?? d)
    .join('')
}

function stripTrailingCountLabel(text: string): string {
  return text
    .replace(/\s*[\(\[]?\s*[0-9๐-๙]+\s*[\)\]]?\s*$/u, '')
    .trim()
}

/** True if string contains Thai script (for EN-primary labels: show Thai in parentheses). */
function containsThaiScript(s: string): boolean {
  return /[\u0E00-\u0E7F]/.test(s)
}

function englishLabelAlreadyStatesItemCount(titleEn: string, itemCount: number): boolean {
  const want = String(itemCount)
  const re = new RegExp(`(?:\\(\\s*${want}\\s*\\)|[—-]\\s*${want}(?!\\d)|\\b${want}\\b)`, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(titleEn)) !== null) {
    if (m[0]) return true
  }
  return false
}

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
  const [selectedRupa, setSelectedRupa] = useState<StaticRupa | null>(null)
  const [rupaModalOpen, setRupaModalOpen] = useState<boolean>(false)
  const [mindNavOpen, setMindNavOpen] = useState(true)
  /** Diagram section ids in this set are collapsed (default: all expanded). */
  const [collapsedStudyGroups, setCollapsedStudyGroups] = useState<Set<string>>(() => new Set())
  const [narrativePlaying, setNarrativePlaying] = useState<boolean>(false)
  const [subtitleLine, setSubtitleLine] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const dropDropletRef = React.useRef<DropDropletFn | null>(null)

  const [staticMentals, setStaticMentals] = useState<StaticMental[]>([])
  const [staticMentalGroups, setStaticMentalGroups] = useState<StaticMentalGroup[]>([])
  const [staticMinds, setStaticMinds] = useState<StaticMind[]>([])
  const [staticMindGroups, setStaticMindGroups] = useState<StaticMindGroup[]>([])
  const [staticRupas, setStaticRupas] = useState<StaticRupa[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const loadRupas = async (): Promise<{ rupas: StaticRupa[] }> => {
      try {
        const base = await fetch(`${API_BASE}/api/static/rupas`).then((r) => r.json())
        let rupas: StaticRupa[] = base.rupas ?? []
        if (rupas.length === 0) {
          const [nRes, aRes] = await Promise.all([
            fetch(`${API_BASE}/api/static/rupas?group=nipphanna`).then((r) => r.json()),
            fetch(`${API_BASE}/api/static/rupas?group=anipphanna`).then((r) => r.json()),
          ])
          const merged = [...(nRes.rupas ?? []), ...(aRes.rupas ?? [])] as StaticRupa[]
          const byId = new Map<number, StaticRupa>()
          merged.forEach((rupa) => byId.set(rupa.id, rupa))
          rupas = Array.from(byId.values()).sort((a, b) => a.id - b.id)
        }
        return { rupas }
      } catch {
        return { rupas: [] }
      }
    }

    Promise.all([
      fetch(`${API_BASE}/api/static/mentals`).then((r) => r.json()),
      fetch(`${API_BASE}/api/static/mental-groups`).then((r) => r.json()),
      fetch(`${API_BASE}/api/static/minds`).then((r) => r.json()),
      fetch(`${API_BASE}/api/static/mind-groups`).then((r) => r.json()),
      loadRupas(),
    ])
      .then(([mentalsRes, mentalGroupsRes, mindsRes, mindGroupsRes, rupasRes]) => {
        for (const r of rupasRes.rupas ?? []) console.log('Rupa:', JSON.stringify(r))
        const fetchedMentals: StaticMental[] = mentalsRes.mentals ?? []
        const fetchedMinds: StaticMind[] = mindsRes.minds ?? []
        const fetchedRupas: StaticRupa[] = rupasRes.rupas ?? []
        if (cancelled) return
        setStaticMentals(fetchedMentals)
        setStaticMentalGroups(mentalGroupsRes.mental_groups ?? [])
        setStaticMinds(fetchedMinds)
        setStaticMindGroups(mindGroupsRes.mind_groups ?? [])
        setStaticRupas(fetchedRupas)
        setAggregates(
          fetchedMinds.map(
            (mind) =>
              new DhammaObject({
                id: `mind-${mind.id}`,
                title: mind.name_en || mind.name || mind.thai,
                description:
                  mind.description?.trim() ||
                  `${mind.name}${mind.pali ? ` (${mind.pali})` : ''} อยู่ในหมวด ${mind.category}`,
                highlights: [
                  `Thai: ${mind.thai || '-'}`,
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
          setLoadError('Unable to load study data; showing fallback content.')
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

  const rupaCategoryBlocks = useMemo(() => {
    const rowsByGroup = new Map<string, Array<{
      id: string
      subgroup: string
      titleEn: string
      titleTh: string
      color: string
      items: StaticRupa[]
    }>>()

    const bucket = new Map<string, StaticRupa[]>()
    staticRupas.forEach((rupa) => {
      const key = `${rupa.group}:${rupa.subgroup}`
      if (!bucket.has(key)) bucket.set(key, [])
      bucket.get(key)?.push(rupa)
    })

    for (const [key, items] of bucket.entries()) {
      const [group, subgroup] = key.split(':')
      const subgroupMeta = RUPA_SUBGROUP_META[subgroup] ?? {
        titleEn: subgroup,
        titleTh: subgroup,
        color: DIAGRAM_COLORS[0],
      }
      const row = {
        id: `rupa-row-${group}-${subgroup}`,
        subgroup,
        titleEn: subgroupMeta.titleEn,
        titleTh: subgroupMeta.titleTh,
        color: subgroupMeta.color,
        items: [...items].sort((a, b) => a.id - b.id),
      }
      if (!rowsByGroup.has(group)) rowsByGroup.set(group, [])
      rowsByGroup.get(group)?.push(row)
    }

    return Array.from(rowsByGroup.entries())
      .map(([group, rows]) => {
        const groupMeta = RUPA_GROUP_META[group] ?? {
          titleEn: group,
          titleTh: group,
          color: DIAGRAM_COLORS[1],
        }
        const sortedRows = rows.sort(
          (a, b) => RUPA_SUBGROUP_ORDER.indexOf(a.subgroup) - RUPA_SUBGROUP_ORDER.indexOf(b.subgroup),
        )
        return {
          id: `rupa-group-${group}`,
          titleEn: groupMeta.titleEn,
          titleTh: groupMeta.titleTh,
          color: groupMeta.color,
          rows: sortedRows,
        }
      })
      .sort((a, b) => (a.id.includes('nipphanna') ? -1 : 1) - (b.id.includes('nipphanna') ? -1 : 1))
  }, [staticRupas])

  const staticMentalById = useMemo(
    () => new Map(staticMentals.map((mental) => [mental.id, mental])),
    [staticMentals],
  )

  const openCetasikaFromStaticMental = useCallback(
    (mental: StaticMental, options?: { closeMindModal?: boolean }) => {
      setSelectedCetasika({
        id: `mental-${mental.id}`,
        pali: mental.pali,
        thai: mental.thai,
        className: mental.name,
        nameEn: mental.name,
        description: mental.description,
        highlights: [],
        characteristic: mental.characteristic,
        abhidhammaFunction: mental.function,
        manifestation: mental.manifestation,
        proximateCause: mental.proximate_cause,
      })
      if (options?.closeMindModal) setModalOpen(false)
      setCetasikaModalOpen(true)
    },
    [],
  )

  const openRupaDetail = useCallback((rupa: StaticRupa) => {
    setSelectedRupa(rupa)
    setRupaModalOpen(true)
  }, [])

  const mentalCategoryBlocks = useMemo(() => {
    const mentalById = new Map(staticMentals.map((mental) => [mental.id, mental]))
    const rows = staticMentalGroups
      .map((group) => ({
        id: group.id,
        title: group.name_thai || group.name,
        titleEn: group.name_en || group.name,
        items: group.mental_ids
          .map((mentalId) => mentalById.get(mentalId))
          .filter((mental): mental is StaticMental => Boolean(mental)),
      }))
      .filter((row) => row.items.length > 0)

    const neutralRowColors = ['#97a6ba', '#b6c2d4']
    const badRowColors = ['#be738d', '#ef9b54', '#d6b390', '#d9c29f', '#d7c8b7']
    const goodRowColors = ['#9fbe4c', '#5fbf93', '#7db2e3', '#7f96e7']

    const mapRows = (
      wantedIds: number[],
      rowColors: string[],
      anchorMap: Record<number, string>,
    ) =>
      wantedIds
        .map((id, index) => {
          const row = rows.find((candidate) => candidate.id === id)
          if (!row) return null
          return {
            ...row,
            anchorId: anchorMap[id] ?? `mental-row-${id}`,
            color: rowColors[index % rowColors.length],
          }
        })
        .filter((row): row is { id: number; title: string; titleEn: string; items: StaticMental[]; anchorId: string; color: string } => Boolean(row))

    const neutralRows = mapRows(
      [1, 2],
      neutralRowColors,
      { 1: 'cetasikas-neutral-universal', 2: 'cetasikas-neutral-pakinnaka' },
    )
    const badRows = mapRows(
      [3, 4, 5, 6, 7],
      badRowColors,
      {
        3: 'cetasikas-bad-moha',
        4: 'cetasikas-bad-lobha',
        5: 'cetasikas-bad-dosa',
        6: 'cetasikas-bad-thinamiddha',
        7: 'cetasikas-bad-vicikiccha',
      },
    )
    const goodRows = mapRows(
      [8, 9, 10, 11],
      goodRowColors,
      {
        8: 'cetasikas-good-sobhana',
        9: 'cetasikas-good-virati',
        10: 'cetasikas-good-appamanna',
        11: 'cetasikas-good-panna',
      },
    )

    return [
      {
        id: 'cetasikas-neutral',
        titleThai: 'อัญญสมานาเจตสิก 13',
        subtitleThai: 'เจตสิกทั่วไปที่เข้าได้กับจิตทั้งดีและชั่ว',
        titleEn: 'Neutral — 13 cetasikas',
        color: '#94a3b8',
        rows: neutralRows,
      },
      {
        id: 'cetasikas-bad',
        titleThai: 'อกุศลเจตสิก 14',
        subtitleThai: 'เจตสิกที่ทำหน้าที่ปรุงแต่งจิตให้เศร้าหมอง',
        titleEn: 'Unwholesome — 14 cetasikas',
        color: '#ef9b54',
        rows: badRows,
      },
      {
        id: 'cetasikas-good',
        titleThai: 'โสภณเจตสิก 25',
        subtitleThai: 'เจตสิกฝ่ายดีที่ทำให้จิตผ่องใส',
        titleEn: 'Beautiful — 25 cetasikas',
        color: '#16a34a',
        rows: goodRows,
      },
    ].filter((block) => block.rows.length > 0)
  }, [staticMentals, staticMentalGroups])

  const isStudyGroupExpanded = useCallback(
    (id: string) => !collapsedStudyGroups.has(id),
    [collapsedStudyGroups],
  )
  const toggleStudyGroup = useCallback((id: string) => {
    setCollapsedStudyGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <main className="page">
      <div className="mindstudy-hero">
        <div>
          <p className="mindstudy-kicker">Study Guide</p>
          <h1 className="mindstudy-title">Mind Study: Abhidhamma Piṭaka</h1>
          <p className="mindstudy-lead">
            Start with the overview of the Abhidhamma Piṭaka, then use the outline to jump to mental factors (cetasikas,
            เจตสิก), types of consciousness (citta, จิต), and materiality (rūpa, รูป). The layout stays scannable so
            classical lists and this guide stay easy to cross-read.
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
              <span>Study outline</span>
              <span className={`mindstudy-caret ${navOpen ? 'open' : ''}`} aria-hidden>
                ▼
              </span>
            </button>
            <div
              id="mindstudy-nav-subtopics"
              className={`mindstudy-nav-children ${navOpen ? 'open' : ''}`}
              role="region"
              aria-label="Study outline"
            >
              <a className="mindstudy-nav-item sub" href={`#${mainTopic.id}`}>
                {mainTopic.title}
              </a>
              <a className="mindstudy-nav-item sub" href="#cognitive-start">
                Where a mind-moment begins
              </a>
              <a className="mindstudy-nav-item sub" href="#cognitive">
                How mind-moments unfold
              </a>
              <a className="mindstudy-nav-item sub" href="#learn-more">
                Learn more about the mind
              </a>
            </div>

            <div className="mindstudy-nav-divider" role="presentation" />

            <div className="mindstudy-nav-section">
              <p className="mindstudy-nav-section-title">Mental</p>
              <p className="mindstudy-nav-section-desc">Cetasikas (เจตสิก) · 52</p>
              <a className="mindstudy-nav-item" href="#topic-mental">
                Mental diagram
              </a>
              <a className="mindstudy-nav-item sub mindstudy-nav-mental-topic" href="#cetasikas-neutral">
                <span className="mindstudy-nav-mental-topic-title">
                  Neutral — 13 cetasikas (อัญญสมานาเจตสิก 13)
                </span>
                <span className="mindstudy-nav-mental-topic-desc">
                  Universals and particulars (เจตสิกทั่วไปที่เข้าได้กับจิตทั้งดีและชั่ว)
                </span>
              </a>
              <a
                className="mindstudy-nav-item sub mindstudy-nav-mental-topic"
                href="#cetasikas-bad"
                style={{ color: BAD_MENTAL_TEXT }}
              >
                <span className="mindstudy-nav-mental-topic-title" style={{ color: 'inherit' }}>
                  Unwholesome — 14 cetasikas (อกุศลเจตสิก 14)
                </span>
                <span className="mindstudy-nav-mental-topic-desc" style={{ color: 'inherit', opacity: 0.92 }}>
                  Factors that cloud the mind (เจตสิกที่ทำหน้าที่ปรุงแต่งจิตให้เศร้าหมอง)
                </span>
              </a>
              <a
                className="mindstudy-nav-item sub mindstudy-nav-mental-topic"
                href="#cetasikas-good"
                style={{ color: GOOD_MENTAL_TEXT }}
              >
                <span className="mindstudy-nav-mental-topic-title" style={{ color: 'inherit' }}>
                  Beautiful — 25 cetasikas (โสภณเจตสิก 25)
                </span>
                <span className="mindstudy-nav-mental-topic-desc" style={{ color: 'inherit', opacity: 0.92 }}>
                  Wholesome beautifying factors (เจตสิกฝ่ายดีที่ทำให้จิตผ่องใส)
                </span>
              </a>
            </div>

            <div className="mindstudy-nav-divider" role="presentation" />

            <div className="mindstudy-nav-section">
              <p className="mindstudy-nav-section-title">Mind</p>
              <p className="mindstudy-nav-section-desc">Citta (จิต) · 89</p>
              <a className="mindstudy-nav-item" href="#topic-mind">
                Mind diagram
              </a>
              <button
                type="button"
                className="mindstudy-nav-toggle"
                style={{ marginTop: 6 }}
                onClick={() => setMindNavOpen((o) => !o)}
                aria-expanded={mindNavOpen}
                aria-controls="mindstudy-nav-mind-groups"
              >
                <span>Citta groups</span>
                <span className={`mindstudy-caret ${mindNavOpen ? 'open' : ''}`} aria-hidden>
                  ▼
                </span>
              </button>
              <div
                id="mindstudy-nav-mind-groups"
                className={`mindstudy-nav-children ${mindNavOpen ? 'open' : ''}`}
                role="region"
                aria-label="Citta groups"
              >
                {mindDiagramGroups.map((g) => (
                  <a key={g.id} className="mindstudy-nav-item sub" href={`#${g.id}`}>
                    {g.subtitle || g.title}
                    {g.title && g.subtitle && g.title !== g.subtitle ? ` (${g.title})` : ''}
                  </a>
                ))}
              </div>
            </div>

            <div className="mindstudy-nav-divider" role="presentation" />

            <div className="mindstudy-nav-section">
              <p className="mindstudy-nav-section-title">Rupa</p>
              <p className="mindstudy-nav-section-desc">Materiality (รูป) · 28</p>
              <a className="mindstudy-nav-item" href="#topic-rupa">
                Rupa diagram
              </a>
              {rupaCategoryBlocks.map((group) => (
                <a key={group.id} className="mindstudy-nav-item sub" href={`#${group.id}`}>
                  {group.titleEn} ({group.titleTh})
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
              aria-label="Open lesson: where a mind-moment begins"
            >
              <span className="mindstudy-badge light">Abhidhamma</span>
              <h3 className="mindstudy-cognitive-box-title">Where a mind-moment begins</h3>
              <span className="mindstudy-caret" aria-hidden>→</span>
            </button>
          </article>
          <article className="mindstudy-section mindstudy-cognitive-box" id="cognitive">
            <button
              type="button"
              className="mindstudy-cognitive-box-trigger"
              onClick={() => navigate('/mind-study/cognitive')}
              aria-label="Open lesson: how mind-moments unfold"
            >
              <span className="mindstudy-badge light">Analysis</span>
              <h3 className="mindstudy-cognitive-box-title">How mind-moments unfold</h3>
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

          <section
            className="mindstudy-topic-section"
            id="topic-mental"
            aria-labelledby="topic-mental-heading"
          >
            <header className="mindstudy-topic-section-header">
              <span className="mindstudy-topic-section-kicker">Mental</span>
              <h2 id="topic-mental-heading" className="mindstudy-topic-section-title">
                Cetasikas (เจตสิก)
              </h2>
              <p className="mindstudy-topic-section-desc">
                52 factors grouped as circular rows by family.
              </p>
            </header>
            <div className="mindstudy-diagram-surface" id="mental-diagram">
            <p className="mindstudy-grid-hint">
              Mental factors grouped as circular rows.
            </p>
            <div className="mindstudy-diagram">
              {mentalCategoryBlocks.map((block) => {
                const mentalOpen = isStudyGroupExpanded(block.id)
                return (
                  <article
                    key={block.id}
                    id={block.id}
                    className={`mindstudy-diagram-group ${mentalOpen ? '' : 'is-collapsed'}`}
                  >
                    <button
                      type="button"
                      className="mindstudy-diagram-group-head mindstudy-diagram-group-toggle"
                      aria-expanded={mentalOpen}
                      aria-controls={`mindstudy-mental-body-${block.id}`}
                      onClick={() => toggleStudyGroup(block.id)}
                    >
                      <span className="mindstudy-diagram-group-dot" style={{ background: block.color }} aria-hidden />
                      <h3
                        lang="en"
                        style={{
                          color:
                            block.id === 'cetasikas-bad'
                              ? BAD_MENTAL_TEXT
                              : block.id === 'cetasikas-good'
                                ? GOOD_MENTAL_TEXT
                                : NEUTRAL_MENTAL_TEXT,
                        }}
                      >
                        {block.titleEn}
                      </h3>
                      <p className="mindstudy-diagram-group-sub-th" lang="th">
                        ({block.titleThai} · {block.subtitleThai})
                      </p>
                      <span className={`mindstudy-caret ${mentalOpen ? 'open' : ''}`} aria-hidden>
                        ▼
                      </span>
                    </button>
                    <div
                      id={`mindstudy-mental-body-${block.id}`}
                      className={`mindstudy-diagram-group-body ${mentalOpen ? 'open' : ''}`}
                      role="region"
                      aria-label={`${block.titleEn} (${block.titleThai})`}
                      aria-hidden={!mentalOpen}
                    >
                      <div className="mindstudy-diagram-group-body-inner">
                        <div className="mindstudy-diagram-subgroups">
                          {block.rows.map((row) => (
                            <div key={row.id} id={row.anchorId} className="mindstudy-diagram-subgroup-row">
                              <div className="mindstudy-diagram-circles compact">
                                {row.items.map((mental) => (
                                  <button
                                    key={mental.id}
                                    id={`mental-${mental.id}`}
                                    type="button"
                                    className="mindstudy-diagram-node compact"
                                    style={{ background: `${row.color}33`, borderColor: row.color, color: '#1f2937' }}
                                    onClick={() => {
                                      openCetasikaFromStaticMental(mental)
                                    }}
                                    aria-label={`${mental.name} (${mental.thai})`}
                                  >
                                    <span className="mindstudy-diagram-node-index">{mental.id}</span>
                                  </button>
                                ))}
                              </div>
                              <div className="mindstudy-diagram-subgroup-label-wrap">
                                <span className="mindstudy-diagram-subgroup-brace" style={{ color: row.color }} aria-hidden>
                                  {'}'}
                                </span>
                                <span className="mindstudy-diagram-subgroup-label" style={{ color: row.color }} lang="en">
                                  {row.titleEn}
                                  {!englishLabelAlreadyStatesItemCount(row.titleEn, row.items.length)
                                    ? ` ${row.items.length}`
                                    : ''}
                                  {row.title && row.title !== row.titleEn
                                    ? ` (${row.title} ${toThaiDigitString(row.items.length)})`
                                    : ''}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
            </div>
          </section>

          <section
            className="mindstudy-topic-section"
            id="topic-mind"
            aria-labelledby="topic-mind-heading"
          >
            <header className="mindstudy-topic-section-header">
              <span className="mindstudy-topic-section-kicker">Mind</span>
              <h2 id="topic-mind-heading" className="mindstudy-topic-section-title">
                Citta (จิต)
              </h2>
              <p className="mindstudy-topic-section-desc">
                89 consciousness types shown in group order.
              </p>
            </header>
            <div className="mindstudy-diagram-surface" id="mind-diagram">
            <p className="mindstudy-grid-hint">
              Circular mind diagram.
              {loading ? ' Loading…' : ''}
              {!loading && loadError ? ` ${loadError}` : ''}
            </p>
            <div className="mindstudy-diagram">
              {mindDiagramGroups.map((group) => {
                const mindGroupOpen = isStudyGroupExpanded(group.id)
                return (
                <article
                  key={group.id}
                  id={group.id}
                  className={`mindstudy-diagram-group ${mindGroupOpen ? '' : 'is-collapsed'}`}
                >
                  <button
                    type="button"
                    className="mindstudy-diagram-group-head mindstudy-diagram-group-toggle"
                    aria-expanded={mindGroupOpen}
                    aria-controls={`mindstudy-mind-body-${group.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`}
                    onClick={() => toggleStudyGroup(group.id)}
                  >
                    <span
                      className="mindstudy-diagram-group-dot"
                      style={{ background: group.color }}
                      aria-hidden
                    />
                    <h3 lang={containsThaiScript(group.subtitle || group.title || '') ? 'th' : 'en'}>
                      {group.subtitle || group.title}
                    </h3>
                    {group.title &&
                    group.subtitle &&
                    group.title !== group.subtitle &&
                    !containsThaiScript(group.subtitle || '') ? (
                      <p lang="th">({group.title})</p>
                    ) : null}
                    <span className={`mindstudy-caret ${mindGroupOpen ? 'open' : ''}`} aria-hidden>
                      ▼
                    </span>
                  </button>
                  <div
                    id={`mindstudy-mind-body-${group.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`}
                    className={`mindstudy-diagram-group-body ${mindGroupOpen ? 'open' : ''}`}
                    role="region"
                    aria-label={
                      group.subtitle &&
                      group.title &&
                      group.title !== group.subtitle &&
                      containsThaiScript(group.title)
                        ? `${group.subtitle} (${group.title})`
                        : (group.subtitle || group.title)
                    }
                    aria-hidden={!mindGroupOpen}
                  >
                  <div className="mindstudy-diagram-group-body-inner">
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
                      labelEn: string
                      labelTh: string
                      color: string
                      match: (mindTitle: string, mindId: string, subgroup?: string) => boolean
                    }> = isAkusala
                      ? [
                          {
                            key: 'lobha',
                            labelEn: 'Greed-rooted minds (8)',
                            labelTh: 'โลภมูลจิต ๘',
                            color: '#b76c84',
                            match: (mindTitle, mindId, subgroup) =>
                              subgroup === 'lobha_mula' ||
                              (Number(mindId.replace('mind-', '')) >= 1 && Number(mindId.replace('mind-', '')) <= 8) ||
                              mindTitle.includes('โลภมูลจิต'),
                          },
                          {
                            key: 'dosa',
                            labelEn: 'Hatred-rooted minds (2)',
                            labelTh: 'โทสมูลจิต ๒',
                            color: '#ef9b54',
                            match: (mindTitle, mindId, subgroup) =>
                              subgroup === 'dosa_mula' ||
                              (Number(mindId.replace('mind-', '')) >= 9 && Number(mindId.replace('mind-', '')) <= 10) ||
                              mindTitle.includes('โทสมูลจิต'),
                          },
                          {
                            key: 'moha',
                            labelEn: 'Delusion-rooted minds (2)',
                            labelTh: 'โมหมูลจิต ๒',
                            color: '#d9b49c',
                            match: (mindTitle, mindId, subgroup) =>
                              subgroup === 'moha_mula' ||
                              (Number(mindId.replace('mind-', '')) >= 11 && Number(mindId.replace('mind-', '')) <= 12) ||
                              mindTitle.includes('โมหมูลจิต'),
                          },
                        ]
                      : isAhetuka
                        ? [
                            {
                              key: 'ahetuka-akusala-vipaka',
                              labelEn: 'Unwholesome resultant (7)',
                              labelTh: 'อกุศลวิปากจิต ๗',
                              color: '#9fbe4c',
                              match: (mindTitle, mindId, subgroup) =>
                                subgroup === 'ahetuka_akusala_vipaka' ||
                                (Number(mindId.replace('mind-', '')) >= 13 && Number(mindId.replace('mind-', '')) <= 19) ||
                                mindTitle.includes('อกุศลวิบาก'),
                            },
                            {
                              key: 'ahetuka-kusala-vipaka',
                              labelEn: 'Rootless wholesome resultant (8)',
                              labelTh: 'อเหตุกกุศลวิปากจิต ๘',
                              color: '#a9c75a',
                              match: (mindTitle, mindId, subgroup) =>
                                subgroup === 'ahetuka_kusala_vipaka' ||
                                (Number(mindId.replace('mind-', '')) >= 20 && Number(mindId.replace('mind-', '')) <= 27) ||
                                (mindTitle.includes('กุศลวิบาก') && !mindTitle.includes('อกุศลวิบาก')),
                            },
                            {
                              key: 'ahetuka-kiriya',
                              labelEn: 'Rootless functional (3)',
                              labelTh: 'อเหตุกกิริยาจิต ๓',
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
                                labelEn: 'Great wholesome (8)',
                                labelTh: 'มหากุศลจิต ๘',
                                color: '#ef9b54',
                                match: (_mindTitle, mindId, subgroup) =>
                                  subgroup === 'maha_kusala' ||
                                  (Number(mindId.replace('mind-', '')) >= 31 && Number(mindId.replace('mind-', '')) <= 38),
                              },
                              {
                                key: 'maha-vipaka',
                                labelEn: 'Great resultant (8)',
                                labelTh: 'มหาวิปากจิต ๘',
                                color: '#9fbe4c',
                                match: (_mindTitle, mindId, subgroup) =>
                                  subgroup === 'maha_vipaka' ||
                                  (Number(mindId.replace('mind-', '')) >= 39 && Number(mindId.replace('mind-', '')) <= 46),
                              },
                              {
                                key: 'maha-kiriya',
                                labelEn: 'Great functional (8)',
                                labelTh: 'มหากิริยาจิต ๘',
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
                                  labelEn: 'Rūpāvacara wholesome (5)',
                                  labelTh: 'รูปาวจรกุศลจิต ๕',
                                  color: '#f0b563',
                                  match: (_t, id, subgroup) =>
                                    subgroup === 'rupavacara_kusala' ||
                                    (Number(id.replace('mind-', '')) >= 55 && Number(id.replace('mind-', '')) <= 59),
                                },
                                {
                                  key: 'rupa-vipaka',
                                  labelEn: 'Rūpāvacara resultant (5)',
                                  labelTh: 'รูปาวจรวิปากจิต ๕',
                                  color: '#a7c95d',
                                  match: (_t, id, subgroup) =>
                                    subgroup === 'rupavacara_vipaka' ||
                                    (Number(id.replace('mind-', '')) >= 60 && Number(id.replace('mind-', '')) <= 64),
                                },
                                {
                                  key: 'rupa-kiriya',
                                  labelEn: 'Rūpāvacara functional (5)',
                                  labelTh: 'รูปาวจรกิริยาจิต ๕',
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
                                  labelEn: 'Arūpāvacara wholesome (4)',
                                  labelTh: 'อรูปาวจรกุศลจิต ๔',
                                  color: '#e39a73',
                                  match: (_t, id, subgroup) =>
                                    subgroup === 'arupavacara_kusala' ||
                                    (Number(id.replace('mind-', '')) >= 70 && Number(id.replace('mind-', '')) <= 73),
                                },
                                {
                                  key: 'arupa-vipaka',
                                  labelEn: 'Arūpāvacara resultant (4)',
                                  labelTh: 'อรูปาวจรวิปากจิต ๔',
                                  color: '#b4cd75',
                                  match: (_t, id, subgroup) =>
                                    subgroup === 'arupavacara_vipaka' ||
                                    (Number(id.replace('mind-', '')) >= 74 && Number(id.replace('mind-', '')) <= 77),
                                },
                                {
                                  key: 'arupa-kiriya',
                                  labelEn: 'Arūpāvacara functional (4)',
                                  labelTh: 'อรูปาวจรกิริยาจิต ๔',
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
                                    labelEn: 'Path consciousness (4)',
                                    labelTh: 'มรรคจิต ๔',
                                    color: '#e89d74',
                                    match: (_t, id, subgroup) =>
                                      subgroup === 'magga' ||
                                      (Number(id.replace('mind-', '')) >= 82 && Number(id.replace('mind-', '')) <= 85),
                                  },
                                  {
                                    key: 'lokuttara-phala',
                                    labelEn: 'Fruition consciousness (4)',
                                    labelTh: 'ผลจิต ๔',
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

                    if (isLokuttara) {
                      const lokuttaraDisplayStart = 82
                      const lokuttaraRows: Array<{
                        key: string
                        color: string
                        labelEn: string
                        labelTh: string
                        mindIds: number[]
                      }> = [
                        {
                          key: 'sotapatti-magga',
                          color: '#ef9b54',
                          labelEn: 'Sotapatti path consciousness (1 or 5)',
                          labelTh: 'โสดาปัตติมรรคจิต ๑ หรือ ๕',
                          mindIds: [82],
                        },
                        {
                          key: 'sakadagami-magga',
                          color: '#ef9b54',
                          labelEn: 'Sakadagami path consciousness (1 or 5)',
                          labelTh: 'สกทาคามิมรรคจิต ๑ หรือ ๕',
                          mindIds: [83],
                        },
                        {
                          key: 'anagami-magga',
                          color: '#ef9b54',
                          labelEn: 'Anagami path consciousness (1 or 5)',
                          labelTh: 'อนาคามิมรรคจิต ๑ หรือ ๕',
                          mindIds: [84],
                        },
                        {
                          key: 'arahatta-magga',
                          color: '#ef9b54',
                          labelEn: 'Arahatta path consciousness (1 or 5)',
                          labelTh: 'อรหัตตมรรคจิต ๑ หรือ ๕',
                          mindIds: [85],
                        },
                        {
                          key: 'sotapatti-phala',
                          color: '#9fbe4c',
                          labelEn: 'Sotapatti fruition consciousness (1 or 5)',
                          labelTh: 'โสดาปัตติผลจิต ๑ หรือ ๕',
                          mindIds: [86],
                        },
                        {
                          key: 'sakadagami-phala',
                          color: '#9fbe4c',
                          labelEn: 'Sakadagami fruition consciousness (1 or 5)',
                          labelTh: 'สกทาคามิผลจิต ๑ หรือ ๕',
                          mindIds: [87],
                        },
                        {
                          key: 'anagami-phala',
                          color: '#9fbe4c',
                          labelEn: 'Anagami fruition consciousness (1 or 5)',
                          labelTh: 'อนาคามิผลจิต ๑ หรือ ๕',
                          mindIds: [88],
                        },
                        {
                          key: 'arahatta-phala',
                          color: '#9fbe4c',
                          labelEn: 'Arahatta fruition consciousness (1 or 5)',
                          labelTh: 'อรหัตตผลจิต ๑ หรือ ๕',
                          mindIds: [89],
                        },
                      ]
                      return (
                        <div className="mindstudy-diagram-subgroups">
                          {lokuttaraRows.map((row, rowIndex) => {
                            const rowMinds = group.minds.filter((mind) => {
                              const idMatch = String(mind.id).match(/mind-(\d+)/)
                              const numericId = idMatch ? Number(idMatch[1]) : Number.NaN
                              return row.mindIds.includes(numericId)
                            })
                            if (!rowMinds.length) return null
                            const rowMindLevels = rowMinds.flatMap((topic) =>
                              Array.from({ length: 5 }, (_, idx) => ({
                                topic,
                                level: idx + 1,
                              })),
                            )
                            return (
                              <div key={row.key} className="mindstudy-diagram-subgroup-row">
                                <div className="mindstudy-diagram-circles compact">
                                  {rowMindLevels.map(({ topic, level }) => {
                                    const syntheticId = lokuttaraDisplayStart + rowIndex * 5 + (level - 1)
                                    return (
                                      <button
                                        key={`${topic.id}-level-${level}`}
                                        id={`lokuttara-${row.key}-${level}`}
                                        type="button"
                                        className="mindstudy-diagram-node compact"
                                        style={{
                                          background: `${row.color}33`,
                                          borderColor: row.color,
                                          color: '#1f2937',
                                        }}
                                        onClick={() => {
                                          setSelectedMind(topic)
                                          setModalOpen(true)
                                        }}
                                        aria-label={`${topic.title} level ${level} (${syntheticId})`}
                                      >
                                        <span className="mindstudy-diagram-node-index">{syntheticId}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                                <div className="mindstudy-diagram-subgroup-label-wrap">
                                  <span className="mindstudy-diagram-subgroup-brace" style={{ color: row.color }} aria-hidden>
                                    {'}'}
                                  </span>
                                  <span className="mindstudy-diagram-subgroup-label" style={{ color: row.color }} lang="en">
                                    {row.labelEn} ({row.labelTh})
                                  </span>
                                </div>
                              </div>
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
                                <span className="mindstudy-diagram-subgroup-label" style={{ color: subgroup.color }} lang="en">
                                  {subgroup.labelEn}
                                  {!englishLabelAlreadyStatesItemCount(subgroup.labelEn, subgroupMinds.length)
                                    ? ` ${subgroupMinds.length}`
                                    : ''}
                                  {subgroup.labelTh
                                    ? ` (${stripTrailingCountLabel(subgroup.labelTh)} ${toThaiDigitString(subgroupMinds.length)})`
                                    : ''}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                  </div>
                  </div>
                </article>
                )
              })}
            </div>
          </div>
        </section>
        <section
          className="mindstudy-topic-section"
          id="topic-rupa"
          aria-labelledby="topic-rupa-heading"
        >
          <header className="mindstudy-topic-section-header">
            <span className="mindstudy-topic-section-kicker">Rupa</span>
            <h2 id="topic-rupa-heading" className="mindstudy-topic-section-title">
              Materiality (รูป)
            </h2>
            <p className="mindstudy-topic-section-desc">
              28 material phenomena grouped by category and subcategory.
            </p>
          </header>
          <div className="mindstudy-diagram-surface" id="rupa-diagram">
            <p className="mindstudy-grid-hint">
              Circular rupa diagram.
              {loading ? ' Loading…' : ''}
              {!loading && loadError ? ` ${loadError}` : ''}
            </p>
            <div className="mindstudy-diagram">
              {rupaCategoryBlocks.map((group) => {
                const rupaGroupOpen = isStudyGroupExpanded(group.id)
                return (
                  <article
                    key={group.id}
                    id={group.id}
                    className={`mindstudy-diagram-group ${rupaGroupOpen ? '' : 'is-collapsed'}`}
                  >
                    <button
                      type="button"
                      className="mindstudy-diagram-group-head mindstudy-diagram-group-toggle"
                      aria-expanded={rupaGroupOpen}
                      aria-controls={`mindstudy-rupa-body-${group.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`}
                      onClick={() => toggleStudyGroup(group.id)}
                    >
                      <span className="mindstudy-diagram-group-dot" style={{ background: group.color }} aria-hidden />
                      <h3 lang="en">{group.titleEn}</h3>
                      <p lang="th">({group.titleTh})</p>
                      <span className={`mindstudy-caret ${rupaGroupOpen ? 'open' : ''}`} aria-hidden>
                        ▼
                      </span>
                    </button>
                    <div
                      id={`mindstudy-rupa-body-${group.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`}
                      className={`mindstudy-diagram-group-body ${rupaGroupOpen ? 'open' : ''}`}
                      role="region"
                      aria-label={`${group.titleEn} (${group.titleTh})`}
                      aria-hidden={!rupaGroupOpen}
                    >
                      <div className="mindstudy-diagram-group-body-inner">
                        <div className="mindstudy-diagram-subgroups">
                          {group.rows.map((row) => (
                            <div key={row.id} id={row.id} className="mindstudy-diagram-subgroup-row">
                              <div className="mindstudy-diagram-circles compact">
                                {row.items.map((rupa) => (
                                  <button
                                    key={rupa.id}
                                    id={`rupa-${rupa.id}`}
                                    type="button"
                                    className="mindstudy-diagram-node compact"
                                    style={{ background: `${row.color}33`, borderColor: row.color, color: '#1f2937' }}
                                    aria-label={`${rupa.name_en} (${rupa.name})`}
                                    title={`${rupa.name_en} (${rupa.pali})`}
                                    onClick={() => openRupaDetail(rupa)}
                                  >
                                    <span className="mindstudy-diagram-node-index">{rupa.id}</span>
                                  </button>
                                ))}
                              </div>
                              <div className="mindstudy-diagram-subgroup-label-wrap">
                                <span className="mindstudy-diagram-subgroup-brace" style={{ color: row.color }} aria-hidden>
                                  {'}'}
                                </span>
                                <span className="mindstudy-diagram-subgroup-label" style={{ color: row.color }} lang="en">
                                  {row.titleEn}
                                  {!englishLabelAlreadyStatesItemCount(row.titleEn, row.items.length)
                                    ? ` ${row.items.length}`
                                    : ''}
                                  {row.titleTh
                                    ? ` (${stripTrailingCountLabel(row.titleTh)} ${toThaiDigitString(row.items.length)})`
                                    : ''}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
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
              Go to mind-moments lesson →
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
      {rupaModalOpen && selectedRupa && (
        <div className="mindstudy-modal-backdrop" role="presentation" onClick={() => setRupaModalOpen(false)}>
          <div
            className="mindstudy-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Inspect ${selectedRupa.name_en}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mindstudy-modal-glow" aria-hidden />
            <div className="mindstudy-modal-header">
              <span className="mindstudy-level-pill small">Rupa (รูป)</span>
              <button className="mindstudy-modal-close" onClick={() => setRupaModalOpen(false)} aria-label="Close dialog">
                ✕
              </button>
            </div>
            <div className="mindstudy-modal-body">
              <h3 lang="en">
                {selectedRupa.name_en}
                {selectedRupa.name?.trim() ? (
                  <span lang="th" className="mindstudy-modal-title-thai">
                    {' '}
                    ({selectedRupa.name.trim()})
                  </span>
                ) : null}
              </h3>
              <p className="mindstudy-modal-sub">
                Pali: <span lang="pi">{selectedRupa.pali || '-'}</span>
              </p>
              <p className="mindstudy-modal-sub">
                Group: <span lang="en">{selectedRupa.group || '-'}</span> · Subgroup:{' '}
                <span lang="en">{selectedRupa.subgroup || '-'}</span>
              </p>
              {selectedRupa.description?.trim() ? (
                <p className="mindstudy-section-desc">{selectedRupa.description.trim()}</p>
              ) : null}
            </div>
            <div className="mindstudy-modal-actions">
              <button className="mindstudy-btn primary" onClick={() => setRupaModalOpen(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      {modalOpen && selectedMind && (
        <div className="mindstudy-modal-backdrop" role="presentation" onClick={() => setModalOpen(false)}>
          <div
            className={`mindstudy-modal ${cetasikaModalOpen && selectedCetasika ? 'mindstudy-modal-with-side' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={`Inspect ${selectedMind.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mindstudy-modal-glow" aria-hidden />
            <div className="mindstudy-modal-header">
              <span className="mindstudy-level-pill small">จิต · Citta</span>
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
              {(() => {
                const sm = staticMindByAggregateId.get(String(selectedMind.id))
                const ids = sm?.mental_ids ?? []
                if (!ids.length) return null
                const linkedMentals = ids
                  .map((id) => staticMentalById.get(id))
                  .filter((mental): mental is StaticMental => Boolean(mental))
                if (!linkedMentals.length) return null
                return (
                  <div className="mindstudy-modal-mental-ids">
                    <span className="mindstudy-modal-mental-ids-label">เจตสิกในจิตนี้</span>
                    <div className="mindstudy-modal-mental-list">
                      {linkedMentals.map((mental) => (
                        <button
                          key={mental.id}
                          type="button"
                          className="mindstudy-modal-mental-item"
                          onClick={() => openCetasikaFromStaticMental(mental)}
                        >
                          {mental.name}
                          {mental.thai?.trim() ? ` (${mental.thai.trim()})` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
            <div className="mindstudy-modal-actions">
              <button className="mindstudy-btn ghost" onClick={() => setModalOpen(false)}>
                Close
              </button>
              <button
                className="mindstudy-btn primary"
                type="button"
                onClick={() => {
                  const pathId = encodeURIComponent(String(selectedMind.id))
                  setModalOpen(false)
                  setSelectedMind(null)
                  navigate(`/mind-study/${pathId}`)
                }}
              >
                Illustrate
              </button>
            </div>
          </div>
        </div>
      )}
      {cetasikaModalOpen && selectedCetasika && (() => {
        const c = selectedCetasika
        const titleEn = (c.nameEn ?? c.className).trim()
        const thaiBracket = c.thai?.trim() ? ` (${c.thai.trim()})` : ''
        const abhidhammaRows: { key: string; label: string; text: string | undefined }[] = [
          { key: 'ch', label: 'Characteristic (ลักษณะ)', text: c.characteristic },
          { key: 'fn', label: 'Function (กิจ)', text: c.abhidhammaFunction },
          { key: 'mn', label: 'Manifestation (ปาฏิหานิยะ)', text: c.manifestation },
          { key: 'pc', label: 'Proximate cause (ปทฐาน)', text: c.proximateCause },
        ]
        const filledRows = abhidhammaRows.filter((row) => row.text?.trim())
        const sideBySideWithMind = modalOpen && selectedMind
        return (
        <div
          className={sideBySideWithMind ? 'mindstudy-modal-side-shell' : 'mindstudy-modal-backdrop'}
          role="presentation"
          onClick={() => setCetasikaModalOpen(false)}
        >
          <div
            className={`mindstudy-modal ${sideBySideWithMind ? 'mindstudy-modal-side' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label={`Inspect ${titleEn}${thaiBracket}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mindstudy-modal-glow" aria-hidden />
            <div className="mindstudy-modal-header">
              <span className="mindstudy-level-pill small">Cetasika (เจตสิก)</span>
              <button className="mindstudy-modal-close" onClick={() => setCetasikaModalOpen(false)} aria-label="Close dialog">
                ✕
              </button>
            </div>
            <div className="mindstudy-modal-body">
              <h3 lang="en">
                {titleEn}
                {c.thai?.trim() ? (
                  <span lang="th" className="mindstudy-modal-title-thai">
                    {' '}
                    ({c.thai.trim()})
                  </span>
                ) : null}
              </h3>
              <p className="mindstudy-modal-sub">
                Pāli: <span lang="pi">{c.pali}</span>
              </p>
              {c.description?.trim() ? (
                <p className="mindstudy-section-desc">{c.description.trim()}</p>
              ) : null}
              {filledRows.length > 0 ? (
                <dl className="mindstudy-modal-cetasika-fields">
                  {filledRows.map((row) => (
                    <div key={row.key} className="mindstudy-modal-cetasika-field">
                      <dt>{row.label}</dt>
                      <dd lang="en">{row.text!.trim()}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {c.highlights.length > 0 ? (
                <ul className="mindstudy-list modal-list">
                  {c.highlights.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="mindstudy-modal-actions">
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
        )
      })()}
    </main>
  )
}

