export type MentalPreviewEntry = {
  ctor: string
  label: string
  color: string
  scale: number
  position: [number, number, number]
}

const COLOR_GOOD = '#22c55e'
const COLOR_BAD = '#ef4444'
const COLOR_NEUTRAL = '#a1a1aa'
const COLOR_PERCEPTION = '#60a5fa'
const COLOR_RAPTURE = '#38bdf8'

const BAD_CTORS = new Set<string>([
  'BadMental',
  'ConceitMental',
  'DelusionMental',
  'DoubtMental',
  'EnvyMental',
  'GreedMental',
  'HatredMental',
  'RecklessnessMental',
  'RestlessnessMental',
  'ShamelessnessMental',
  'SlothMental',
  'StinginessMental',
  'TorporMental',
  'WorryMental',
  'WrongViewMental',
])

const GOOD_CTORS = new Set<string>([
  'AppreciativeJoyMental',
  'CompassionMental',
  'EquanimityMental',
  'FaithMental',
  'GoodMental',
  'LightnessBodyMental',
  'LightnessMindMental',
  'MindfulnessMental',
  'MoralDreadMental',
  'MoralShameMental',
  'NonGreedMental',
  'NonHatredMental',
  'PliancyBodyMental',
  'PliancyMindMental',
  'ProficiencyBodyMental',
  'ProficiencyMindMental',
  'RectitudeBodyMental',
  'RectitudeMindMental',
  'RightActionMental',
  'RightLivelihoodMental',
  'RightSpeechMental',
  'TranquilityBodyMental',
  'TranquilityMindMental',
  'WieldinessBodyMental',
  'WieldinessMindMental',
  'WisdomMental',
])

/** Every instantiable Mental-related class in `mindwebsite/classes` (excluding `AbstractMental`), sorted A–Z. */
export const ALL_MENTAL_CTORS: string[] = [
  'AppreciativeJoyMental',
  'AttentionMental',
  'AwarenessMental',
  'BadMental',
  'CompassionMental',
  'ConcentrationMental',
  'ConsciousnessMental',
  'ContactMental',
  'ConceitMental',
  'DelusionMental',
  'DesireMental',
  'DeterminationMental',
  'DoubtMental',
  'EnergyMental',
  'EnvyMental',
  'EquanimityMental',
  'FaithMental',
  'FeelingMental',
  'GoodMental',
  'GreedMental',
  'HatredMental',
  'InitialApplicationMental',
  'IntentionMental',
  'LifeFacultyMental',
  'LightnessBodyMental',
  'LightnessMindMental',
  'Mental',
  'MindfulnessMental',
  'MoralDreadMental',
  'MoralShameMental',
  'NeutralMental',
  'NonGreedMental',
  'NonHatredMental',
  'PerceptionMental',
  'PliancyBodyMental',
  'PliancyMindMental',
  'ProficiencyBodyMental',
  'ProficiencyMindMental',
  'RaptureMental',
  'RectitudeBodyMental',
  'RectitudeMindMental',
  'RecklessnessMental',
  'RestlessnessMental',
  'RightActionMental',
  'RightLivelihoodMental',
  'RightSpeechMental',
  'ShamelessnessMental',
  'SlothMental',
  'StinginessMental',
  'SustainedApplicationMental',
  'TorporMental',
  'TranquilityBodyMental',
  'TranquilityMindMental',
  'UniversalMental',
  'WieldinessBodyMental',
  'WieldinessMindMental',
  'WisdomMental',
  'WorryMental',
  'WrongViewMental',
]

const DEFAULT_POSITION: [number, number, number] = [0, -0.42, 0.08]

const LABEL_OVERRIDES: Partial<Record<string, string>> = {
  Mental: 'Mental (base sphere)',
  GoodMental: 'Good (wholesome)',
  BadMental: 'Bad (unwholesome)',
  NeutralMental: 'Neutral',
  UniversalMental: 'Universal',
  DeterminationMental: 'Decision',
  NonGreedMental: 'Non-greed',
  NonHatredMental: 'Non-hatred',
}

function labelFromCtor(ctor: string): string {
  const base = ctor.replace(/Mental$/, '')
  if (!base) return 'Mental'
  return base.replace(/([a-z])([A-Z])/g, '$1 $2').trim()
}

function colorForCtor(ctor: string): string {
  if (ctor === 'PerceptionMental') return COLOR_PERCEPTION
  if (ctor === 'RaptureMental') return COLOR_RAPTURE
  if (BAD_CTORS.has(ctor)) return COLOR_BAD
  if (GOOD_CTORS.has(ctor)) return COLOR_GOOD
  return COLOR_NEUTRAL
}

function scaleForCtor(ctor: string): number {
  if (ctor === 'PerceptionMental') return 0.18
  if (BAD_CTORS.has(ctor) || GOOD_CTORS.has(ctor)) return 0.12
  return 0.14
}

export function mentalPreviewEntryForCtor(ctor: string): MentalPreviewEntry {
  return {
    ctor,
    label: LABEL_OVERRIDES[ctor] ?? labelFromCtor(ctor),
    color: colorForCtor(ctor),
    scale: scaleForCtor(ctor),
    position: DEFAULT_POSITION,
  }
}

export const MENTAL_PREVIEW_ENTRIES: MentalPreviewEntry[] = ALL_MENTAL_CTORS.map(mentalPreviewEntryForCtor)

/** Mental + `m.add(mt)` only — assumes `m = Mind()` already exists in the editor. */
export function buildMentalSnippetOnly(entry: MentalPreviewEntry): string {
  const [x, y, z] = entry.position
  const fmt = (n: number) => n.toFixed(3)
  const nameEscaped = entry.label.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `mt = ${entry.ctor}()
mt.name = "${nameEscaped}"
mt.color = "${entry.color}"
mt.scale = ${entry.scale.toFixed(3)}
mt.position = (${fmt(x)}, ${fmt(y)}, ${fmt(z)})
m.add(mt)`
}

/** Standalone: new Mind plus one mental (e.g. empty editor or docs). */
export function buildMentalPreviewSnippet(entry: MentalPreviewEntry): string {
  return `m = Mind()
m.name = "Mind"
m.color = "#3b82f6"
m.scale = 1.6

${buildMentalSnippetOnly(entry)}`
}
