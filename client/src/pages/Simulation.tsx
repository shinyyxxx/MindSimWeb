import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import Mind from '../mindwebsite/classes/Mind'
import Mental from '../mindwebsite/classes/Mental'
import PerceptionMental from '../mindwebsite/classes/neutral/PerceptionMental'
import ContactMental from '../mindwebsite/classes/neutral/ContactMental'
import FeelingMental from '../mindwebsite/classes/neutral/FeelingMental'
import IntentionMental from '../mindwebsite/classes/neutral/IntentionMental'
import AttentionMental from '../mindwebsite/classes/neutral/AttentionMental'
import ConcentrationMental from '../mindwebsite/classes/neutral/ConcentrationMental'
import LifeFacultyMental from '../mindwebsite/classes/neutral/LifeFacultyMental'
import InitialApplicationMental from '../mindwebsite/classes/neutral/InitialApplicationMental'
import SustainedApplicationMental from '../mindwebsite/classes/neutral/SustainedApplicationMental'
import DeterminationMental from '../mindwebsite/classes/neutral/DeterminationMental'
import RaptureMental from '../mindwebsite/classes/neutral/RaptureMental'
import FaithMental from '../mindwebsite/classes/good/FaithMental'
import MindfulnessMental from '../mindwebsite/classes/good/MindfulnessMental'
import MoralShameMental from '../mindwebsite/classes/good/MoralShameMental'
import MoralDreadMental from '../mindwebsite/classes/good/MoralDreadMental'
import NonGreedMental from '../mindwebsite/classes/good/NonGreedMental'
import NonHatredMental from '../mindwebsite/classes/good/NonHatredMental'
import EquanimityMental from '../mindwebsite/classes/good/EquanimityMental'
import AppreciativeJoyMental from '../mindwebsite/classes/good/AppreciativeJoyMental'
import TranquilityBodyMental from '../mindwebsite/classes/good/TranquilityBodyMental'
import TranquilityMindMental from '../mindwebsite/classes/good/TranquilityMindMental'
import LightnessBodyMental from '../mindwebsite/classes/good/LightnessBodyMental'
import LightnessMindMental from '../mindwebsite/classes/good/LightnessMindMental'
import PliancyBodyMental from '../mindwebsite/classes/good/PliancyBodyMental'
import PliancyMindMental from '../mindwebsite/classes/good/PliancyMindMental'
import WieldinessBodyMental from '../mindwebsite/classes/good/WieldinessBodyMental'
import WieldinessMindMental from '../mindwebsite/classes/good/WieldinessMindMental'
import ProficiencyBodyMental from '../mindwebsite/classes/good/ProficiencyBodyMental'
import ProficiencyMindMental from '../mindwebsite/classes/good/ProficiencyMindMental'
import RectitudeBodyMental from '../mindwebsite/classes/good/RectitudeBodyMental'
import RectitudeMindMental from '../mindwebsite/classes/good/RectitudeMindMental'
import RightSpeechMental from '../mindwebsite/classes/good/RightSpeechMental'
import RightActionMental from '../mindwebsite/classes/good/RightActionMental'
import RightLivelihoodMental from '../mindwebsite/classes/good/RightLivelihoodMental'
import CompassionMental from '../mindwebsite/classes/good/CompassionMental'
import WisdomMental from '../mindwebsite/classes/good/WisdomMental'
import BadMental from '../mindwebsite/classes/bad/BadMental'
import GreedMental from '../mindwebsite/classes/bad/GreedMental'
import HatredMental from '../mindwebsite/classes/bad/HatredMental'
import DelusionMental from '../mindwebsite/classes/bad/DelusionMental'
import WrongViewMental from '../mindwebsite/classes/bad/WrongViewMental'
import ConceitMental from '../mindwebsite/classes/bad/ConceitMental'
import DoubtMental from '../mindwebsite/classes/bad/DoubtMental'
import RestlessnessMental from '../mindwebsite/classes/bad/RestlessnessMental'
import ShamelessnessMental from '../mindwebsite/classes/bad/ShamelessnessMental'
import RecklessnessMental from '../mindwebsite/classes/bad/RecklessnessMental'
import SlothMental from '../mindwebsite/classes/bad/SlothMental'
import TorporMental from '../mindwebsite/classes/bad/TorporMental'
import WorryMental from '../mindwebsite/classes/bad/WorryMental'
import EnergyMental from '../mindwebsite/classes/neutral/EnergyMental'
import DesireMental from '../mindwebsite/classes/neutral/DesireMental'
import EnvyMental from '../mindwebsite/classes/bad/EnvyMental'
import StinginessMental from '../mindwebsite/classes/bad/StinginessMental'
import NeutralMental from '../mindwebsite/classes/neutral/NeutralMental'
import type { InspectSelection } from '../types/InspectSelection'
import { InspectPanel } from '../components/InspectPanel'
import ProfilePanel from '../components/ProfilePanel'
import XRInspectPanel from '../components/XRInspectPanel'
import XRProfilePanel from '../components/XRProfilePanel'
import { EffectComposer, Outline } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { XRClearMode, XRControllers, XRExitByGrip, XRMovement, XRStatusBridge } from './simulation/XRSceneHelpers'
import { useXRSession } from './simulation/useXRSession'
import { useStationaryDraggableXrPanel } from './simulation/useStationaryDraggableXrPanel'
import { cancelNarration, speakNarration } from './simulation/narration'
import { detailTextForVoiceNarration } from '../utils/inspectVoiceText'
import { CodeParser, type ParsedAction } from '../utils/codeParser'
import { validateMentalComposition, PERSON_TYPES, type PersonType } from '../utils/mentalValidation'
import perceptionBowlModel from '../assets/bowl.glb?url'
import paperPlaneModel from '../assets/paper_plane.glb?url'
import angerEmojiModel from '../assets/emoji/anger_emoji.glb?url'
  
type Vec3 = [number, number, number]

interface VithiMentalDetail {
  id: number
  name: string
  pali?: string
  category?: string
  description?: string
}

interface VithiEvent {
  order: number
  stage: string
  mind_id: number | null
  mind_id_range: number[] | null
  mind_name: string | null
  description: string
  mental_ids?: number[]
  mental_details?: VithiMentalDetail[]
}

interface VithiStageInfo {
  mind_id: number | null
  mind_id_range: number[] | null
  mind_name: string | null
  description: string
  mental_ids: number[]
  mental_details: VithiMentalDetail[]
  blocked: boolean
}

const VITHI_STAGE_ORDER = [
  'pancadvaravajjana',
  'pancavinnana',
  'sampaticchana',
  'santirana',
  'votthapana',
  'javana',
  'tadalammana',
] as const

const VITHI_STAGE_EXPLANATIONS: Record<string, string> = {
  pancadvaravajjana:
    'Five-door adverting (pancadvaravajjana) is the first active citta in a sense-door cognitive process. After the bhavanga stream is arrested, this functional mind-moment "turns towards" the object that has impinged on one of the five sense doors. It is accompanied by the 7 universal cetasikas plus initial application, sustained application, determination, and energy — 11 cetasikas in total. It is kammically indeterminate (kiriya) and lasts for one thought-moment.',
  pancavinnana:
    'Sense consciousness (pancavinnana) is the bare awareness that arises through one of the five sense doors — eye-consciousness for visible forms, ear-consciousness for sounds, and so on. It is a resultant (vipaka) citta that merely cognizes the raw sense datum without any interpretation. It is accompanied only by the 7 universal cetasikas and is the simplest type of consciousness in the vithi.',
  sampaticchana:
    'Receiving consciousness (sampaticchana) immediately follows sense consciousness and "receives" the object that was just cognized. It is a rootless resultant (ahetuka vipaka) accompanied by the 7 universals plus initial application, sustained application, determination, and energy — 11 cetasikas. It performs no evaluation; it simply takes delivery of the sense data for the next stage.',
  santirana:
    'Investigating consciousness (santirana) examines and investigates the object received by the previous citta. It "turns the object over," so to speak, assessing its nature. For a desirable object it is accompanied by pleasant feeling; for an undesirable one by indifferent feeling. It has 11 or 12 cetasikas (the universals, occasionals, and sometimes rapture). It is still a resultant citta — no kamma is made here.',
  votthapana:
    'Determining consciousness (votthapana) is a crucial turning point in the cognitive process. This functional (kiriya) citta determines whether the object is desirable or undesirable and "decides" the quality of the javana cittas that will follow. Although called "determining," it operates automatically based on conditions — wise attention (yoniso manasikara) or unwise attention shapes the outcome. It has 12 cetasikas.',
  javana:
    'Impulsion (javana) is where kamma is actually made. It runs for 7 thought-moments in normal consciousness, each lasting about a billionth of a finger-snap. The javana cittas are either wholesome (kusala) or unwholesome (akusala) depending on the determining consciousness that preceded them. The first javana is weakest, the 7th is stronger, and the middle five produce the most potent kamma. This is the ethically significant phase of the entire process.',
  tadalammana:
    'Registration (tadalammana) occurs only when the object is vivid enough (atimahantarammana or mahantarammana). It "registers" or re-cognizes the object for 2 thought-moments after javana, functioning as an echo of the cognitive process before the mind sinks back into the bhavanga stream. It is a resultant (vipaka) citta and makes no new kamma. If the object is weak, registration does not arise and the bhavanga resumes immediately after javana.',
}

const SENSE_BUTTON_TO_API: Record<string, string> = {
  sound: 'ear',
  picture: 'eye',
  taste: 'tongue',
  touch: 'body',
  smell: 'nose',
}

interface VithiParams {
  desire: string
  vividity: string
  person_type: string
  yoniso_manasikara: boolean
  anusaya_dosa: number
  anusaya_lobha: number
  desirability: string
}

const SENSE_VARIANTS: Record<string, { id: string; label: string; icon: string; params: VithiParams }[]> = {
  sound: [
    { id: 'dog-barking', label: 'Dog barking', icon: '🐕', params: { desire: 'bad', vividity: 'mahantarammana', person_type: 'puthujjana', yoniso_manasikara: false, anusaya_dosa: 0.4, anusaya_lobha: 0.1, desirability: 'moderate' } },
    { id: 'beautiful-music', label: 'Beautiful music', icon: '🎵', params: { desire: 'good', vividity: 'atimahantarammana', person_type: 'puthujjana', yoniso_manasikara: false, anusaya_dosa: 0.1, anusaya_lobha: 0.4, desirability: 'excellent' } },
    { id: 'faint-whisper', label: 'Faint whisper', icon: '🤫', params: { desire: 'good', vividity: 'parittarammana', person_type: 'puthujjana', yoniso_manasikara: false, anusaya_dosa: 0.2, anusaya_lobha: 0.2, desirability: 'moderate' } },
  ],
  picture: [
    { id: 'beautiful-sunset', label: 'Beautiful sunset', icon: '🌅', params: { desire: 'good', vividity: 'atimahantarammana', person_type: 'puthujjana', yoniso_manasikara: false, anusaya_dosa: 0.1, anusaya_lobha: 0.3, desirability: 'excellent' } },
    { id: 'scary-scene', label: 'Scary scene', icon: '😱', params: { desire: 'bad', vividity: 'atimahantarammana', person_type: 'puthujjana', yoniso_manasikara: false, anusaya_dosa: 0.5, anusaya_lobha: 0.1, desirability: 'moderate' } },
    { id: 'dim-shadow', label: 'Dim shadow', icon: '👤', params: { desire: 'bad', vividity: 'atiparittarammana', person_type: 'puthujjana', yoniso_manasikara: false, anusaya_dosa: 0.3, anusaya_lobha: 0.2, desirability: 'moderate' } },
  ],
  taste: [
    { id: 'sweet-fruit', label: 'Sweet fruit', icon: '🍎', params: { desire: 'good', vividity: 'atimahantarammana', person_type: 'puthujjana', yoniso_manasikara: false, anusaya_dosa: 0.1, anusaya_lobha: 0.5, desirability: 'excellent' } },
    { id: 'bitter-medicine', label: 'Bitter medicine', icon: '💊', params: { desire: 'bad', vividity: 'mahantarammana', person_type: 'puthujjana', yoniso_manasikara: true, anusaya_dosa: 0.3, anusaya_lobha: 0.1, desirability: 'moderate' } },
    { id: 'bland-water', label: 'Bland water', icon: '💧', params: { desire: 'good', vividity: 'parittarammana', person_type: 'puthujjana', yoniso_manasikara: false, anusaya_dosa: 0.1, anusaya_lobha: 0.1, desirability: 'moderate' } },
  ],
  touch: [
    { id: 'warm-hug', label: 'Warm hug', icon: '🤗', params: { desire: 'good', vividity: 'atimahantarammana', person_type: 'puthujjana', yoniso_manasikara: false, anusaya_dosa: 0.1, anusaya_lobha: 0.4, desirability: 'excellent' } },
    { id: 'sharp-pain', label: 'Sharp pain', icon: '🩹', params: { desire: 'bad', vividity: 'atimahantarammana', person_type: 'puthujjana', yoniso_manasikara: false, anusaya_dosa: 0.6, anusaya_lobha: 0.1, desirability: 'moderate' } },
    { id: 'light-breeze', label: 'Light breeze', icon: '🍃', params: { desire: 'good', vividity: 'mahantarammana', person_type: 'puthujjana', yoniso_manasikara: false, anusaya_dosa: 0.1, anusaya_lobha: 0.2, desirability: 'moderate' } },
  ],
  smell: [
    { id: 'fresh-flowers', label: 'Fresh flowers', icon: '🌸', params: { desire: 'good', vividity: 'atimahantarammana', person_type: 'puthujjana', yoniso_manasikara: false, anusaya_dosa: 0.1, anusaya_lobha: 0.3, desirability: 'excellent' } },
    { id: 'rotten-garbage', label: 'Rotten garbage', icon: '🗑️', params: { desire: 'bad', vividity: 'atimahantarammana', person_type: 'puthujjana', yoniso_manasikara: false, anusaya_dosa: 0.5, anusaya_lobha: 0.1, desirability: 'moderate' } },
    { id: 'subtle-incense', label: 'Subtle incense', icon: '🧘', params: { desire: 'good', vividity: 'parittarammana', person_type: 'puthujjana', yoniso_manasikara: true, anusaya_dosa: 0.1, anusaya_lobha: 0.1, desirability: 'moderate' } },
  ],
}

const DEFAULT_MIND_POSITION: Vec3 = [0, -0.4, 0]
const DEFAULT_MIND_SCALE = 1.6
const XR_MIND_HEIGHT_OFFSET = 1.45
const DEFAULT_HUMAN_GROUND_Y = -2
type WorldThemeKey = 'default' | 'heaven' | 'human_world' | 'hell'

const WORLD_THEME_OPTIONS: Array<{ key: WorldThemeKey; label: string }> = [
  { key: 'default', label: 'Default' },
  { key: 'heaven', label: 'Heaven' },
  { key: 'human_world', label: 'Human World' },
  { key: 'hell', label: 'Hell' },
]
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8004'

const CODE_RUNNER_TEMPLATE = `m = Mind()
m.name = "Mind"
m.color = "#3b82f6"
m.scale = 1.6`

function convertDslToPython(dsl: string): string {
  return dsl
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed) return line
      const ctorMatch = trimmed.match(/^(\w+)\s*=\s*(\w+)\(\)$/)
      if (ctorMatch) {
        const className = ctorMatch[2]
        if (className !== 'Mind' && (className === 'Mental' || className.endsWith('Mental'))) {
          return `${ctorMatch[1]} = Mental()`
        }
      }
      return line.replace(/\.add\(/, '.append(')
    })
    .join('\n')
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed / 0x7fffffff
  }
}

const TIMELINE_STOPS: { label: string; description: string }[] = [
  { label: 'T0', description: 'Awakening — mind at rest, minimal mental activity' },
  { label: 'T1', description: 'First contact — perception and attention arise' },
  { label: 'T2', description: 'Feeling emerges — pleasant, unpleasant, or neutral' },
  { label: 'T3', description: 'Craving or aversion may arise' },
  { label: 'T4', description: 'Clinging — mental formations intensify' },
  { label: 'T5', description: 'Becoming — kamma taking shape in the mind' },
  { label: 'T6', description: 'Full cycle — mind in flux, various factors active' },
]

/** Universal 7 — common to all timeline steps: Contact, Feeling, Perception, Intention, Attention, Concentration, Life Faculty */
const UNIVERSAL_SEEDS: MentalSeed[] = [
  { name: 'Contact', color: '#a1a1aa', scale: 0.14, position: [0.0, -0.45, 0.1], detail: 'Meeting of sense base and object', modelPath: paperPlaneModel, modelTargetWorldSize: 0.08, modelOffset: { x: 0, y: -0.04, z: 0 }, variant: 'contact' },
  { name: 'Feeling', color: '#a1a1aa', scale: 0.14, position: [0.15, -0.4, 0.0], variant: 'feeling' },
  { name: 'Perception', color: '#60a5fa', scale: 0.18, position: [-0.14, 0.08, 0.18], modelPath: perceptionBowlModel, modelTargetWorldSize: 0.022, modelOffset: { x: 0, y: -0.28, z: 0.42 }, variant: 'perception' },
  { name: 'Intention', color: '#a1a1aa', scale: 0.14, position: [0.05, -0.52, 0.05], variant: 'intention' },
  { name: 'Attention', color: '#a1a1aa', scale: 0.14, position: [-0.1, -0.5, -0.15], variant: 'attention' },
  { name: 'Concentration', color: '#a1a1aa', scale: 0.14, position: [-0.18, -0.42, 0.02], variant: 'concentration' },
  { name: 'Life Faculty', color: '#a1a1aa', scale: 0.14, position: [0.18, -0.48, -0.08], variant: 'life_faculty' },
]

/** T0-specific: Initial Application, Sustained Application, Decision (Determination) */
const T0_SPECIFIC_SEEDS: MentalSeed[] = [
  { name: 'Initial Application', color: '#a1a1aa', scale: 0.14, position: [-0.22, -0.44, 0.08], variant: 'initial_application' },
  { name: 'Sustained Application', color: '#a1a1aa', scale: 0.14, position: [0.12, -0.46, -0.06], variant: 'sustained_application' },
  { name: 'Decision', color: '#a1a1aa', scale: 0.14, position: [-0.08, -0.5, 0.12], variant: 'decision' },
]

const DEFAULT_SEEDS: MentalSeed[] = [
  { name: 'Faith (Saddhā)', color: '#22c55e', scale: 0.12, position: [-0.5, 0.1, 0.1], variant: 'faith' },
  { name: 'Mindfulness (Sati)', color: '#22c55e', scale: 0.12, position: [-0.6, -0.1, -0.1], variant: 'mindfulness' },
  { name: 'Moral Shame (Hiri)', color: '#22c55e', scale: 0.12, position: [-0.4, 0.0, 0.2], variant: 'moral_shame' },
  { name: 'Moral Dread (Ottappa)', color: '#22c55e', scale: 0.12, position: [-0.5, -0.15, -0.2], variant: 'moral_dread' },
  { name: 'Non-greed (Alobha)', color: '#22c55e', scale: 0.12, position: [-0.68, 0.18, 0.18], variant: 'non_greed' },
  { name: 'Non-hatred (Adosa)', color: '#22c55e', scale: 0.12, position: [-0.42, 0.16, -0.06], variant: 'non_hatred' },
  { name: 'Equanimity (Tatramajjhattatā)', color: '#22c55e', scale: 0.12, position: [-0.56, 0.14, -0.22], variant: 'equanimity' },
  { name: 'Appreciative Joy (Muditā)', color: '#22c55e', scale: 0.12, position: [-0.74, 0.12, 0.02], variant: 'appreciative_joy' },
  { name: 'Tranquility (Mind)', color: '#22c55e', scale: 0.12, position: [-0.36, 0.10, 0.06], variant: 'tranquility_mind' },
  { name: 'Lightness (Mental Body)', color: '#22c55e', scale: 0.12, position: [-0.62, 0.06, 0.26], variant: 'lightness_body' },
  { name: 'Lightness (Mind)', color: '#22c55e', scale: 0.12, position: [-0.48, 0.04, -0.30], variant: 'lightness_mind' },
  { name: 'Pliancy (Mental Body)', color: '#22c55e', scale: 0.12, position: [-0.70, 0.02, -0.14], variant: 'pliancy_body' },
  { name: 'Pliancy (Mind)', color: '#22c55e', scale: 0.12, position: [-0.40, -0.02, 0.22], variant: 'pliancy_mind' },
  { name: 'Wieldiness (Mental Body)', color: '#22c55e', scale: 0.12, position: [-0.58, -0.06, 0.00], variant: 'wieldiness_body' },
  { name: 'Proficiency (Mind)', color: '#22c55e', scale: 0.12, position: [-0.72, -0.12, 0.12], variant: 'proficiency_mind' },
  { name: 'Rectitude (Mind)', color: '#22c55e', scale: 0.12, position: [-0.46, -0.18, -0.10], variant: 'rectitude_mind' },
  { name: 'Greed', color: '#ef4444', scale: 0.12, position: [0.48, 0.12, -0.10], variant: 'greed' },
  { name: 'Hatred', color: '#ef4444', scale: 0.12, position: [0.60, 0.10, 0.05], variant: 'hatred' },
  { name: 'Delusion', color: '#ef4444', scale: 0.12, position: [0.42, 0.06, -0.22], variant: 'delusion' },
  { name: 'Wrong View', color: '#ef4444', scale: 0.12, position: [0.54, 0.04, 0.22], variant: 'wrong_view' },
  { name: 'Conceit', color: '#ef4444', scale: 0.12, position: [0.66, 0.02, -0.06], variant: 'conceit' },
  { name: 'Doubt', color: '#ef4444', scale: 0.12, position: [0.46, -0.02, 0.12], variant: 'doubt' },
  { name: 'Restlessness', color: '#ef4444', scale: 0.12, position: [0.58, -0.04, -0.18], variant: 'restlessness' },
  { name: 'Shamelessness', color: '#ef4444', scale: 0.12, position: [0.40, -0.06, 0.02], variant: 'shamelessness' },
  { name: 'Recklessness', color: '#ef4444', scale: 0.12, position: [0.52, -0.08, -0.02], variant: 'recklessness' },
  { name: 'Sloth', color: '#ef4444', scale: 0.12, position: [0.64, -0.10, 0.14], variant: 'sloth' },
  { name: 'Torpor', color: '#ef4444', scale: 0.12, position: [0.44, -0.12, -0.12], variant: 'torpor' },
  { name: 'Worry', color: '#ef4444', scale: 0.12, position: [0.56, -0.14, 0.00], variant: 'worry' },
  { name: 'Envy', color: '#ef4444', scale: 0.12, position: [0.68, -0.16, -0.16], variant: 'envy' },
  { name: 'Stinginess', color: '#ef4444', scale: 0.12, position: [0.50, -0.18, 0.18], variant: 'stinginess' },
  { name: 'Contact', color: '#a1a1aa', scale: 0.14, position: [0.0, -0.45, 0.1], detail: 'Paper plane thought', modelPath: paperPlaneModel, modelTargetWorldSize: 0.08, modelOffset: { x: 0, y: -0.04, z: 0 }, variant: 'contact' },
  { name: 'Attention', color: '#a1a1aa', scale: 0.14, position: [-0.1, -0.5, -0.15], variant: 'attention' },
  { name: 'Feeling', color: '#a1a1aa', scale: 0.14, position: [0.15, -0.4, 0.0], variant: 'feeling' },
  { name: 'Intention', color: '#a1a1aa', scale: 0.14, position: [0.05, -0.52, 0.05], variant: 'intention' },
  { name: 'Concentration', color: '#a1a1aa', scale: 0.14, position: [-0.18, -0.42, 0.02], variant: 'concentration' },
  { name: 'Life Faculty', color: '#a1a1aa', scale: 0.14, position: [0.18, -0.48, -0.08], variant: 'life_faculty' },
  { name: 'Perception', color: '#60a5fa', scale: 0.2, position: [-0.14, 0.16, 0.24], detail: 'Perception mental with bowl model', modelPath: perceptionBowlModel, modelTargetWorldSize: 0.02, modelOffset: { x: 0, y: -0.3, z: 0.5 }, variant: 'perception' },
]

/** Seeds for T5-specific variants (energy, desire, rapture) not in DEFAULT_SEEDS */
const T5_EXTRA_SEEDS: MentalSeed[] = [
  { name: 'Energy (Vīriya)', color: '#a1a1aa', scale: 0.12, position: [0.2, -0.35, 0.1], variant: 'energy' },
  { name: 'Desire (Chanda)', color: '#a1a1aa', scale: 0.12, position: [0.25, -0.38, -0.05], variant: 'desire' },
  { name: 'Joy (Pīti)', color: '#38bdf8', scale: 0.12, position: [0.1, -0.38, 0.15], detail: 'Rapture/joyful interest', variant: 'rapture' },
]

const RAPTURE_TIMELINE_SEED: MentalSeed = {
  name: 'Joy (Pīti)',
  color: '#38bdf8',
  scale: 0.14,
  position: [0.1, -0.38, 0.15],
  detail: 'Rapture/joyful interest that refreshes the mind',
  variant: 'rapture',
}

/** Seeds for Beautiful Universals (missing body/mind), Abstinences, Illimitables, Wisdom */
const WHOLESOME_SEEDS: MentalSeed[] = [
  { name: 'Tranquility (Body)', color: '#22c55e', scale: 0.12, position: [-0.64, 0.10, -0.04], variant: 'tranquility_body' },
  { name: 'Wieldiness (Mind)', color: '#22c55e', scale: 0.12, position: [-0.52, -0.04, -0.08], variant: 'wieldiness_mind' },
  { name: 'Proficiency (Body)', color: '#22c55e', scale: 0.12, position: [-0.66, -0.08, 0.14], variant: 'proficiency_body' },
  { name: 'Rectitude (Body)', color: '#22c55e', scale: 0.12, position: [-0.44, -0.14, -0.18], variant: 'rectitude_body' },
  { name: 'Right Speech (Sammā-vācā)', color: '#22c55e', scale: 0.12, position: [-0.55, 0.08, 0.24], variant: 'right_speech' },
  { name: 'Right Action (Sammā-kammanta)', color: '#22c55e', scale: 0.12, position: [-0.58, 0.02, -0.26], variant: 'right_action' },
  { name: 'Right Livelihood (Sammā-ājīva)', color: '#22c55e', scale: 0.12, position: [-0.52, -0.06, 0.20], variant: 'right_livelihood' },
  { name: 'Compassion (Karuṇā)', color: '#22c55e', scale: 0.12, position: [-0.62, 0.12, -0.14], variant: 'compassion' },
  { name: 'Appreciative Joy (Muditā)', color: '#22c55e', scale: 0.12, position: [-0.48, 0.10, 0.08], variant: 'appreciative_joy' },
  { name: 'Wisdom (Paññā)', color: '#22c55e', scale: 0.12, position: [-0.60, 0.16, 0.00], variant: 'wisdom' },
]

function getSeedForVariant(variant: string): MentalSeed | undefined {
  const fromDefault = DEFAULT_SEEDS.find((s) => s.variant === variant)
  if (fromDefault) return fromDefault
  const fromExtra = T5_EXTRA_SEEDS.find((s) => s.variant === variant)
  if (fromExtra) return fromExtra
  return WHOLESOME_SEEDS.find((s) => s.variant === variant)
}

function createMentalFromSeed(m: MentalSeed): Mental {
  const detailProps = m.detail?.trim() ? { detail: m.detail } : {}

  if (m.variant === 'perception') {
    return new PerceptionMental({
      name: m.name,
      ...detailProps,
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
  if (m.variant === 'contact') {
    return new ContactMental({
      name: m.name,
      ...detailProps,
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
  if (m.variant === 'feeling') {
    return new FeelingMental({
      name: m.name,
      ...detailProps,
      color: m.color,
      scale: m.scale,
      position: m.position,
      labelEnabled: false,
      motionSpeed: 0.0015,
      opacity: 0.5,
    })
  }
  if (m.variant === 'intention') {
    return new IntentionMental({
      name: m.name,
      ...detailProps,
      color: m.color,
      scale: m.scale,
      position: m.position,
      labelEnabled: false,
      motionSpeed: 0.0015,
      opacity: 0.5,
    })
  }
  if (m.variant === 'attention') {
    return new AttentionMental({
      name: m.name,
      ...detailProps,
      color: m.color,
      scale: m.scale,
      position: m.position,
      labelEnabled: false,
      motionSpeed: 0.0015,
      opacity: 0.5,
    })
  }
  if (m.variant === 'concentration') {
    return new ConcentrationMental({
      name: m.name,
      ...detailProps,
      color: m.color,
      scale: m.scale,
      position: m.position,
      labelEnabled: false,
      motionSpeed: 0.0015,
      opacity: 0.5,
    })
  }
  if (m.variant === 'life_faculty') {
    return new LifeFacultyMental({
      name: m.name,
      ...detailProps,
      color: m.color,
      scale: m.scale,
      position: m.position,
      labelEnabled: false,
      motionSpeed: 0.0015,
      opacity: 0.5,
    })
  }
  if (m.variant === 'initial_application') {
    return new InitialApplicationMental({
      name: m.name,
      detail: m.detail ?? '',
      color: m.color,
      scale: m.scale,
      position: m.position,
      labelEnabled: false,
      motionSpeed: 0.0015,
      opacity: 0.5,
    })
  }
  if (m.variant === 'sustained_application') {
    return new SustainedApplicationMental({
      name: m.name,
      detail: m.detail ?? '',
      color: m.color,
      scale: m.scale,
      position: m.position,
      labelEnabled: false,
      motionSpeed: 0.0015,
      opacity: 0.5,
    })
  }
  if (m.variant === 'decision') {
    return new DeterminationMental({
      name: m.name,
      detail: m.detail ?? 'Decision / determination (adhimokkha)',
      color: m.color,
      scale: m.scale,
      position: m.position,
      labelEnabled: false,
      motionSpeed: 0.0015,
      opacity: 0.5,
    })
  }
  if (m.variant === 'energy') {
    return new EnergyMental({
      name: m.name,
      detail: m.detail ?? '',
      color: m.color,
      scale: m.scale,
      position: m.position,
      labelEnabled: false,
      motionSpeed: 0.0015,
      opacity: 0.5,
    })
  }
  if (m.variant === 'desire') {
    return new DesireMental({
      name: m.name,
      detail: m.detail ?? '',
      color: m.color,
      scale: m.scale,
      position: m.position,
      labelEnabled: false,
      motionSpeed: 0.0015,
      opacity: 0.5,
    })
  }
  if (m.variant === 'rapture') {
    return new RaptureMental({
      name: m.name,
      detail: m.detail ?? '',
      color: m.color,
      scale: m.scale,
      position: m.position,
      labelEnabled: false,
      motionSpeed: 0.0015,
      opacity: 0.5,
    })
  }
  if (m.variant === 'faith') {
    return new FaithMental({
      name: m.name,
      detail: m.detail ?? '',
      color: m.color,
      scale: m.scale,
      position: m.position,
      labelEnabled: false,
      motionSpeed: 0.002,
    })
  }
  if (m.variant === 'mindfulness') {
    return new MindfulnessMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'moral_shame') {
    return new MoralShameMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'moral_dread') {
    return new MoralDreadMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'non_greed') {
    return new NonGreedMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'non_hatred') {
    return new NonHatredMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'equanimity') {
    return new EquanimityMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'tranquility_body') {
    return new TranquilityBodyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'appreciative_joy') {
    return new AppreciativeJoyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'tranquility_mind') {
    return new TranquilityMindMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'lightness_body') {
    return new LightnessBodyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'lightness_mind') {
    return new LightnessMindMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'pliancy_body') {
    return new PliancyBodyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'pliancy_mind') {
    return new PliancyMindMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'wieldiness_body') {
    return new WieldinessBodyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'wieldiness_mind') {
    return new WieldinessMindMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'proficiency_body') {
    return new ProficiencyBodyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'proficiency_mind') {
    return new ProficiencyMindMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'rectitude_body') {
    return new RectitudeBodyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'rectitude_mind') {
    return new RectitudeMindMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'greed') {
    return new GreedMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'hatred') {
    return new HatredMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'delusion') {
    return new DelusionMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'wrong_view') {
    return new WrongViewMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'conceit') {
    return new ConceitMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'doubt') {
    return new DoubtMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'restlessness') {
    return new RestlessnessMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'shamelessness') {
    return new ShamelessnessMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'recklessness') {
    return new RecklessnessMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'sloth') {
    return new SlothMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'torpor') {
    return new TorporMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'worry') {
    return new WorryMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'envy') {
    return new EnvyMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'stinginess') {
    return new StinginessMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0 })
  }
  if (m.variant === 'right_speech') {
    return new RightSpeechMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'right_action') {
    return new RightActionMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'right_livelihood') {
    return new RightLivelihoodMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'compassion') {
    return new CompassionMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
  }
  if (m.variant === 'wisdom') {
    return new WisdomMental({ name: m.name, detail: m.detail ?? '', color: m.color, scale: m.scale, position: m.position, labelEnabled: false, motionSpeed: 0.002 })
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
  variant?:
    | 'faith'
    | 'mindfulness'
    | 'moral_shame'
    | 'moral_dread'
    | 'non_greed'
    | 'non_hatred'
    | 'equanimity'
    | 'appreciative_joy'
    | 'tranquility_body'
    | 'tranquility_mind'
    | 'lightness_body'
    | 'lightness_mind'
    | 'pliancy_body'
    | 'pliancy_mind'
    | 'wieldiness_body'
    | 'wieldiness_mind'
    | 'proficiency_body'
    | 'proficiency_mind'
    | 'rectitude_body'
    | 'rectitude_mind'
    | 'bad'
    | 'greed'
    | 'hatred'
    | 'delusion'
    | 'wrong_view'
    | 'conceit'
    | 'doubt'
    | 'restlessness'
    | 'shamelessness'
    | 'recklessness'
    | 'sloth'
    | 'torpor'
    | 'worry'
    | 'envy'
    | 'stinginess'
    | 'neutral'
    | 'perception'
    | 'contact'
    | 'feeling'
    | 'intention'
    | 'attention'
    | 'concentration'
    | 'life_faculty'
    | 'initial_application'
    | 'sustained_application'
    | 'decision'
    | 'energy'
    | 'desire'
    | 'rapture'
    | 'right_speech'
    | 'right_action'
    | 'right_livelihood'
    | 'compassion'
    | 'appreciative_joy'
    | 'wisdom'
}

type MentalVariant = NonNullable<MentalSeed['variant']>

const UNWHOLESOME_4_VARIANTS = ['delusion', 'shamelessness', 'recklessness', 'restlessness'] as const

const BEAUTIFUL_UNIVERSALS_19: MentalVariant[] = [
  'faith', 'mindfulness', 'moral_shame', 'moral_dread', 'non_greed', 'non_hatred', 'equanimity',
  'tranquility_body', 'tranquility_mind', 'lightness_body', 'lightness_mind', 'pliancy_body', 'pliancy_mind',
  'wieldiness_body', 'wieldiness_mind', 'proficiency_body', 'proficiency_mind', 'rectitude_body', 'rectitude_mind',
]

const ABSTINENCES_3: MentalVariant[] = ['right_speech', 'right_action', 'right_livelihood']

const ILLIMITABLES_2: MentalVariant[] = ['compassion', 'appreciative_joy']

const T5_MENTAL_OPTIONS: { id: string; label: string; variants: MentalVariant[] }[] = [
  { id: 'greed-1', label: 'Greed-rooted #1', variants: [...UNWHOLESOME_4_VARIANTS, 'greed', 'wrong_view'] },
  { id: 'greed-2', label: 'Greed-rooted #2', variants: [...UNWHOLESOME_4_VARIANTS, 'greed', 'conceit'] },
  { id: 'greed-3', label: 'Greed-rooted #3', variants: [...UNWHOLESOME_4_VARIANTS, 'greed', 'wrong_view', 'sloth', 'torpor'] },
  { id: 'greed-4', label: 'Greed-rooted #4', variants: [...UNWHOLESOME_4_VARIANTS, 'greed', 'wrong_view', 'conceit', 'sloth', 'torpor'] },
  { id: 'greed-5', label: 'Greed-rooted #5', variants: [...UNWHOLESOME_4_VARIANTS, 'greed', 'wrong_view'] },
  { id: 'greed-6', label: 'Greed-rooted #6', variants: [...UNWHOLESOME_4_VARIANTS, 'greed', 'conceit'] },
  { id: 'greed-7', label: 'Greed-rooted #7', variants: [...UNWHOLESOME_4_VARIANTS, 'greed', 'wrong_view', 'sloth', 'torpor'] },
  { id: 'greed-8', label: 'Greed-rooted #8', variants: [...UNWHOLESOME_4_VARIANTS, 'greed', 'conceit', 'sloth', 'torpor'] },
  { id: 'hatred-1', label: 'Hatred-rooted #1', variants: [...UNWHOLESOME_4_VARIANTS, 'worry', 'envy', 'stinginess', 'hatred'] },
  { id: 'hatred-2', label: 'Hatred-rooted #2', variants: [...UNWHOLESOME_4_VARIANTS, 'worry', 'envy', 'stinginess', 'hatred', 'sloth', 'torpor'] },
  { id: 'delusion-1', label: 'Delusion-rooted #1', variants: [...UNWHOLESOME_4_VARIANTS, 'doubt'] },
  { id: 'delusion-2', label: 'Delusion-rooted #2', variants: [...UNWHOLESOME_4_VARIANTS] },
  { id: 'smile-producing', label: 'Smile-producing', variants: ['rapture', 'desire'] },
  { id: 'great-wholesome-1', label: 'Great Wholesome pair #1', variants: [...BEAUTIFUL_UNIVERSALS_19, ...ABSTINENCES_3, ...ILLIMITABLES_2, 'wisdom', 'energy', 'rapture', 'desire'] },
  { id: 'great-wholesome-2', label: 'Great Wholesome pair #2', variants: [...BEAUTIFUL_UNIVERSALS_19, ...ABSTINENCES_3, ...ILLIMITABLES_2, 'energy', 'rapture', 'desire'] },
  { id: 'great-wholesome-3', label: 'Great Wholesome pair #3', variants: [...BEAUTIFUL_UNIVERSALS_19, ...ABSTINENCES_3, ...ILLIMITABLES_2, 'wisdom', 'energy', 'desire'] },
  { id: 'great-wholesome-4', label: 'Great Wholesome pair #4', variants: [...BEAUTIFUL_UNIVERSALS_19, ...ABSTINENCES_3, ...ILLIMITABLES_2, 'energy', 'desire'] },
  { id: 'great-functional-1', label: 'Great Functional pair #1', variants: [...BEAUTIFUL_UNIVERSALS_19, ...ILLIMITABLES_2, 'wisdom', 'energy', 'rapture', 'desire'] },
  { id: 'great-functional-2', label: 'Great Functional pair #2', variants: [...BEAUTIFUL_UNIVERSALS_19, ...ILLIMITABLES_2, 'energy', 'rapture', 'desire'] },
  { id: 'great-functional-3', label: 'Great Functional pair #3', variants: [...BEAUTIFUL_UNIVERSALS_19, ...ILLIMITABLES_2, 'wisdom', 'energy', 'desire'] },
  { id: 'great-functional-4', label: 'Great Functional pair #4', variants: [...BEAUTIFUL_UNIVERSALS_19, ...ILLIMITABLES_2, 'energy', 'desire'] },
]

const T5_CATEGORIES: { label: string; optionIds: string[] }[] = [
  { label: 'Greed-rooted', optionIds: ['greed-1', 'greed-2', 'greed-3', 'greed-4', 'greed-5', 'greed-6', 'greed-7', 'greed-8'] },
  { label: 'Hatred-rooted', optionIds: ['hatred-1', 'hatred-2'] },
  { label: 'Delusion-rooted', optionIds: ['delusion-1', 'delusion-2'] },
  { label: 'Smile-producing', optionIds: ['smile-producing'] },
  { label: 'Great Wholesome', optionIds: ['great-wholesome-1', 'great-wholesome-2', 'great-wholesome-3', 'great-wholesome-4'] },
  { label: 'Great Functional', optionIds: ['great-functional-1', 'great-functional-2', 'great-functional-3', 'great-functional-4'] },
]

function resolveSeedForVariant(variant: MentalVariant): MentalSeed {
  const fromUniversal = UNIVERSAL_SEEDS.find((s) => s.variant === variant)
  if (fromUniversal) return fromUniversal

  const fromT0Specific = T0_SPECIFIC_SEEDS.find((s) => s.variant === variant)
  if (fromT0Specific) return fromT0Specific

  if (variant === 'rapture') return RAPTURE_TIMELINE_SEED

  const fromOtherPools = getSeedForVariant(variant)
  if (fromOtherPools) return fromOtherPools

  return {
    name: variant,
    color: '#9ca3af',
    scale: 0.12,
    position: [0, 0, 0],
    variant: 'neutral',
  }
}

function hashStringToSeed(input: string): number {
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return Math.abs(hash) + 1
}

function jitterSeedForVariant(seed: MentalSeed, variant: MentalVariant): MentalSeed {
  const rng = seededRandom(7000 + hashStringToSeed(variant))
  const jitter = 0.12
  return {
    ...seed,
    position: [
      seed.position[0] + (rng() - 0.5) * jitter,
      seed.position[1] + (rng() - 0.5) * jitter,
      seed.position[2] + (rng() - 0.5) * jitter,
    ],
  }
}

function getMentalVariantsForTimelineStop(index: number, t3Happy: boolean, t5SelectedId: string | null): MentalVariant[] {
  const variants: MentalVariant[] = []
  const pushUnique = (...next: MentalVariant[]) => {
    next.forEach((variant) => {
      if (!variants.includes(variant)) variants.push(variant)
    })
  }

  // Universal 7 — exist in all timeline steps
  pushUnique(...UNIVERSAL_SEEDS.map((seed) => seed.variant).filter(Boolean) as MentalVariant[])

  if (index === 0) {
    // T0: add Initial Application, Sustained Application, Decision
    pushUnique(...T0_SPECIFIC_SEEDS.map((seed) => seed.variant).filter(Boolean) as MentalVariant[])
  } else if (index === 2) {
    // T2: add Initial Application, Sustained Application, Decision
    pushUnique(...T0_SPECIFIC_SEEDS.map((seed) => seed.variant).filter(Boolean) as MentalVariant[])
  } else if (index === 1) {
    // T1: Universal 7 only
  } else if (index === 3) {
    // T3: default like T0; if Happy selected, add Joy (Rapture) mental
    pushUnique(...T0_SPECIFIC_SEEDS.map((seed) => seed.variant).filter(Boolean) as MentalVariant[])
    if (t3Happy) pushUnique('rapture')
  } else if (index === 4) {
    // T4: same mentals as T3 with Happy
    pushUnique(...T0_SPECIFIC_SEEDS.map((seed) => seed.variant).filter(Boolean) as MentalVariant[])
    pushUnique('rapture')
  } else if (index === 5) {
    // T5: add T0 specific + mentals from selected rooted factor (single-select)
    pushUnique(...T0_SPECIFIC_SEEDS.map((seed) => seed.variant).filter(Boolean) as MentalVariant[])

    if (t5SelectedId) {
      const opt = T5_MENTAL_OPTIONS.find((o) => o.id === t5SelectedId)
      if (opt) pushUnique(...opt.variants)
    }

    // If no selection, show random (fallback)
    if (!t5SelectedId) {
      const rng = seededRandom(1000 + index)
      const universalVariants = new Set(UNIVERSAL_SEEDS.map((s) => s.variant).filter(Boolean) as MentalVariant[])
      const nonUniversal = DEFAULT_SEEDS.filter((s) => s.variant && !universalVariants.has(s.variant as MentalVariant))

      const pool = nonUniversal.map((_, i) => i)
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        ;[pool[i], pool[j]] = [pool[j], pool[i]]
      }
      const count = Math.floor(4 + rng() * 8)
      const indices = pool.slice(0, Math.min(count, pool.length))
      indices.forEach((i) => {
        const variant = nonUniversal[i]?.variant
        if (variant) pushUnique(variant as MentalVariant)
      })
    }
  } else {
    // T6: add random selection from non-universal seeds
    const rng = seededRandom(1000 + index)
    const universalVariants = new Set(UNIVERSAL_SEEDS.map((s) => s.variant).filter(Boolean) as MentalVariant[])
    const nonUniversal = DEFAULT_SEEDS.filter((s) => s.variant && !universalVariants.has(s.variant as MentalVariant))
    const pool = nonUniversal.map((_, i) => i)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[pool[i], pool[j]] = [pool[j], pool[i]]
    }
    const count = Math.floor(4 + rng() * 8)
    const indices = pool.slice(0, Math.min(count, pool.length))
    indices.forEach((i) => {
      const variant = nonUniversal[i]?.variant
      if (variant) pushUnique(variant as MentalVariant)
    })
  }

  return variants
}

type TimelineScriptPick = {
  id: string
  label: string
  timelineIndex: number
  t3Happy: boolean
  t5SelectedId: string | null
}

function dslStringifyCodeText(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

function dslFormatVec(vec: [number, number, number]): string {
  return `[${vec[0].toFixed(3)}, ${vec[1].toFixed(3)}, ${vec[2].toFixed(3)}]`
}

function dslToHexColor(color: string): string {
  const normalized = color.trim()
  if (/^#[0-9a-fA-F]{6}$/.test(normalized)) return normalized.toLowerCase()
  const parsed = Number.parseInt(normalized, 10)
  if (!Number.isNaN(parsed)) return `#${(parsed & 0xffffff).toString(16).padStart(6, '0')}`
  return '#3b82f6'
}

function buildTimelineScriptCatalog(): TimelineScriptPick[] {
  const picks: TimelineScriptPick[] = []
  for (let i = 0; i < TIMELINE_STOPS.length; i += 1) {
    const stop = TIMELINE_STOPS[i]
    const tl = stop?.label ?? `T${i}`
    if (i === 3) {
      picks.push({
        id: 't3-unhappy',
        label: `${tl} — no Joy (Pīti)`,
        timelineIndex: 3,
        t3Happy: false,
        t5SelectedId: null,
      })
      picks.push({
        id: 't3-happy',
        label: `${tl} — with Joy (Pīti)`,
        timelineIndex: 3,
        t3Happy: true,
        t5SelectedId: null,
      })
      continue
    }
    if (i === 5) {
      picks.push({
        id: 't5-no-root',
        label: `${tl} — no rooted factor (fixed RNG pool)`,
        timelineIndex: 5,
        t3Happy: false,
        t5SelectedId: null,
      })
      for (const opt of T5_MENTAL_OPTIONS) {
        picks.push({
          id: `t5-${opt.id}`,
          label: `${tl} — ${opt.label}`,
          timelineIndex: 5,
          t3Happy: false,
          t5SelectedId: opt.id,
        })
      }
      continue
    }
    picks.push({
      id: `t${i}-default`,
      label: `${tl} — ${stop?.description ?? ''}`,
      timelineIndex: i,
      t3Happy: false,
      t5SelectedId: null,
    })
  }
  return picks
}

const TIMELINE_SCRIPT_CATALOG = buildTimelineScriptCatalog()

function generateCodeRunnerDslForTimelinePick(
  pick: Pick<TimelineScriptPick, 'timelineIndex' | 't3Happy' | 't5SelectedId'>,
  sceneMind: { getName: () => string; color: number; scale: number },
): string {
  const variants = getMentalVariantsForTimelineStop(pick.timelineIndex, pick.t3Happy, pick.t5SelectedId)
  const lines: string[] = []
  const mindName = sceneMind.getName() || 'Mind'
  const mindColor = dslToHexColor(`#${(sceneMind.color & 0xffffff).toString(16).padStart(6, '0')}`)
  const mindScale = sceneMind.scale

  lines.push('m = Mind()')
  lines.push(`m.name = ${dslStringifyCodeText(mindName)}`)
  lines.push(`m.color = ${dslStringifyCodeText(mindColor)}`)
  lines.push(`m.scale = ${Number.isFinite(mindScale) ? mindScale.toFixed(3) : DEFAULT_MIND_SCALE.toFixed(3)}`)
  lines.push('')

  variants.forEach((variant, index) => {
    const seed = jitterSeedForVariant(resolveSeedForVariant(variant), variant)
    const mental = createMentalFromSeed(seed)
    try {
      const varName = `mt${index + 1}`
      const pos = mental.getPosition()
      const ctorName = (mental as unknown as { constructor?: { name?: string } }).constructor?.name ?? 'Mental'
      const scriptCtor = ctorName.endsWith('Mental') ? ctorName : 'Mental'
      lines.push(`${varName} = ${scriptCtor}()`)
      lines.push(`${varName}.name = ${dslStringifyCodeText(mental.getName())}`)
      lines.push(
        `${varName}.color = ${dslStringifyCodeText(dslToHexColor(`#${(mental.color & 0xffffff).toString(16).padStart(6, '0')}`))}`,
      )
      lines.push(`${varName}.scale = ${mental.scale.toFixed(3)}`)
      lines.push(`${varName}.position = ${dslFormatVec([pos.x, pos.y, pos.z])}`)
      lines.push(`m.add(${varName})`)
      lines.push('')
    } finally {
      mental.dispose()
    }
  })

  return lines.join('\n').trim()
}

function buildAllTimelineScriptsBundle(sceneMind: { getName: () => string; color: number; scale: number }): string {
  const parts: string[] = []
  for (const pick of TIMELINE_SCRIPT_CATALOG) {
    parts.push(`# === ${pick.label} ===`)
    parts.push(`# id: ${pick.id}`)
    parts.push(generateCodeRunnerDslForTimelinePick(pick, sceneMind))
    parts.push('')
    parts.push('')
  }
  return parts.join('\n').trim()
}

const MORPH_PARTICLE_COUNT = 2200
type MorphShapeKey = 'sphere' | 'cube' | 'human' | 'dog' | 'angel'

function makeParticleSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  const center = canvas.width / 2
  const grad = ctx.createRadialGradient(center, center, 1, center, center, center)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.9)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  tex.minFilter = THREE.LinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.generateMipmaps = false
  return tex
}

function sampleSpherePoints(count: number, radius: number): Float32Array {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(1 - 2 * Math.random())
    // Shell-only distribution to keep the particle body hollow.
    const r = radius * (0.94 + Math.random() * 0.06)
    out[i3] = r * Math.sin(phi) * Math.cos(theta)
    out[i3 + 1] = r * Math.cos(phi)
    out[i3 + 2] = r * Math.sin(phi) * Math.sin(theta)
  }
  return out
}

function sampleCubePoints(count: number, halfExtent: number): Float32Array {
  const out = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3
    // Cube shell (sample on faces only), not the solid volume.
    const face = Math.floor(Math.random() * 6)
    const u = (Math.random() * 2 - 1) * halfExtent
    const v = (Math.random() * 2 - 1) * halfExtent
    if (face === 0) {
      out[i3] = halfExtent
      out[i3 + 1] = u
      out[i3 + 2] = v
    } else if (face === 1) {
      out[i3] = -halfExtent
      out[i3 + 1] = u
      out[i3 + 2] = v
    } else if (face === 2) {
      out[i3] = u
      out[i3 + 1] = halfExtent
      out[i3 + 2] = v
    } else if (face === 3) {
      out[i3] = u
      out[i3 + 1] = -halfExtent
      out[i3 + 2] = v
    } else if (face === 4) {
      out[i3] = u
      out[i3 + 1] = v
      out[i3 + 2] = halfExtent
    } else {
      out[i3] = u
      out[i3 + 1] = v
      out[i3 + 2] = -halfExtent
    }
  }
  return out
}

function normalizePointsToHeight(points: Float32Array, targetHeight: number): Float32Array {
  const out = points.slice()
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let minZ = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  let maxZ = Number.NEGATIVE_INFINITY

  for (let i = 0; i < out.length; i += 3) {
    const x = out[i]
    const y = out[i + 1]
    const z = out[i + 2]
    if (x < minX) minX = x
    if (y < minY) minY = y
    if (z < minZ) minZ = z
    if (x > maxX) maxX = x
    if (y > maxY) maxY = y
    if (z > maxZ) maxZ = z
  }

  const centerX = (minX + maxX) / 2
  const centerZ = (minZ + maxZ) / 2
  const safeHeight = Math.max(0.0001, maxY - minY)
  const scale = targetHeight / safeHeight
  const groundOffsetY = minY * scale

  for (let i = 0; i < out.length; i += 3) {
    out[i] = (out[i] - centerX) * scale
    // Keep body feet on ground (minY = 0) instead of centering vertically.
    out[i + 1] = out[i + 1] * scale - groundOffsetY
    out[i + 2] = (out[i + 2] - centerZ) * scale
  }
  return out
}

function samplePointsFromObj(root: THREE.Object3D, count: number, targetHeight: number): Float32Array {
  const samplers: MeshSurfaceSampler[] = []
  const meshes: THREE.Mesh[] = []
  const weights: number[] = []
  root.updateMatrixWorld(true)
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh || !mesh.geometry) return
    const sampler = new MeshSurfaceSampler(mesh).build()
    samplers.push(sampler)
    meshes.push(mesh)
    const attr = mesh.geometry.getAttribute('position')
    weights.push(Math.max(1, attr?.count ?? 1))
  })

  const totalWeight = weights.reduce((acc, w) => acc + w, 0)
  if (!samplers.length || totalWeight <= 0) return sampleSpherePoints(count, targetHeight * 0.2)

  const cumulative: number[] = []
  let run = 0
  weights.forEach((w) => {
    run += w / totalWeight
    cumulative.push(run)
  })

  const temp = new THREE.Vector3()
  const world = new THREE.Vector3()
  const points = new Float32Array(count * 3)
  for (let i = 0; i < count; i += 1) {
    const pick = Math.random()
    let idx = cumulative.findIndex((c) => pick <= c)
    if (idx < 0) idx = cumulative.length - 1
    samplers[idx].sample(temp)
    world.copy(temp)
    meshes[idx].localToWorld(world)
    const i3 = i * 3
    points[i3] = world.x
    points[i3 + 1] = world.y
    points[i3 + 2] = world.z
  }
  return normalizePointsToHeight(points, targetHeight)
}

function rotatePointsAroundY(points: Float32Array, radians: number): Float32Array {
  if (Math.abs(radians) < 1e-6) return points
  const out = points.slice()
  const c = Math.cos(radians)
  const s = Math.sin(radians)
  for (let i = 0; i < out.length; i += 3) {
    const x = out[i]
    const z = out[i + 2]
    out[i] = x * c - z * s
    out[i + 2] = x * s + z * c
  }
  return out
}

function getPointsBounds(points: Float32Array): {
  minX: number
  maxX: number
  minY: number
  maxY: number
  minZ: number
  maxZ: number
} {
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  let minZ = Number.POSITIVE_INFINITY
  let maxZ = Number.NEGATIVE_INFINITY
  for (let i = 0; i < points.length; i += 3) {
    const x = points[i]
    const y = points[i + 1]
    const z = points[i + 2]
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
    if (z < minZ) minZ = z
    if (z > maxZ) maxZ = z
  }
  return { minX, maxX, minY, maxY, minZ, maxZ }
}

function HumanBody({
  mind,
  controlsRef,
  selectedShape = 'human',
  targetHeight = 2.25,
  groundY = DEFAULT_HUMAN_GROUND_Y,
  mindWorldScale = 0.1,
  mindYOffsetWorld = 0.26,
  mindZOffsetWorld = -0.06,
  humanZOffsetWorld = -0.6,
}: {
  mind: Mind
  controlsRef?: React.RefObject<OrbitControlsImpl | null>
  selectedShape?: MorphShapeKey
  targetHeight?: number
  groundY?: number
  mindWorldScale?: number
  mindYOffsetWorld?: number
  mindZOffsetWorld?: number
  humanZOffsetWorld?: number
}) {
  const pointsRef = useRef<THREE.Points | null>(null)
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)
  const currentPositionsRef = useRef<Float32Array>(new Float32Array(MORPH_PARTICLE_COUNT * 3))
  const targetPositionsRef = useRef<Float32Array | null>(null)
  const shapePointsRef = useRef<Partial<Record<MorphShapeKey, Float32Array>>>({})
  const chestLocalRef = useRef<THREE.Vector3>(new THREE.Vector3(0, targetHeight * 0.64, 0))
  const shapeChestLocalRef = useRef<Partial<Record<MorphShapeKey, THREE.Vector3>>>({})

  const spriteTexture = useMemo(() => makeParticleSpriteTexture(), [])
  const hasAppliedHumanCameraRef = useRef(false)
  const anchorWorld = useMemo(
    () => new THREE.Vector3(0, groundY, humanZOffsetWorld),
    [groundY, humanZOffsetWorld]
  )

  useLayoutEffect(() => {
    const chest = shapeChestLocalRef.current[selectedShape] ?? chestLocalRef.current
    const selectedMindScale = selectedShape === 'dog' ? Math.min(0.34, targetHeight * 0.15) : mindWorldScale
    const selectedYOffset = selectedShape === 'dog' ? 0.06 : mindYOffsetWorld
    const selectedZOffset = selectedShape === 'dog' ? mindZOffsetWorld + 0.44 : mindZOffsetWorld

    mind.setScale(selectedMindScale)
    mind.setPosition(
      anchorWorld.x + chest.x,
      anchorWorld.y + chest.y + selectedYOffset,
      anchorWorld.z + chest.z + selectedZOffset
    )

    const ctl = controlsRef?.current
    if (ctl) {
      const targetX = anchorWorld.x + chest.x
      const targetY = anchorWorld.y + chest.y + selectedYOffset
      const targetZ = anchorWorld.z + chest.z + selectedZOffset

      ctl.target.set(
        targetX,
        targetY,
        targetZ
      )

      // When entering human mode, move camera closer once so the morph body is readable.
      if (!hasAppliedHumanCameraRef.current) {
        const camera = ctl.object as THREE.PerspectiveCamera
        camera.position.set(targetX + 0.05, targetY + 0.08, targetZ + 2.75)
        hasAppliedHumanCameraRef.current = true
      }
      ctl.update()
    }
  }, [anchorWorld, controlsRef, mind, mindWorldScale, mindYOffsetWorld, mindZOffsetWorld, selectedShape, targetHeight])

  useEffect(() => {
    const sphere = normalizePointsToHeight(sampleSpherePoints(MORPH_PARTICLE_COUNT, 0.52), targetHeight)
    const cube = normalizePointsToHeight(sampleCubePoints(MORPH_PARTICLE_COUNT, 0.58), targetHeight)
    shapePointsRef.current.sphere = sphere
    shapePointsRef.current.cube = cube
    shapeChestLocalRef.current.sphere = new THREE.Vector3(0, targetHeight * 0.6, 0)
    shapeChestLocalRef.current.cube = new THREE.Vector3(0, targetHeight * 0.6, 0)
    currentPositionsRef.current.set(sphere)
    targetPositionsRef.current = sphere

    const geometry = geometryRef.current
    if (geometry) {
      const attr = geometry.getAttribute('position') as THREE.BufferAttribute | undefined
      if (attr) attr.needsUpdate = true
    }

    let cancelled = false
    const loader = new GLTFLoader()
    const loadShapeFromGltf = (shape: MorphShapeKey, url: string, onLoaded?: (points: Float32Array) => void) => {
      loader.load(
        url,
        (gltf: { scene: THREE.Object3D }) => {
          if (cancelled) return
          const sampled = samplePointsFromObj(gltf.scene, MORPH_PARTICLE_COUNT, targetHeight)
          const yawOffset = shape === 'dog' ? Math.PI / 2 : shape === 'angel' ? -Math.PI / 2 : 0
          const oriented = rotatePointsAroundY(sampled, yawOffset)
          shapePointsRef.current[shape] = oriented
          if (selectedShape === shape) {
            targetPositionsRef.current = oriented
          }
          onLoaded?.(oriented)
        },
        undefined,
        () => {
          // Keep fallback if model loading fails.
        }
      )
    }

    chestLocalRef.current.set(0, targetHeight * 0.64, 0)
    shapeChestLocalRef.current.human = chestLocalRef.current.clone()
    loadShapeFromGltf('human', `${import.meta.env.BASE_URL}assets/humanMind/human.gltf`)
    loadShapeFromGltf('dog', `${import.meta.env.BASE_URL}assets/Dog/scene.gltf`, (dog) => {
      const b = getPointsBounds(dog)
      const height = Math.max(0.0001, b.maxY - b.minY)
      const depth = Math.max(0.0001, b.maxZ - b.minZ)
      const centerX = (b.minX + b.maxX) * 0.5
      // Chest sits slightly above half-height and closer to torso center.
      shapeChestLocalRef.current.dog = new THREE.Vector3(centerX, b.minY + height * 0.57, b.minZ + depth * 0.58)
    })
    loadShapeFromGltf('angel', `${import.meta.env.BASE_URL}assets/Angel/scene.gltf`, (angel) => {
      const b = getPointsBounds(angel)
      const height = Math.max(0.0001, b.maxY - b.minY)
      const centerX = (b.minX + b.maxX) * 0.5
      shapeChestLocalRef.current.angel = new THREE.Vector3(centerX, b.minY + height * 0.68, 0)
    })

    return () => {
      cancelled = true
      spriteTexture.dispose()
    }
  }, [spriteTexture, targetHeight])

  useEffect(() => {
    const next = shapePointsRef.current[selectedShape]
    if (!next) return
    targetPositionsRef.current = next
  }, [selectedShape])

  useFrame((_, delta) => {
    const target = targetPositionsRef.current
    const current = currentPositionsRef.current
    const geometry = geometryRef.current
    const points = pointsRef.current
    if (!target || !geometry) return

    const blend = Math.min(1, delta * 2.4)
    for (let i = 0; i < current.length; i += 1) {
      current[i] += (target[i] - current[i]) * blend
    }
    const attr = geometry.getAttribute('position') as THREE.BufferAttribute | undefined
    if (attr) attr.needsUpdate = true
    geometry.computeBoundingSphere()

    if (points) points.rotation.y = 0
  })

  return (
    <group position={[anchorWorld.x, anchorWorld.y, anchorWorld.z]}>
      <points ref={pointsRef} frustumCulled={false}>
        <bufferGeometry ref={geometryRef}>
          <bufferAttribute attach="attributes-position" args={[currentPositionsRef.current, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={0xd7e0f2}
          size={0.026}
          transparent
          opacity={0.38}
          depthWrite={false}
          depthTest
          map={spriteTexture}
          alphaMap={spriteTexture}
          alphaTest={0.02}
          blending={THREE.NormalBlending}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

function MindSphere({ mind }: { mind: Mind }) {
  useFrame((_state, delta) => {
    mind.updatePhysics(delta)
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
  controlsRef,
  focusTargetRef,
  planeModelPath,
  sendMode,
  emojiMode,
  blockXrMentalPick = false,
  onSendSelection,
  onHoverSelection,
  onSendMeshSelection,
}: {
  mind: Mind
  mentals: Mental[]
  selectedMentalName: string | null
  onSelectMental: (info: InspectSelection) => void
  controlsRef?: React.RefObject<OrbitControlsImpl | null>
  focusTargetRef: React.MutableRefObject<THREE.Vector3 | null>
  planeModelPath: string
  sendMode: boolean
  emojiMode: boolean
  blockXrMentalPick?: boolean
  onSendSelection?: (info: { sender?: string | null; receiver?: string | null; status?: string }) => void
  onHoverSelection?: (objects: THREE.Object3D[]) => void
  onSendMeshSelection?: (meshes: THREE.Object3D[]) => void
}) {
  const { gl, camera, scene } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])
  const cameraWorldQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const parentWorldQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const targetLocalQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const senderRef = useRef<Mental | null>(null)
  const hoveredMeshRef = useRef<THREE.Object3D | null>(null)
  const appliedMentalsRef = useRef<Set<Mental>>(new Set())
  const hasHydratedMentalsRef = useRef(false)
  const enteringMentalsRef = useRef<Map<Mental, { elapsed: number; duration: number; startScale: number; targetScale: number }>>(new Map())
  const pendingModelLoadMentalsRef = useRef<Set<Mental>>(new Set())
  const basisPath = 'https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/'
  type DissolveBurst = {
    id: number
    positions: Float32Array
    velocities: Float32Array
    age: number
    lifetime: number
    color: number
    size: number
  }
  const [bursts, setBursts] = useState<DissolveBurst[]>([])
  const burstsRef = useRef<DissolveBurst[]>([])
  const burstPointRefs = useRef<Map<number, THREE.Object3D>>(new Map())
  const nextBurstIdRef = useRef(1)
  const dragStateRef = useRef<{
    mental: Mental
    startX: number
    startY: number
    screenPos: { x: number; y: number }
    plane: THREE.Plane
  } | null>(null)
  const dragActiveRef = useRef(false)
  const dragPointRef = useRef(new THREE.Vector3())
  const dragNormalRef = useRef(new THREE.Vector3())
  const particleSpriteTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    if (!ctx) return new THREE.CanvasTexture(canvas)

    const center = canvas.width / 2
    const grad = ctx.createRadialGradient(center, center, 2, center, center, center)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.3, 'rgba(255,255,255,0.95)')
    grad.addColorStop(0.7, 'rgba(255,255,255,0.55)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = false
    return tex
  }, [])

  useEffect(() => {
    burstsRef.current = bursts
  }, [bursts])

  const spawnDissolveBurst = useCallback((origin: THREE.Vector3, color: number) => {
    const particleCount = 46
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(1 - 2 * Math.random())
      const spread = 0.06 + Math.random() * 0.62
      const spawnRadius = Math.random() * 0.02

      const dirX = Math.sin(phi) * Math.cos(theta)
      const dirY = Math.cos(phi)
      const dirZ = Math.sin(phi) * Math.sin(theta)

      positions[i3] = origin.x + dirX * spawnRadius
      positions[i3 + 1] = origin.y + dirY * spawnRadius
      positions[i3 + 2] = origin.z + dirZ * spawnRadius

      velocities[i3] = dirX * spread
      velocities[i3 + 1] = dirY * spread
      velocities[i3 + 2] = dirZ * spread
    }

    const burst: DissolveBurst = {
      id: nextBurstIdRef.current,
      positions,
      velocities,
      age: 0,
      lifetime: 0.72 + Math.random() * 0.16,
      color,
      size: 0.042 + Math.random() * 0.02,
    }
    nextBurstIdRef.current += 1

    setBursts((prev) => {
      const next = [...prev, burst]
      burstsRef.current = next
      return next
    })
  }, [])

  const collectMentalTargets = useCallback((list: Mental[]): THREE.Object3D[] => {
    const targets: THREE.Object3D[] = []
    list.forEach((mental) => {
      const mesh = mental.getMesh()
      if (mesh) targets.push(mesh)
    })
    return targets
  }, [])

  const collectXrUiBlockers = useCallback((): THREE.Object3D[] => {
    const blockers: THREE.Object3D[] = []
    scene.traverse((obj) => {
      if (obj.userData?.xrUiBlocker) blockers.push(obj)
    })
    return blockers
  }, [scene])

  const findMentalForHitObject = useCallback((list: Mental[], hitObject: THREE.Object3D): Mental | undefined => {
    return list.find((mental) => {
      const mesh = mental.getMesh()
      if (!mesh) return false
      let node: THREE.Object3D | null = hitObject
      while (node) {
        if (node === mesh) return true
        node = node.parent
      }
      return false
    })
  }, [])

  const findTargetMeshForHitObject = useCallback((targets: THREE.Object3D[], hitObject: THREE.Object3D): THREE.Object3D | undefined => {
    return targets.find((mesh) => {
      let node: THREE.Object3D | null = hitObject
      while (node) {
        if (node === mesh) return true
        node = node.parent
      }
      return false
    })
  }, [])

  const handleMentalPick = useCallback((found: Mental, screenPos?: { x: number; y: number }) => {
    if (sendMode) {
      // In send mode: first pick selects sender, second pick sends to receiver.
      const currentSender = senderRef.current
      if (!currentSender) {
        senderRef.current = found
        const senderMesh = found.getMesh()
        // Highlight the sender when first selected.
        if (senderMesh && onSendMeshSelection) {
          onSendMeshSelection([senderMesh])
        }
        onSendSelection?.({ sender: found.getName(), receiver: null, status: 'Choose receiver' })
        return
      }
      if (currentSender === found) {
        // Same as sender; ignore to avoid self-send spam.
        return
      }
      const senderName = currentSender.getName()
      const receiverName = found.getName()
      const receiverMesh = found.getMesh()

      // Unhighlight sender and highlight only the receiver.
      if (receiverMesh && onSendMeshSelection) {
        onSendMeshSelection([receiverMesh])
      }

      onSendSelection?.({ sender: senderName, receiver: receiverName, status: 'Sending...' })
      const sendPromise = currentSender.sendDataTo(gl, found, {
        planeModelPath,
        durationMs: 1400,
        arcHeight: 0.14,
        scale: 0.1,
      })

      if (!sendPromise || typeof (sendPromise as Promise<void>).then !== 'function') {
        onSendSelection?.({ sender: senderName, receiver: receiverName, status: 'Failed (no send promise)' })
        senderRef.current = null
        return
      }

      ;(sendPromise as Promise<void>)
        .then(() => {
          onSendSelection?.({ sender: senderName, receiver: receiverName, status: 'Delivered' })
          // Keep receiver highlighted until another one is picked.
        })
        .catch((err) => {
          console.error('Failed to visualize send', err)
          onSendSelection?.({ sender: senderName, receiver: receiverName, status: 'Failed' })
          // Keep receiver highlighted even on error.
        })
      // Reset sender so next pick can choose a new sender.
      senderRef.current = null
      return
    }
    if (emojiMode) {
      found.toggleModelVisible()
      return
    }

    mind.getMentals().forEach((m) => m.setFrozen(m === found))
    found.setFrozen(true)
    const foundMesh = found.getMesh()
    const worldPos = new THREE.Vector3()
    foundMesh?.getWorldPosition(worldPos)

    // Keep selected sphere in place and expose its world position for overlay anchoring.
    if (foundMesh) {
      focusTargetRef.current = worldPos
    } else {
      focusTargetRef.current = worldPos
    }

    const idx = mind.getMentals().indexOf(found)
    onSelectMental({
      name: found.getName(),
      detail: found.getDetail(),
      type: found.getType?.() ?? 'mental',
      labelNumber: idx + 1,
      screenPosition: screenPos,
      modelPath: found.getModelPath?.(),
    })
  }, [emojiMode, focusTargetRef, gl, mind, onSelectMental, onSendMeshSelection, onSendSelection, planeModelPath, sendMode])

  useFrame(() => {
    camera.getWorldQuaternion(cameraWorldQuaternion)
    const list = mind.getMentals()
    list.forEach((mental) => {
      const mesh = mental.getMesh()
      if (!mesh) return
      const parent = mesh.parent
      if (!parent) {
        mesh.quaternion.copy(cameraWorldQuaternion)
        return
      }
      parent.getWorldQuaternion(parentWorldQuaternion)
      targetLocalQuaternion.copy(parentWorldQuaternion).invert().multiply(cameraWorldQuaternion)
      mesh.quaternion.copy(targetLocalQuaternion)
    })
  })

  useEffect(() => {
    const previous = appliedMentalsRef.current
    const next = new Set(mentals)

    previous.forEach((mental) => {
      if (next.has(mental)) return
      enteringMentalsRef.current.delete(mental)
      pendingModelLoadMentalsRef.current.delete(mental)
      const worldPos = new THREE.Vector3()
      const mesh = mental.getMesh()
      if (mesh) {
        mesh.getWorldPosition(worldPos)
      } else {
        worldPos.set(mind.position.x, mind.position.y, mind.position.z)
      }
      spawnDissolveBurst(worldPos, mental.color)
      mind.removeMental(mental)
      mental.detachModel()
    })

    next.forEach((mental) => {
      if (previous.has(mental)) return
      mind.addMental(mental)
      if (hasHydratedMentalsRef.current) {
        const targetScale = mental.scale
        const startScale = Math.max(0.01, targetScale * 0.14)
        const mesh = mental.getMesh()
        if (mesh) {
          mesh.scale.set(startScale, startScale, startScale)
          mesh.updateMatrixWorld(true)
        }
        enteringMentalsRef.current.set(mental, {
          elapsed: 0,
          duration: 0.38 + Math.random() * 0.14,
          startScale,
          targetScale,
        })
        pendingModelLoadMentalsRef.current.add(mental)
      } else {
        mental.hideAttachedFactorModel()
        mental.loadModel(gl, { basisPath }).catch((err) => {
          console.error('Failed to load mental model', err)
        })
      }
    })

    appliedMentalsRef.current = next
    hasHydratedMentalsRef.current = true
  }, [gl, mentals, mind, spawnDissolveBurst])

  useEffect(() => {
    const list = mind.getMentals()
    if (!selectedMentalName) {
      list.forEach((m) => m.hideAttachedFactorModel())
      return
    }
    const selected = list.find((m) => m.getName() === selectedMentalName)
    list.forEach((m) => {
      if (m === selected) {
        m.showAttachedFactorModel()
      } else {
        m.hideAttachedFactorModel()
      }
    })
  }, [mentals, mind, selectedMentalName])

  useEffect(() => {
    return () => {
      const applied = appliedMentalsRef.current
      applied.forEach((mental) => {
        enteringMentalsRef.current.delete(mental)
        pendingModelLoadMentalsRef.current.delete(mental)
        mind.removeMental(mental)
        mental.detachModel()
      })
      appliedMentalsRef.current = new Set()
      hasHydratedMentalsRef.current = false
    }
  }, [mind])

  useEffect(() => {
    const canvas = gl.domElement
    const DRAG_THRESHOLD_PX = 6
    const setPointerFromEvent = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }
    const handlePointerDown = (event: PointerEvent) => {
      const isRightButton = event.button === 2
      const isLeftButton = event.button === 0

      setPointerFromEvent(event)
      raycaster.setFromCamera(pointer, camera)

      const list = mind.getMentals()
      const targets = collectMentalTargets(list)

      const hits = raycaster.intersectObjects(targets, true)
      if (!hits.length) return

      const found = findMentalForHitObject(list, hits[0].object)

      if (!found) return

      const screenPos = {
        x: event.clientX + window.scrollX,
        y: event.clientY + window.scrollY,
      }

      // Keep existing pointer-down behavior for send/emoji modes.
      if (sendMode || emojiMode) {
        handleMentalPick(found, screenPos)
        return
      }

      // Keep left-click select behavior in normal mode.
      if (isLeftButton) {
        handleMentalPick(found, screenPos)
        return
      }

      // Right-click drag only in normal mode.
      if (!isRightButton) return

      const mesh = found.getMesh()
      const mindMesh = mind.getMesh()
      if (!mesh || !mindMesh) {
        handleMentalPick(found, screenPos)
        return
      }

      const worldPos = new THREE.Vector3()
      mesh.getWorldPosition(worldPos)
      camera.getWorldDirection(dragNormalRef.current)
      const dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(dragNormalRef.current, worldPos)

      dragStateRef.current = {
        mental: found,
        startX: event.clientX,
        startY: event.clientY,
        screenPos,
        plane: dragPlane,
      }
      dragActiveRef.current = false

      // Freeze while dragging so physics never fights pointer movement.
      found.setDragging(true)
      found.setFrozen(true)
      found.setVelocity(0, 0, 0)
      controlsRef?.current && (controlsRef.current.enabled = false)
      event.stopPropagation()
      event.preventDefault()
    }

    const handlePointerMove = (event: PointerEvent) => {
      const state = dragStateRef.current
      if (!state) return

      const dx = event.clientX - state.startX
      const dy = event.clientY - state.startY
      const movedEnough = Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX
      if (!dragActiveRef.current && movedEnough) {
        dragActiveRef.current = true
      }
      if (!dragActiveRef.current) return

      const mindMesh = mind.getMesh()
      if (!mindMesh) return

      setPointerFromEvent(event)
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.ray.intersectPlane(state.plane, dragPointRef.current)
      if (!hit) return

      const local = mindMesh.worldToLocal(hit.clone())
      state.mental.setPosition(local.x, local.y, local.z)
      state.mental.setVelocity(0, 0, 0)
    }

    const handlePointerUp = () => {
      const state = dragStateRef.current
      dragStateRef.current = null
      if (!state) return
      controlsRef?.current && (controlsRef.current.enabled = true)

      // If user only clicked (no drag), preserve current pointer-down pick behavior.
      if (!dragActiveRef.current) {
        state.mental.setDragging(false)
        state.mental.setFrozen(false)
        state.mental.normalizeVelocityToMotionSpeed()
        return
      }

      const position = state.mental.getPosition()
      const worldDistance = Math.sqrt(
        position.x * position.x +
        position.y * position.y +
        position.z * position.z
      ) * mind.scale
      const mindRadius = mind.getRadius()
      const mentalRadius = state.mental.getRadius() * mind.scale
      const maxDistance = Math.max(mentalRadius + 0.005, mindRadius - mentalRadius - 0.01)
      const outside = worldDistance > maxDistance + 1e-6

      if (outside) {
        state.mental.setOutsideMindPinned(true)
        state.mental.setDragging(false)
        state.mental.setFrozen(true)
        state.mental.setVelocity(0, 0, 0)
        // Outside the main sphere, show a readable floating name label.
        state.mental.setLabelEnabled(true)
        state.mental.setLabelWorldSize(0.3)
        state.mental.setLabelOffset(0.12)
        state.mental.setLabelDepthOcclusion(false)
      } else {
        state.mental.setOutsideMindPinned(false)
        state.mental.setDragging(false)
        state.mental.setFrozen(false)
        // Restore default in-sphere styling (name on sphere only).
        state.mental.setLabelEnabled(false)
        state.mental.setLabelWorldSize(0.18)
        state.mental.setLabelOffset(0.06)
        state.mental.normalizeVelocityToMotionSpeed()
      }
      dragActiveRef.current = false
    }

    const handleContextMenu = (event: MouseEvent) => {
      if (dragStateRef.current) {
        event.preventDefault()
      }
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    canvas.addEventListener('contextmenu', handleContextMenu)
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('contextmenu', handleContextMenu)
      if (controlsRef?.current) controlsRef.current.enabled = true
      if (dragStateRef.current) {
        dragStateRef.current.mental.setDragging(false)
      }
      dragStateRef.current = null
      dragActiveRef.current = false
    }
  }, [camera, collectMentalTargets, controlsRef, emojiMode, findMentalForHitObject, gl, handleMentalPick, mind, pointer, raycaster, sendMode])

  useEffect(() => {
    const xrRaycaster = new THREE.Raycaster()
    const rayOrigin = new THREE.Vector3()
    const rayDirection = new THREE.Vector3()
    const controllers = [gl.xr.getController(0), gl.xr.getController(1)]

    const handleXrSelect = (event: unknown) => {
      if (!gl.xr.isPresenting) return
      if (blockXrMentalPick) return
      // Avoid click-through: while a mental is already selected in XR,
      // panel interactions should not also re-pick underlying mentals.
      if (selectedMentalName && !sendMode && !emojiMode) return

      const controller = (event as { target?: unknown }).target as THREE.Object3D | undefined
      if (!controller) return
      const list = mind.getMentals()
      const targets = collectMentalTargets(list)
      if (!targets.length) return

      rayOrigin.setFromMatrixPosition(controller.matrixWorld)
      rayDirection.set(0, 0, -1).transformDirection(controller.matrixWorld)
      xrRaycaster.set(rayOrigin, rayDirection)

      const uiBlockers = collectXrUiBlockers()
      if (uiBlockers.length > 0) {
        const uiHits = xrRaycaster.intersectObjects(uiBlockers, true)
        if (uiHits.length > 0) return
      }

      const hits = xrRaycaster.intersectObjects(targets, true)
      if (!hits.length) return

      const found = findMentalForHitObject(list, hits[0].object)
      if (found) {
        handleMentalPick(found)
      }
    }

    controllers.forEach((controller) => {
      controller.addEventListener('selectstart', handleXrSelect as unknown as (event: { data: XRInputSource }) => void)
    })

    return () => {
      controllers.forEach((controller) => {
        controller.removeEventListener('selectstart', handleXrSelect as unknown as (event: { data: XRInputSource }) => void)
      })
    }
  }, [blockXrMentalPick, collectMentalTargets, collectXrUiBlockers, emojiMode, findMentalForHitObject, gl, handleMentalPick, mind, selectedMentalName, sendMode])

  useEffect(() => {
    if (!onHoverSelection) return
    // Disable hover highlighting when in send mode (send meshes will be highlighted instead)
    if (sendMode) return
    
    const canvas = gl.domElement

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(pointer, camera)

      const list = mind.getMentals()
      const targets = collectMentalTargets(list)

      const hits = raycaster.intersectObjects(targets, true)
      if (!hits.length) {
        if (hoveredMeshRef.current) {
          hoveredMeshRef.current = null
          onHoverSelection([])
        }
        return
      }

      const foundMesh = findTargetMeshForHitObject(targets, hits[0].object)

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
  }, [camera, collectMentalTargets, findTargetMeshForHitObject, gl, mind, onHoverSelection, pointer, raycaster, sendMode])

  useFrame(() => {
    if (!onHoverSelection || sendMode || !gl.xr.isPresenting) return

    const list = mind.getMentals()
    const targets = collectMentalTargets(list)
    if (!targets.length) {
      if (hoveredMeshRef.current) {
        hoveredMeshRef.current = null
        onHoverSelection([])
      }
      return
    }

    const xrRaycaster = new THREE.Raycaster()
    const rayOrigin = new THREE.Vector3()
    const rayDirection = new THREE.Vector3()
    const controllers = [gl.xr.getController(0), gl.xr.getController(1)]

    let closestDistance = Number.POSITIVE_INFINITY
    let hoveredTarget: THREE.Object3D | undefined

    for (const controller of controllers) {
      rayOrigin.setFromMatrixPosition(controller.matrixWorld)
      rayDirection.set(0, 0, -1).transformDirection(controller.matrixWorld)
      xrRaycaster.set(rayOrigin, rayDirection)

      const hits = xrRaycaster.intersectObjects(targets, true)
      if (!hits.length) continue

      const topHit = hits[0]
      const targetMesh = findTargetMeshForHitObject(targets, topHit.object)
      if (targetMesh && topHit.distance < closestDistance) {
        closestDistance = topHit.distance
        hoveredTarget = targetMesh
      }
    }

    if (!hoveredTarget) {
      if (hoveredMeshRef.current) {
        hoveredMeshRef.current = null
        onHoverSelection([])
      }
      return
    }

    if (hoveredTarget !== hoveredMeshRef.current) {
      hoveredMeshRef.current = hoveredTarget
      onHoverSelection([hoveredTarget])
    }
  })

  useFrame((_, delta) => {
    enteringMentalsRef.current.forEach((anim, mental) => {
      if (!appliedMentalsRef.current.has(mental)) {
        enteringMentalsRef.current.delete(mental)
        pendingModelLoadMentalsRef.current.delete(mental)
        return
      }
      anim.elapsed += delta
      const t = Math.min(1, anim.elapsed / anim.duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const nextScale = THREE.MathUtils.lerp(anim.startScale, anim.targetScale, eased)
      const mesh = mental.getMesh()
      if (mesh) {
        mesh.scale.set(nextScale, nextScale, nextScale)
        mesh.updateMatrixWorld(true)
      }
      if (t >= 1) {
        if (mesh) {
          mesh.scale.set(anim.targetScale, anim.targetScale, anim.targetScale)
          mesh.updateMatrixWorld(true)
        }
        if (pendingModelLoadMentalsRef.current.has(mental)) {
          pendingModelLoadMentalsRef.current.delete(mental)
          mental.hideAttachedFactorModel()
          mental.loadModel(gl, { basisPath }).catch((err) => {
            console.error('Failed to load mental model', err)
          })
        }
        enteringMentalsRef.current.delete(mental)
      }
    })

    const list = burstsRef.current
    if (!list.length) return

    const expiredIds: number[] = []

    list.forEach((burst) => {
      burst.age += delta
      const drag = Math.max(0, 1 - delta * 2.7)
      const gravity = 0.65
      const count = burst.positions.length / 3

      for (let i = 0; i < count; i += 1) {
        const i3 = i * 3
        burst.velocities[i3 + 1] -= gravity * delta * 0.35
        burst.positions[i3] += burst.velocities[i3] * delta
        burst.positions[i3 + 1] += burst.velocities[i3 + 1] * delta
        burst.positions[i3 + 2] += burst.velocities[i3 + 2] * delta
        burst.velocities[i3] *= drag
        burst.velocities[i3 + 1] *= drag
        burst.velocities[i3 + 2] *= drag
      }

      const points = burstPointRefs.current.get(burst.id) as THREE.Points | undefined
      if (points) {
        const geometry = points.geometry as THREE.BufferGeometry
        const positionAttr = geometry.getAttribute('position') as THREE.BufferAttribute
        if (positionAttr) positionAttr.needsUpdate = true

        const material = points.material as THREE.PointsMaterial
        if (material) {
          const t = Math.min(1, burst.age / burst.lifetime)
          material.opacity = Math.max(0, 0.95 * (1 - t))
          material.size = burst.size * (1 + t * 0.55)
          material.needsUpdate = true
        }
      }

      if (burst.age >= burst.lifetime) {
        expiredIds.push(burst.id)
      }
    })

    if (!expiredIds.length) return
    const expiredSet = new Set(expiredIds)
    setBursts((prev) => {
      const next = prev.filter((burst) => !expiredSet.has(burst.id))
      burstsRef.current = next
      return next
    })
  })

  useEffect(() => {
    if (!selectedMentalName) {
      // Unfreeze all when selection is cleared
      mind.getMentals().forEach((m) => m.setFrozen(false))
      focusTargetRef.current = null
    }
  }, [selectedMentalName, focusTargetRef])

  // Clear send highlights when send mode is exited
  useEffect(() => {
    if (!sendMode && onSendMeshSelection) {
      onSendMeshSelection([])
      senderRef.current = null
    }
  }, [sendMode, onSendMeshSelection])

  useEffect(() => {
    return () => {
      burstPointRefs.current.forEach((obj) => {
        const points = obj as THREE.Points
        points.geometry?.dispose()
        const material = points.material
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose())
        } else {
          material?.dispose()
        }
      })
      burstPointRefs.current.clear()
      burstsRef.current = []
      enteringMentalsRef.current.clear()
      pendingModelLoadMentalsRef.current.clear()
      particleSpriteTexture.dispose()
    }
  }, [particleSpriteTexture])

  return (
    <>
      {bursts.map((burst) => (
        <points
          key={burst.id}
          frustumCulled={false}
          ref={(node) => {
            if (node) burstPointRefs.current.set(burst.id, node)
            else burstPointRefs.current.delete(burst.id)
          }}
        >
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[burst.positions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color={burst.color}
            size={burst.size}
            sizeAttenuation
            map={particleSpriteTexture}
            alphaMap={particleSpriteTexture}
            alphaTest={0.08}
            transparent
            opacity={0.95}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </>
  )
}

function GroundPlane() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color={0x808080} metalness={0.1} roughness={0.5} />
    </mesh>
  )
}

function SoundReceiveEffect({
  requestId,
  mind,
  mentals,
  planeModelPath,
  onHighlightChange,
  onComplete,
  visualMode = 'sound',
}: {
  requestId: number
  mind: Mind
  mentals: Mental[]
  planeModelPath: string
  onHighlightChange?: (objects: THREE.Object3D[]) => void
  onComplete?: () => void
  visualMode?: 'sound' | 'scene'
}) {
  const { gl } = useThree()
  const isSceneMode = visualMode === 'scene'
  const earSideGap = isSceneMode ? 0.03 : 0.05
  const earHeightOffset = isSceneMode ? 0.08 : 0
  const earDepthOffset = isSceneMode ? 0.11 : 0.02
  const earRotationXDeg = 0
  const earRotationYDeg = 270
  const earRotationZDeg = 0
  const [active, setActive] = useState(false)
  const [earVisible, setEarVisible] = useState(false)
  const earModelRef = useRef<THREE.Object3D | null>(null)
  const senderMentalRef = useRef<Mental | null>(null)
  const sendStartedRef = useRef(false)
  const runTokenRef = useRef(0)
  const contactRef = useRef<Mental | null>(null)
  const phaseRef = useRef<'idle' | 'move_contact' | 'sending'>('idle')
  const phaseElapsedRef = useRef(0)
  const contactStartRef = useRef<THREE.Vector3>(new THREE.Vector3())
  const contactTargetRef = useRef<THREE.Vector3>(new THREE.Vector3())
  const mentalOriginalRef = useRef<Map<Mental, { pos: THREE.Vector3; frozen: boolean }>>(new Map())
  const mentalMoveStartRef = useRef<Map<Mental, THREE.Vector3>>(new Map())
  const mentalMoveTargetRef = useRef<Map<Mental, THREE.Vector3>>(new Map())
  const planeStartRef = useRef<THREE.Vector3>(new THREE.Vector3())
  const tempVecRef = useRef<THREE.Vector3>(new THREE.Vector3())
  const prevRequestRef = useRef(0)
  const earWorld = useMemo(() => new THREE.Vector3(), [])

  useEffect(() => {
    if (isSceneMode) {
      earModelRef.current = null
      return
    }
    let cancelled = false
    const loader = new GLTFLoader()
    const earCandidates = [
      `${import.meta.env.BASE_URL}assests/human_ear_model/scene.gltf`,
      `${import.meta.env.BASE_URL}assets/human_ear_model/scene.gltf`,
      `${import.meta.env.BASE_URL}assests/human_ear_model.gltf`,
      `${import.meta.env.BASE_URL}assets/human_ear_model.gltf`,
      `${import.meta.env.BASE_URL}assests/human_ear_model.glb`,
      `${import.meta.env.BASE_URL}assets/human_ear_model.glb`,
    ]

    const tryLoadEar = (index: number) => {
      if (cancelled || index >= earCandidates.length) return
      loader.load(
        earCandidates[index],
        (gltf: { scene: THREE.Object3D }) => {
          if (cancelled) return
          const root = gltf.scene.clone(true)
          root.scale.setScalar(0.12)
          root.rotation.set(
            THREE.MathUtils.degToRad(earRotationXDeg),
            THREE.MathUtils.degToRad(earRotationYDeg),
            THREE.MathUtils.degToRad(earRotationZDeg)
          )
          earModelRef.current = root
        },
        undefined,
        () => {
          if (cancelled) return
          tryLoadEar(index + 1)
        }
      )
    }

    tryLoadEar(0)
    return () => {
      cancelled = true
      earModelRef.current = null
    }
  }, [isSceneMode])

  useEffect(() => {
    if (requestId <= 0 || requestId === prevRequestRef.current) return
    prevRequestRef.current = requestId
    runTokenRef.current += 1

    const contact =
      mentals.find((m) => m.getName().trim().toLowerCase() === 'contact') ||
      mentals.find((m) => m.getName().toLowerCase().includes('contact')) ||
      null
    if (!contact) {
      onComplete?.()
      return
    }

    contactRef.current = contact
    mentalOriginalRef.current.clear()
    mentalMoveStartRef.current.clear()
    mentalMoveTargetRef.current.clear()

    // Freeze and stage all mentals so the receive animation has clear focus.
    mentals.forEach((m) => {
      const p = m.getPosition()
      mentalOriginalRef.current.set(m, {
        pos: new THREE.Vector3(p.x, p.y, p.z),
        frozen: m.isFrozen?.() ?? false,
      })
      m.setFrozen(true)
      m.setVelocity(0, 0, 0)
      mentalMoveStartRef.current.set(m, new THREE.Vector3(p.x, p.y, p.z))
      // Keep default/random spread in place; only Contact will move.
      if (m !== contact) return
    })

    const start = contact.getPosition()
    contactStartRef.current.set(start.x, start.y, start.z)
    // Bring Contact close to right side (ear side) of mind, still inside sphere.
    contactTargetRef.current.set(0.78, 0.06, 0.02)
    mentalMoveTargetRef.current.set(contact, contactTargetRef.current.clone())

    const baseX = mind.position.x
    const baseY = mind.position.y
    const baseZ = mind.position.z
    const radius = Math.max(1.1, mind.scale)
    if (isSceneMode) {
      // Scene mode: place two eyes in front of the mind sphere.
      earWorld.set(baseX, baseY + 0.24, baseZ + radius + 0.12)
      // Start farther away so the incoming scene-data flight is obvious.
      planeStartRef.current.copy(earWorld).add(new THREE.Vector3(0, 0.16, 2.6))
    } else {
      earWorld.set(baseX + radius + earSideGap, baseY + earHeightOffset, baseZ + earDepthOffset)
      planeStartRef.current.copy(earWorld).add(new THREE.Vector3(0.46, 0.04, 0.04))
    }

    phaseRef.current = 'move_contact'
    phaseElapsedRef.current = 0
    sendStartedRef.current = false
    setEarVisible(true)
    setActive(true)
  }, [earDepthOffset, earHeightOffset, earSideGap, earWorld, isSceneMode, mentals, mind.position.x, mind.position.y, mind.position.z, mind.scale, onComplete, onHighlightChange, requestId])

  const resolveMentalByName = useCallback(
    (name: string): Mental | null => {
      const key = name.trim().toLowerCase()
      if (!key) return null
      const exact = mentals.find((m) => m.getName().trim().toLowerCase() === key)
      if (exact) return exact
      if (key.includes('decision') || key.includes('determination')) {
        return (
          mentals.find((m) => {
            const n = m.getName().toLowerCase()
            return n.includes('decision') || n.includes('determination')
          }) ?? null
        )
      }
      return mentals.find((m) => m.getName().toLowerCase().includes(key)) ?? null
    },
    [mentals]
  )

  const cleanupAndRestore = useCallback(() => {
    mentalOriginalRef.current.forEach((state, mental) => {
      mental.setPosition(state.pos.x, state.pos.y, state.pos.z)
      mental.setFrozen(state.frozen)
    })
    mentalOriginalRef.current.clear()
    mentalMoveStartRef.current.clear()
    mentalMoveTargetRef.current.clear()
    const sender = senderMentalRef.current
    if (sender) {
      const senderMesh = sender.getMesh()
      if (senderMesh?.parent) senderMesh.parent.remove(senderMesh)
      sender.dispose()
      senderMentalRef.current = null
    }
    onHighlightChange?.([])
    setEarVisible(false)
    setActive(false)
    phaseRef.current = 'idle'
    onComplete?.()
  }, [onComplete, onHighlightChange])

  const sendFromWorldToMental = useCallback(
    async (startWorld: THREE.Vector3, target: Mental): Promise<void> => {
      const targetMesh = target.getMesh()
      const parent = targetMesh?.parent
      if (!targetMesh || !parent) return

      const sender = new Mental({
        name: isSceneMode ? 'Scene Carrier' : 'Sound Carrier',
        color: '#ffffff',
        scale: 0.03,
        transparent: true,
        opacity: 0,
        motionSpeed: 0,
        labelEnabled: false,
      })
      sender.setFrozen(true)
      const senderMesh = sender.getMesh()
      if (!senderMesh) {
        sender.dispose()
        return
      }
      const startLocal = parent.worldToLocal(startWorld.clone())
      sender.setPosition(startLocal.x, startLocal.y, startLocal.z)
      senderMesh.visible = false
      parent.add(senderMesh)
      senderMentalRef.current = sender
      try {
        await sender.sendDataTo(gl, target, {
          planeModelPath,
          durationMs: 1050,
          arcHeight: 0.12,
          scale: 0.1,
        })
      } finally {
        const senderMeshNow = sender.getMesh()
        if (senderMeshNow?.parent) senderMeshNow.parent.remove(senderMeshNow)
        sender.dispose()
        if (senderMentalRef.current === sender) senderMentalRef.current = null
      }
    },
    [gl, isSceneMode, planeModelPath]
  )

  const sendFromWorldToWorld = useCallback(
    async (startWorld: THREE.Vector3, endWorld: THREE.Vector3): Promise<void> => {
      const parent = mind.getMesh()
      if (!parent) return

      const sender = new Mental({
        name: isSceneMode ? 'Scene Carrier' : 'Sound Carrier',
        color: '#ffffff',
        scale: 0.03,
        transparent: true,
        opacity: 0,
        motionSpeed: 0,
        labelEnabled: false,
      })
      const receiver = new Mental({
        name: 'Receiver Anchor',
        color: '#ffffff',
        scale: 0.03,
        transparent: true,
        opacity: 0,
        motionSpeed: 0,
        labelEnabled: false,
      })
      sender.setFrozen(true)
      receiver.setFrozen(true)

      const senderMesh = sender.getMesh()
      const receiverMesh = receiver.getMesh()
      if (!senderMesh || !receiverMesh) {
        sender.dispose()
        receiver.dispose()
        return
      }

      const startLocal = parent.worldToLocal(startWorld.clone())
      const endLocal = parent.worldToLocal(endWorld.clone())
      sender.setPosition(startLocal.x, startLocal.y, startLocal.z)
      receiver.setPosition(endLocal.x, endLocal.y, endLocal.z)
      senderMesh.visible = false
      receiverMesh.visible = false
      parent.add(senderMesh)
      parent.add(receiverMesh)

      try {
        await sender.sendDataTo(gl, receiver, {
          planeModelPath,
          durationMs: 980,
          arcHeight: 0.12,
          scale: 0.1,
        })
      } finally {
        if (senderMesh.parent) senderMesh.parent.remove(senderMesh)
        if (receiverMesh.parent) receiverMesh.parent.remove(receiverMesh)
        sender.dispose()
        receiver.dispose()
      }
    },
    [gl, isSceneMode, mind, planeModelPath]
  )

  const sendMentalToMental = useCallback(
    async (sender: Mental, receiver: Mental): Promise<void> => {
      await sender.sendDataTo(gl, receiver, {
        planeModelPath,
        durationMs: 980,
        arcHeight: 0.12,
        scale: 0.1,
      })
    },
    [gl, planeModelPath]
  )

  useFrame((_, delta) => {
    if (!active) return
    const contact = contactRef.current
    if (!contact) return

    phaseElapsedRef.current += delta

    if (phaseRef.current === 'move_contact') {
      const t = THREE.MathUtils.clamp(phaseElapsedRef.current / 0.75, 0, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const p = tempVecRef.current
      p.copy(contactStartRef.current).lerp(contactTargetRef.current, eased)
      contact.setPosition(p.x, p.y, p.z)
      if (t >= 1) {
        const mesh = contact.getMesh()
        onHighlightChange?.(mesh ? [mesh] : [])
        phaseRef.current = 'sending'
      }
      return
    }

    if (phaseRef.current === 'sending') {
      if (sendStartedRef.current) return
      sendStartedRef.current = true
      const runToken = runTokenRef.current
      const runSequence = async () => {
        try {
          const chain = [
            { mental: 'Contact', line: isSceneMode ? 'Seeing the scene. Contact: Visual form meets the eye and initiates awareness.' : 'Hearing the music. Contact: Sound meets the ear and initiates awareness.' },
            { mental: 'Attention', line: 'Turning toward the sound. Attention: The mind focuses on the music.' },
            { mental: 'Feeling', line: 'Feeling it is pleasant. Feeling: A pleasant emotional tone arises.' },
            { mental: 'Perception', line: 'Recognizing the song. Perception: The mind identifies it as a familiar liked song.' },
            { mental: 'Initial Application', line: 'Beginning to focus. Initial Application: The mind applies itself to the sound.' },
            { mental: 'Sustained Application', line: 'Staying with the sound. Sustained Application: The mind remains continuously on it.' },
            { mental: 'Intention', line: 'Wanting to keep listening and sing along. Intention: Drives the urge to act.' },
            { mental: 'Decision', line: 'Choosing to continue listening. Decision: Finalizes the choice.' },
            { mental: 'Concentration', line: 'Fully absorbed in the music. Concentration: The mind becomes stable and unified.' },
            { mental: 'Life Faculty', line: 'Mental process continues. Life Faculty: Sustains all mental factors in that moment.' },
          ] as const

          const contactMental = resolveMentalByName('Contact')
          if (!contactMental) {
            cleanupAndRestore()
            return
          }
          const contactMesh = contactMental.getMesh()
          onHighlightChange?.(contactMesh ? [contactMesh] : [])

          if (isSceneMode) {
            // Scene mode: travel from afar -> eyes -> Contact.
            await sendFromWorldToWorld(planeStartRef.current, earWorld.clone())
            await Promise.all([
              speakNarration(chain[0].line),
              sendFromWorldToMental(earWorld.clone(), contactMental),
            ])
          } else {
            await Promise.all([
              speakNarration(chain[0].line),
              sendFromWorldToMental(planeStartRef.current, contactMental),
            ])
          }
          if (runToken !== runTokenRef.current) return

          for (let i = 1; i < chain.length; i += 1) {
            const prev = resolveMentalByName(chain[i - 1].mental)
            const next = resolveMentalByName(chain[i].mental)
            if (!prev || !next) continue
            const mesh = next.getMesh()
            onHighlightChange?.(mesh ? [mesh] : [])
            await Promise.all([
              speakNarration(chain[i].line),
              sendMentalToMental(prev, next),
            ])
            if (runToken !== runTokenRef.current) return
          }
        } catch {
          // keep cleanup flow below
        } finally {
          if (runToken !== runTokenRef.current) return
          cleanupAndRestore()
        }
      }
      void runSequence()
    }
  })

  useFrame(() => {
    if (!earVisible) return
    const radius = Math.max(1.1, mind.scale)
    if (isSceneMode) {
      earWorld.set(
        mind.position.x,
        mind.position.y + 0.24,
        mind.position.z + radius + 0.12
      )
    } else {
      earWorld.set(
        mind.position.x + radius + earSideGap,
        mind.position.y + earHeightOffset,
        mind.position.z + earDepthOffset
      )
    }
  })

  useEffect(() => {
    return () => {
      runTokenRef.current += 1
      mentalOriginalRef.current.forEach((state, mental) => {
        mental.setPosition(state.pos.x, state.pos.y, state.pos.z)
        mental.setFrozen(state.frozen)
      })
      onHighlightChange?.([])
      const sender = senderMentalRef.current
      if (!sender) return
      const senderMesh = sender.getMesh()
      if (senderMesh?.parent) senderMesh.parent.remove(senderMesh)
      sender.dispose()
      senderMentalRef.current = null
    }
  }, [onHighlightChange])

  return (
    <>
      {earVisible && (
        <group position={[earWorld.x, earWorld.y, earWorld.z]}>
          {!isSceneMode && earModelRef.current ? (
            <primitive object={earModelRef.current} />
          ) : (
            isSceneMode ? (
              <>
                <group position={[-0.18, 0, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.15, 28, 28]} />
                    <meshStandardMaterial color={0xffffff} metalness={0.03} roughness={0.32} />
                  </mesh>
                  <mesh position={[0, 0, 0.11]}>
                    <ringGeometry args={[0.13, 0.165, 48]} />
                    <meshBasicMaterial color={0x111111} side={THREE.DoubleSide} />
                  </mesh>
                  <mesh position={[0, 0, 0.14]}>
                    <sphereGeometry args={[0.038, 20, 20]} />
                    <meshStandardMaterial color={0x1f2937} metalness={0.15} roughness={0.45} />
                  </mesh>
                </group>
                <group position={[0.18, 0, 0]}>
                  <mesh>
                    <sphereGeometry args={[0.15, 28, 28]} />
                    <meshStandardMaterial color={0xffffff} metalness={0.03} roughness={0.32} />
                  </mesh>
                  <mesh position={[0, 0, 0.11]}>
                    <ringGeometry args={[0.13, 0.165, 48]} />
                    <meshBasicMaterial color={0x111111} side={THREE.DoubleSide} />
                  </mesh>
                  <mesh position={[0, 0, 0.14]}>
                    <sphereGeometry args={[0.038, 20, 20]} />
                    <meshStandardMaterial color={0x1f2937} metalness={0.15} roughness={0.45} />
                  </mesh>
                </group>
              </>
            ) : (
              <>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <torusGeometry args={[0.15, 0.05, 14, 36, Math.PI * 1.5]} />
                  <meshStandardMaterial color={0xf5c0a5} metalness={0.05} roughness={0.7} />
                </mesh>
                <mesh position={[0.04, -0.06, 0]}>
                  <sphereGeometry args={[0.05, 16, 16]} />
                  <meshStandardMaterial color={0xedb79a} metalness={0.04} roughness={0.72} />
                </mesh>
              </>
            )
          )}
        </group>
      )}
    </>
  )
}

function MindZoneBoundaries({ mind }: { mind: Mind }) {
  const mindRadius = mind.getRadius()
  const mindPosition = mind.position
  const mindScale = mind.scale
  
  // Local space radius (before scaling)
  const localRadius = mindRadius / mindScale
  const neutralBoundaryY = -0.3 // Local space boundary for neutral zone
  
  // Calculate circle radius at the neutral boundary height
  const horizontalCircleRadius = Math.sqrt(Math.max(0, localRadius * localRadius - neutralBoundaryY * neutralBoundaryY))

  return (
    <group position={[mindPosition.x, mindPosition.y, mindPosition.z]}>
      {/* Vertical plane (YZ plane) separating good (left, X<0) and bad (right, X>0) zones */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[localRadius * 2.5, localRadius * 2.5]} />
        <meshBasicMaterial
          color={0x00ff00}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Vertical plane wireframe for better visibility */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[localRadius * 2.5, localRadius * 2.5]} />
        <meshBasicMaterial
          color={0x00ff00}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>
      
      {/* Horizontal plane (XZ plane) separating neutral (below, Y<neutralBoundaryY) from good/bad (above) zones */}
      <mesh position={[0, neutralBoundaryY * mindScale, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[localRadius * 2.5, localRadius * 2.5]} />
        <meshBasicMaterial
          color={0xff0000}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Horizontal plane wireframe for better visibility */}
      <mesh position={[0, neutralBoundaryY * mindScale, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[localRadius * 2.5, localRadius * 2.5]} />
        <meshBasicMaterial
          color={0xff0000}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>
      
      {/* Great circle on sphere surface for left/right boundary (vertical circle in YZ plane) */}
      <lineSegments rotation={[Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[new THREE.CircleGeometry(localRadius, 64)]} />
        <lineBasicMaterial color={0x00ff00} linewidth={3} />
      </lineSegments>
      
      {/* Horizontal circle on sphere surface for neutral boundary */}
      {horizontalCircleRadius > 0 && (
        <lineSegments position={[0, neutralBoundaryY * mindScale, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <edgesGeometry args={[new THREE.CircleGeometry(horizontalCircleRadius, 64)]} />
          <lineBasicMaterial color={0xff0000} linewidth={3} />
        </lineSegments>
      )}
    </group>
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

function XROccludedConnector({
  focusTargetRef,
  selectedMentalName,
  enabled,
  panelWorldAnchorRef,
}: {
  focusTargetRef: React.MutableRefObject<THREE.Vector3 | null>
  selectedMentalName: string | null
  enabled: boolean
  panelWorldAnchorRef: React.MutableRefObject<THREE.Vector3>
}) {
  const panelAnchor = useRef(new THREE.Vector3())
  const lineObject = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
    const material = new THREE.LineBasicMaterial({
      color: 0x7aa2ff,
      transparent: true,
      opacity: 0.9,
      depthTest: true,
      depthWrite: false,
    })
    const line = new THREE.Line(geometry, material)
    line.frustumCulled = false
    line.visible = false
    return line
  }, [])

  useEffect(() => {
    return () => {
      lineObject.geometry.dispose()
      const material = lineObject.material
      if (Array.isArray(material)) material.forEach((m) => m.dispose())
      else material.dispose()
    }
  }, [lineObject])

  useFrame(() => {
    if (!enabled || !selectedMentalName || !focusTargetRef.current) {
      lineObject.visible = false
      return
    }

    lineObject.visible = true
    panelAnchor.current.copy(panelWorldAnchorRef.current)

    const geometry = lineObject.geometry as THREE.BufferGeometry
    const position = geometry.getAttribute('position') as THREE.BufferAttribute
    position.setXYZ(0, focusTargetRef.current.x, focusTargetRef.current.y, focusTargetRef.current.z)
    position.setXYZ(1, panelAnchor.current.x, panelAnchor.current.y, panelAnchor.current.z)
    position.needsUpdate = true
    geometry.computeBoundingSphere()
  })

  return <primitive object={lineObject} />
}

const TIMELINE_COLORS = ['#5D8DE0', '#38B2D1', '#4CAF50', '#FFC107', '#FF9800', '#F44336', '#1e3a5f']

const TIMELINE_ICONS = ['⊙', '✦', '◉', '▤', '⚠', '✋', '◈']

const T0_SENSE_OPTIONS = [
  { id: 'sound', label: 'Sound', icon: '🔊' },
  { id: 'picture', label: 'Picture', icon: '🖼️' },
  { id: 'taste', label: 'Taste', icon: '👅' },
  { id: 'touch', label: 'Touch', icon: '✋' },
  { id: 'smell', label: 'Smell', icon: '👃' },
] as const

function TimelineCanvas({
  stops,
  selectedIndex,
  onSelect,
  colors,
  t3HappySelected,
  onT3HappyChange,
  t5SelectedId,
  onT5Change,
  onSenseSelect,
  hasContactMental,
  personType,
  onPersonTypeChange,
  vithiCurrentEvent,
  timelineMode,
  onTimelineModeChange,
  slideshowPaused,
  onSlideshowPausedChange,
  vithiStageData,
}: {
  stops: Array<{ label: string; description: string }>
  selectedIndex: number
  onSelect: (i: number) => void
  colors: string[]
  t3HappySelected?: boolean
  onT3HappyChange?: (selected: boolean) => void
  t5SelectedId?: string | null
  onT5Change?: (id: string | null) => void
  onSenseSelect?: (senseId: string, params: VithiParams) => void
  hasContactMental?: boolean
  personType?: PersonType
  onPersonTypeChange?: (pt: PersonType) => void
  vithiCurrentEvent?: VithiEvent | null
  timelineMode?: 'manual' | 'slideshow'
  onTimelineModeChange?: (mode: 'manual' | 'slideshow') => void
  slideshowPaused?: boolean
  onSlideshowPausedChange?: (paused: boolean) => void
  vithiStageData?: Map<number, VithiStageInfo> | null
}) {
  const [showDetail, setShowDetail] = useState(false)
  const [detailPanelOpen, setDetailPanelOpen] = useState(true)
  const [selectedSense, setSelectedSense] = useState<string>('')
  const railRef = useRef<HTMLDivElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const maxIndex = Math.max(stops.length - 1, 0)
  const [pinRatio, setPinRatio] = useState(maxIndex > 0 ? selectedIndex / maxIndex : 0)
  const activeStop = stops[selectedIndex] ?? stops[0]

  useEffect(() => {
    if (isDragging) return
    if (maxIndex <= 0) {
      setPinRatio(0)
      return
    }
    setPinRatio(Math.min(1, Math.max(0, selectedIndex / maxIndex)))
  }, [isDragging, maxIndex, selectedIndex])

  const selectFromClientY = useCallback(
    (clientY: number) => {
      const rail = railRef.current
      if (!rail || maxIndex <= 0) return
      const rect = rail.getBoundingClientRect()
      const ratio = (clientY - rect.top) / rect.height
      const clamped = Math.min(1, Math.max(0, ratio))
      setPinRatio(clamped)
      const nextIndex = Math.floor(clamped * maxIndex + Number.EPSILON)
      if (nextIndex !== selectedIndex) onSelect(nextIndex)
    },
    [maxIndex, onSelect, selectedIndex]
  )

  useEffect(() => {
    if (!isDragging) return
    const handlePointerMove = (e: PointerEvent) => {
      selectFromClientY(e.clientY)
    }
    const handlePointerUp = () => {
      setIsDragging(false)
    }
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, selectFromClientY])

  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
    selectFromClientY(e.clientY)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: detailPanelOpen ? 18 : 10 }}>
      {detailPanelOpen && (
        <div
          style={{
            width: 360,
            maxHeight: 520,
            overflowY: 'auto',
            background: 'rgba(17, 24, 39, 0.9)',
            color: '#e5e7eb',
            borderRadius: 14,
            boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '14px 16px',
            pointerEvents: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: colors[selectedIndex % colors.length],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 15,
                  flexShrink: 0,
                }}
              >
                {TIMELINE_ICONS[selectedIndex % TIMELINE_ICONS.length]}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#f8fafc' }}>{activeStop.label}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Cognitive Timeline</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDetailPanelOpen(false)}
              style={{
                padding: '5px 10px',
                border: '1px solid rgba(148, 163, 184, 0.6)',
                borderRadius: 8,
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#cbd5e1',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.45, color: '#9ca3af' }}>{activeStop.description}</p>

          {vithiStageData && vithiStageData.has(selectedIndex) && (
            (() => {
              const stage = vithiStageData.get(selectedIndex)!
              return stage.blocked ? (
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#6b7280', fontStyle: 'italic' }}>No citta at this stage</p>
              ) : (
                <div style={{ margin: '8px 0 0', fontSize: 12, color: '#a5b4fc' }}>
                  {stage.mental_details.length} cetasika(s): {stage.mental_details.map(d => d.name).join(', ')}
                </div>
              )
            })()
          )}

          {timelineMode === 'slideshow' && selectedIndex > 0 && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                onClick={() => onSlideshowPausedChange?.(!slideshowPaused)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 6,
                  border: '1px solid rgba(148,163,184,0.4)',
                  background: slideshowPaused ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)',
                  color: slideshowPaused ? '#86efac' : '#fca5a5',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {slideshowPaused ? '▶ Play' : '⏸ Pause'}
              </button>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                {slideshowPaused ? 'Paused' : 'Auto-advance every 10s'}
              </span>
            </div>
          )}

          {selectedIndex === 0 && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Person type</label>
              <select
                value={personType ?? 'puthujjana'}
                onChange={(e) => onPersonTypeChange?.(e.target.value as PersonType)}
                style={{
                  fontSize: 12,
                  padding: '4px 8px',
                  borderRadius: 8,
                  border: '1px solid rgba(148, 163, 184, 0.4)',
                  background: 'rgba(30, 41, 59, 0.85)',
                  color: '#e5e7eb',
                  cursor: 'pointer',
                }}
              >
                {PERSON_TYPES.map((pt) => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            </div>
          )}
          {selectedIndex === 0 && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <label style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>Timeline mode</label>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['manual', 'slideshow'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => onTimelineModeChange?.(m)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 6,
                      border: timelineMode === m ? '1.5px solid #60a5fa' : '1px solid rgba(148,163,184,0.4)',
                      background: timelineMode === m ? 'rgba(59,130,246,0.25)' : 'rgba(30,41,59,0.65)',
                      color: timelineMode === m ? '#93c5fd' : '#e5e7eb',
                      fontSize: 11,
                      fontWeight: timelineMode === m ? 600 : 400,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
          {selectedIndex === 0 && !hasContactMental && (
            <p style={{ margin: '10px 0 0', fontSize: 12, color: '#f87171' }}>
              Create Contact (Phassa) mental via code runner to unlock sense doors
            </p>
          )}
          {selectedIndex === 0 && hasContactMental && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
                Choose sense door
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {T0_SENSE_OPTIONS.map((opt) => {
                  const isSelected = selectedSense === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedSense(isSelected ? '' : opt.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 10px',
                        borderRadius: 10,
                        border: isSelected ? '2px solid #60a5fa' : '1px solid rgba(148, 163, 184, 0.4)',
                        background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(30, 41, 59, 0.65)',
                        color: isSelected ? '#93c5fd' : '#e5e7eb',
                        fontSize: 12,
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                      }}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>
              {selectedSense && SENSE_VARIANTS[selectedSense] && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>
                    What kind?
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {SENSE_VARIANTS[selectedSense].map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => onSenseSelect?.(selectedSense, v.params)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '7px 12px',
                          borderRadius: 10,
                          border: '1px solid rgba(148, 163, 184, 0.3)',
                          background: 'rgba(30, 41, 59, 0.65)',
                          color: '#e5e7eb',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{v.icon}</span>
                        <span>{v.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {vithiCurrentEvent && (
            <div style={{
              marginTop: 12, padding: '10px 12px', borderRadius: 10,
              background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(96, 165, 250, 0.4)',
            }}>
              <div style={{ fontSize: 10, color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                {vithiCurrentEvent.stage.replace(/_/g, ' ')}
              </div>
              <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, marginTop: 3 }}>
                {vithiCurrentEvent.mind_name || `Citta ${vithiCurrentEvent.mind_id ?? '?'}`}
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                {vithiCurrentEvent.description}
              </div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>
                Step {vithiCurrentEvent.order}
              </div>
            </div>
          )}

          {selectedIndex === 3 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
                Add option
              </div>
              <button
                type="button"
                onClick={() => onT3HappyChange?.(!t3HappySelected)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 10,
                  border: t3HappySelected ? '2px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.4)',
                  background: t3HappySelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(30, 41, 59, 0.65)',
                  color: t3HappySelected ? '#7dd3fc' : '#e5e7eb',
                  fontSize: 12,
                  fontWeight: t3HappySelected ? 600 : 500,
                  cursor: 'pointer',
                }}
              >
                <span>😊</span>
                <span>Happy</span>
              </button>
            </div>
          )}

          {selectedIndex === 5 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
                Choose mental factors (cetasikas)
              </div>
              <select
                value={t5SelectedId ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  onT5Change?.(v ? v : null)
                }}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid rgba(148, 163, 184, 0.4)',
                  background: 'rgba(30, 41, 59, 0.85)',
                  color: '#e5e7eb',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <option value="">No selection (random)</option>
                {T5_CATEGORIES.map((cat) => (
                  <optgroup key={cat.label} label={cat.label}>
                    {cat.optionIds.map((id) => {
                      const opt = T5_MENTAL_OPTIONS.find((o) => o.id === id)
                      return opt ? (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ) : null
                    })}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowDetail((d) => !d)}
            style={{
              marginTop: 12,
              padding: '6px 11px',
              border: '1px solid rgba(148, 163, 184, 0.6)',
              borderRadius: 8,
              background: showDetail ? 'rgba(59, 130, 246, 0.2)' : 'rgba(30, 41, 59, 0.65)',
              color: '#bfdbfe',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {showDetail ? 'Hide detail' : 'Explain detail'}
          </button>
          {showDetail && (() => {
            const stageName = VITHI_STAGE_ORDER[selectedIndex]
            const explanation = stageName ? VITHI_STAGE_EXPLANATIONS[stageName] : null
            const stageInfo = vithiStageData?.get(selectedIndex)
            return (
              <div style={{ margin: '10px 0 0' }}>
                {explanation ? (
                  <p style={{ fontSize: 12, lineHeight: 1.6, color: '#c4b5fd' }}>
                    {explanation}
                  </p>
                ) : (
                  <p style={{ fontSize: 13, lineHeight: 1.5, color: '#9ca3af' }}>
                    {stops[selectedIndex].description}
                  </p>
                )}
                {stageInfo && !stageInfo.blocked && stageInfo.mental_details.length > 0 && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8' }}>
                    <span style={{ fontWeight: 600 }}>Active cetasikas:</span>{' '}
                    {stageInfo.mental_details.map((d) => d.name).join(', ')}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}
      <div
        style={{
          position: 'relative',
          height: 520,
          width: detailPanelOpen ? 40 : 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}
      >
        <div
          ref={railRef}
          onPointerDown={startDrag}
          style={{
            position: 'relative',
            height: '100%',
            width: 12,
            borderRadius: 999,
            background: 'rgba(2, 6, 23, 0.9)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
            boxShadow: '0 10px 36px rgba(0,0,0,0.52)',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          {!detailPanelOpen && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.stopPropagation()
                setDetailPanelOpen(true)
              }}
              style={{
                position: 'absolute',
                top: -42,
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '5px 11px',
                borderRadius: 8,
                border: '1px solid rgba(148, 163, 184, 0.75)',
                background: 'rgba(15, 23, 42, 0.85)',
                color: '#cbd5e1',
                fontSize: 11,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Open timeline
            </button>
          )}
          {stops.map((stop, i) => {
            const topPct = maxIndex > 0 ? (i / maxIndex) * 100 : 0
            const isSelected = i === selectedIndex
            return (
              <button
                key={stop.label}
                type="button"
                onClick={() => {
                  onSelect(i)
                  if (maxIndex > 0) setPinRatio(i / maxIndex)
                }}
                title={stop.label}
                style={{
                  position: 'absolute',
                  top: `${topPct}%`,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isSelected ? 16 : 11,
                  height: isSelected ? 16 : 11,
                  borderRadius: '50%',
                  border: isSelected ? '2px solid #f8fafc' : '1px solid rgba(226,232,240,0.9)',
                  background: colors[i % colors.length],
                  boxShadow: isSelected ? '0 0 0 3px rgba(255,255,255,0.25)' : 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            )
          })}
          <div
            onPointerDown={startDrag}
            style={{
              position: 'absolute',
              top: `${pinRatio * 100}%`,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 30,
              height: 30,
              borderRadius: 999,
              border: '3px solid #f8fafc',
              background: 'rgba(15, 23, 42, 0.96)',
              boxShadow: '0 8px 28px rgba(0,0,0,0.58)',
            }}
          />
        </div>
      </div>
    </div>
  )
}

function XRTimelineToggle({
  enabled,
  onToggle,
}: {
  enabled: boolean
  onToggle: () => void
}) {
  const { gl } = useThree()
  const wasPressedRef = useRef(false)
  const cooldownRef = useRef(0)

  useFrame((_state, delta) => {
    if (!enabled || !gl.xr.isPresenting) {
      wasPressedRef.current = false
      cooldownRef.current = 0
      return
    }

    cooldownRef.current = Math.max(0, cooldownRef.current - delta)
    const session = gl.xr.getSession()
    if (!session) return

    let bPressed = false
    for (const inputSource of session.inputSources) {
      if (inputSource.handedness !== 'right') continue
      const gamepad = (inputSource as { gamepad?: Gamepad }).gamepad
      if (!gamepad || !gamepad.buttons?.length) continue
      // Runtime mappings differ across browsers/devices; cover common B-slot indices.
      bPressed = Boolean(
        gamepad.buttons[5]?.pressed ||
        gamepad.buttons[4]?.pressed ||
        gamepad.buttons[3]?.pressed
      )
      if (bPressed) break
    }

    if (bPressed && !wasPressedRef.current && cooldownRef.current <= 0) {
      onToggle()
      cooldownRef.current = 0.28
    }
    wasPressedRef.current = bPressed
  })

  return null
}

function XRTimelinePanel({
  stops,
  selectedIndex,
  onSelect,
  panelOpen,
  onOpenPanel,
  onClosePanel,
  t3HappySelected,
  onT3HappyChange,
  t5SelectedId,
  onT5Change,
  onSenseSelect,
  hasContactMental,
  personType,
  onPersonTypeChange,
  timelineMode,
  onTimelineModeChange,
  slideshowPaused,
  onSlideshowPausedChange,
  vithiCurrentEvent,
  vithiStageData,
}: {
  stops: Array<{ label: string; description: string }>
  selectedIndex: number
  onSelect: (index: number) => void
  panelOpen: boolean
  onOpenPanel: () => void
  onClosePanel: () => void
  t3HappySelected?: boolean
  onT3HappyChange?: (selected: boolean) => void
  t5SelectedId?: string | null
  onT5Change?: (id: string | null) => void
  onSenseSelect?: (senseId: string, params: VithiParams) => void
  hasContactMental?: boolean
  personType?: PersonType
  onPersonTypeChange?: (pt: PersonType) => void
  timelineMode?: 'manual' | 'slideshow'
  onTimelineModeChange?: (mode: 'manual' | 'slideshow') => void
  slideshowPaused?: boolean
  onSlideshowPausedChange?: (paused: boolean) => void
  vithiCurrentEvent?: VithiEvent | null
  vithiStageData?: Map<number, VithiStageInfo> | null
}) {
  const { gl, camera } = useThree()
  const groupRef = useRef<THREE.Group | null>(null)
  const buttonRefs = useRef<Array<THREE.Mesh | null>>([])
  const openPanelButtonRef = useRef<THREE.Mesh | null>(null)
  const closePanelButtonRef = useRef<THREE.Mesh | null>(null)
  const explainButtonRef = useRef<THREE.Mesh | null>(null)
  const happyButtonRef = useRef<THREE.Mesh | null>(null)
  const t5PrevButtonRef = useRef<THREE.Mesh | null>(null)
  const t5NextButtonRef = useRef<THREE.Mesh | null>(null)
  const t5ClearButtonRef = useRef<THREE.Mesh | null>(null)
  const personTypePrevButtonRef = useRef<THREE.Mesh | null>(null)
  const personTypeNextButtonRef = useRef<THREE.Mesh | null>(null)
  const modeManualButtonRef = useRef<THREE.Mesh | null>(null)
  const modeSlideshowButtonRef = useRef<THREE.Mesh | null>(null)
  const slideshowPauseButtonRef = useRef<THREE.Mesh | null>(null)
  const senseButtonRefs = useRef<Record<string, THREE.Mesh | null>>({})
  const variantButtonRefs = useRef<Record<string, THREE.Mesh | null>>({})
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const hoveredIndexRef = useRef<number | null>(null)
  const [isOpenHovered, setIsOpenHovered] = useState(false)
  const [isCloseHovered, setIsCloseHovered] = useState(false)
  const [hoveredAction, setHoveredAction] = useState<string | null>(null)
  const hoveredActionRef = useRef<string | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedSense, setSelectedSense] = useState<string>('')
  const personTypes = PERSON_TYPES
  const personTypeIndex = Math.max(0, personTypes.indexOf(personType ?? 'puthujjana'))

  useStationaryDraggableXrPanel({
    groupRef,
    gl,
    camera,
    layout: { forward: 1.02, right: 0.72, yDown: 0.06 },
  })

  useEffect(() => {
    const xrRaycaster = new THREE.Raycaster()
    const rayOrigin = new THREE.Vector3()
    const rayDirection = new THREE.Vector3()
    const controllers = [gl.xr.getController(0), gl.xr.getController(1)]

    const resolveIndexForHit = (hitObject: THREE.Object3D): number | null => {
      for (let i = 0; i < stops.length; i += 1) {
        const mesh = buttonRefs.current[i]
        if (!mesh) continue
        let node: THREE.Object3D | null = hitObject
        while (node) {
          if (node === mesh) return i
          node = node.parent
        }
      }
      return null
    }

    const isHitInside = (mesh: THREE.Mesh | null, hitObject: THREE.Object3D): boolean => {
      if (!mesh) return false
      let node: THREE.Object3D | null = hitObject
      while (node) {
        if (node === mesh) return true
        node = node.parent
      }
      return false
    }

    const handleXrSelect = (event: Event) => {
      if (!gl.xr.isPresenting) return
      const selectedVariants = selectedSense ? (SENSE_VARIANTS[selectedSense] ?? []) : []
      const targets = [
        ...buttonRefs.current.filter(Boolean),
        openPanelButtonRef.current,
        closePanelButtonRef.current,
        explainButtonRef.current,
        happyButtonRef.current,
        t5PrevButtonRef.current,
        t5NextButtonRef.current,
        t5ClearButtonRef.current,
        personTypePrevButtonRef.current,
        personTypeNextButtonRef.current,
        modeManualButtonRef.current,
        modeSlideshowButtonRef.current,
        slideshowPauseButtonRef.current,
        ...Object.values(senseButtonRefs.current),
        ...Object.values(variantButtonRefs.current),
      ].filter(Boolean) as THREE.Object3D[]
      if (!targets.length) return

      const controller = event.target as unknown as THREE.Object3D
      rayOrigin.setFromMatrixPosition(controller.matrixWorld)
      rayDirection.set(0, 0, -1).transformDirection(controller.matrixWorld)
      xrRaycaster.set(rayOrigin, rayDirection)

      const hits = xrRaycaster.intersectObjects(targets, true)
      if (!hits.length) return
      if (isHitInside(openPanelButtonRef.current, hits[0].object)) {
        onOpenPanel()
        return
      }
      if (isHitInside(closePanelButtonRef.current, hits[0].object)) {
        onClosePanel()
        return
      }
      if (isHitInside(explainButtonRef.current, hits[0].object)) {
        setShowDetail((prev) => !prev)
        return
      }
      if (selectedIndex === 3 && isHitInside(happyButtonRef.current, hits[0].object)) {
        onT3HappyChange?.(!t3HappySelected)
        return
      }
      if (selectedIndex === 5) {
        const flatOptions = T5_CATEGORIES.flatMap((cat) =>
          cat.optionIds
            .map((id) => T5_MENTAL_OPTIONS.find((opt) => opt.id === id))
            .filter(Boolean)
        ) as Array<{ id: string; label: string }>
        const currentIdx = flatOptions.findIndex((opt) => opt.id === (t5SelectedId ?? ''))
        if (isHitInside(t5PrevButtonRef.current, hits[0].object)) {
          if (!flatOptions.length) return
          const nextIdx = currentIdx <= 0 ? flatOptions.length - 1 : currentIdx - 1
          onT5Change?.(flatOptions[nextIdx]?.id ?? null)
          return
        }
        if (isHitInside(t5NextButtonRef.current, hits[0].object)) {
          if (!flatOptions.length) return
          const nextIdx = currentIdx >= flatOptions.length - 1 ? 0 : currentIdx + 1
          onT5Change?.(flatOptions[nextIdx]?.id ?? null)
          return
        }
        if (isHitInside(t5ClearButtonRef.current, hits[0].object)) {
          onT5Change?.(null)
          return
        }
      }
      if (selectedIndex === 0) {
        if (isHitInside(personTypePrevButtonRef.current, hits[0].object)) {
          const prev = (personTypeIndex - 1 + personTypes.length) % personTypes.length
          onPersonTypeChange?.(personTypes[prev])
          return
        }
        if (isHitInside(personTypeNextButtonRef.current, hits[0].object)) {
          const next = (personTypeIndex + 1) % personTypes.length
          onPersonTypeChange?.(personTypes[next])
          return
        }
        if (isHitInside(modeManualButtonRef.current, hits[0].object)) {
          onTimelineModeChange?.('manual')
          return
        }
        if (isHitInside(modeSlideshowButtonRef.current, hits[0].object)) {
          onTimelineModeChange?.('slideshow')
          return
        }
      }
      if (timelineMode === 'slideshow' && selectedIndex > 0 && isHitInside(slideshowPauseButtonRef.current, hits[0].object)) {
        onSlideshowPausedChange?.(!slideshowPaused)
        return
      }
      if (selectedIndex === 0 && hasContactMental) {
        for (const opt of T0_SENSE_OPTIONS) {
          const mesh = senseButtonRefs.current[opt.id]
          if (!mesh) continue
          if (isHitInside(mesh, hits[0].object)) {
            setSelectedSense((prev) => (prev === opt.id ? '' : opt.id))
            return
          }
        }
        for (const variant of selectedVariants) {
          const mesh = variantButtonRefs.current[variant.id]
          if (!mesh) continue
          if (isHitInside(mesh, hits[0].object)) {
            onSenseSelect?.(selectedSense, variant.params)
            return
          }
        }
      }
      const idx = resolveIndexForHit(hits[0].object)
      if (idx !== null) onSelect(idx)
    }

    controllers.forEach((controller) => {
      controller.addEventListener('selectstart', handleXrSelect as unknown as (event: { data: XRInputSource }) => void)
    })

    return () => {
      controllers.forEach((controller) => {
        controller.removeEventListener('selectstart', handleXrSelect as unknown as (event: { data: XRInputSource }) => void)
      })
    }
  }, [
    gl,
    hasContactMental,
    onClosePanel,
    onOpenPanel,
    onPersonTypeChange,
    onSelect,
    onSenseSelect,
    onT3HappyChange,
    onTimelineModeChange,
    onT5Change,
    onSlideshowPausedChange,
    personTypeIndex,
    personTypes,
    selectedIndex,
    selectedSense,
    slideshowPaused,
    t3HappySelected,
    timelineMode,
    t5SelectedId,
    stops,
  ])

  useFrame(() => {
    let nextHovered: number | null = null
    let nextOpenHovered = false
    let nextCloseHovered = false
    let nextHoveredAction: string | null = null
    if (gl.xr.isPresenting) {
      const xrRaycaster = new THREE.Raycaster()
      const rayOrigin = new THREE.Vector3()
      const rayDirection = new THREE.Vector3()
      const controllers = [gl.xr.getController(0), gl.xr.getController(1)]
      const targets = [
        ...buttonRefs.current.filter(Boolean),
        openPanelButtonRef.current,
        closePanelButtonRef.current,
        personTypePrevButtonRef.current,
        personTypeNextButtonRef.current,
        modeManualButtonRef.current,
        modeSlideshowButtonRef.current,
        slideshowPauseButtonRef.current,
      ].filter(Boolean) as THREE.Object3D[]
      for (const controller of controllers) {
        if (!targets.length) break
        rayOrigin.setFromMatrixPosition(controller.matrixWorld)
        rayDirection.set(0, 0, -1).transformDirection(controller.matrixWorld)
        xrRaycaster.set(rayOrigin, rayDirection)
        const hits = xrRaycaster.intersectObjects(targets, true)
        if (!hits.length) continue
        const hitObject = hits[0].object
        const hitInside = (mesh: THREE.Mesh | null): boolean => {
          if (!mesh) return false
          let node: THREE.Object3D | null = hitObject
          while (node) {
            if (node === mesh) return true
            node = node.parent
          }
          return false
        }
        if (openPanelButtonRef.current) {
          nextOpenHovered = hitInside(openPanelButtonRef.current)
          if (nextOpenHovered) nextHoveredAction = 'open-timeline'
        }
        if (closePanelButtonRef.current) {
          nextCloseHovered = hitInside(closePanelButtonRef.current)
          if (nextCloseHovered) nextHoveredAction = 'close-timeline'
        }
        if (!nextHoveredAction && hitInside(explainButtonRef.current)) nextHoveredAction = 'explain-detail'
        if (!nextHoveredAction && hitInside(happyButtonRef.current)) nextHoveredAction = 'happy-toggle'
        if (!nextHoveredAction && hitInside(t5PrevButtonRef.current)) nextHoveredAction = 't5-prev'
        if (!nextHoveredAction && hitInside(t5NextButtonRef.current)) nextHoveredAction = 't5-next'
        if (!nextHoveredAction && hitInside(t5ClearButtonRef.current)) nextHoveredAction = 't5-clear'
        if (!nextHoveredAction && hitInside(personTypePrevButtonRef.current)) nextHoveredAction = 'person-prev'
        if (!nextHoveredAction && hitInside(personTypeNextButtonRef.current)) nextHoveredAction = 'person-next'
        if (!nextHoveredAction && hitInside(modeManualButtonRef.current)) nextHoveredAction = 'mode-manual'
        if (!nextHoveredAction && hitInside(modeSlideshowButtonRef.current)) nextHoveredAction = 'mode-slideshow'
        if (!nextHoveredAction && hitInside(slideshowPauseButtonRef.current)) nextHoveredAction = 'slideshow-pause'
        if (!nextHoveredAction) {
          for (const opt of T0_SENSE_OPTIONS) {
            if (hitInside(senseButtonRefs.current[opt.id])) {
              nextHoveredAction = `sense-${opt.id}`
              break
            }
          }
        }
        if (!nextHoveredAction) {
          const selectedVariants = selectedSense ? (SENSE_VARIANTS[selectedSense] ?? []) : []
          for (const variant of selectedVariants) {
            if (hitInside(variantButtonRefs.current[variant.id])) {
              nextHoveredAction = `variant-${variant.id}`
              break
            }
          }
        }
        for (let i = 0; i < buttonRefs.current.length; i += 1) {
          const mesh = buttonRefs.current[i]
          if (!mesh) continue
          let node: THREE.Object3D | null = hitObject
          while (node) {
            if (node === mesh) {
              nextHovered = i
              break
            }
            node = node.parent
          }
          if (nextHovered !== null) break
        }
        if (nextHovered !== null || nextOpenHovered || nextCloseHovered || nextHoveredAction) break
      }
    }

    if (hoveredIndexRef.current !== nextHovered) {
      hoveredIndexRef.current = nextHovered
      setHoveredIndex(nextHovered)
    }
    setIsOpenHovered(nextOpenHovered)
    setIsCloseHovered(nextCloseHovered)
    if (hoveredActionRef.current !== nextHoveredAction) {
      hoveredActionRef.current = nextHoveredAction
      setHoveredAction(nextHoveredAction)
    }
  })

  const activeStop = stops[selectedIndex] ?? stops[0]
  const selectedVariants = selectedSense ? (SENSE_VARIANTS[selectedSense] ?? []) : []
  const t5CurrentLabel = t5SelectedId
    ? (T5_MENTAL_OPTIONS.find((opt) => opt.id === t5SelectedId)?.label ?? 'Custom selection')
    : 'No selection (random)'
  const isActionHovered = (action: string): boolean => hoveredAction === action
  const panelTopY = 0.62
  const headerIconY = 0.5
  const headerTitleY = 0.52
  const headerSubtitleY = 0.46
  const headerDescTopY = 0.39
  const stageInfoY = 0.31
  const personTypeRowY = 0.23
  const modeRowY = 0.16
  const senseHeaderY = 0.06
  const senseRowStartY = -0.01
  const senseRowGap = 0.1
  let variantHeaderY = -0.14
  let variantStartY = -0.2
  let contentBottomY = -0.12
  if (selectedIndex === 0 && hasContactMental) {
    const senseRowCount = Math.max(1, Math.ceil(T0_SENSE_OPTIONS.length / 3))
    const lastSenseRowY = senseRowStartY - (senseRowCount - 1) * senseRowGap
    // Keep "What kind?" clearly below the sense-door rows.
    variantHeaderY = lastSenseRowY - 0.06
    variantStartY = variantHeaderY - 0.07
    contentBottomY = lastSenseRowY - 0.06
    if (selectedVariants.length > 0) {
      const visibleVariantCount = Math.min(3, selectedVariants.length)
      const lastVariantY = variantStartY - (visibleVariantCount - 1) * 0.08
      contentBottomY = Math.min(contentBottomY, lastVariantY - 0.06)
    }
  }
  if (selectedIndex === 3) contentBottomY = -0.2
  if (selectedIndex === 5) contentBottomY = -0.265
  if (vithiCurrentEvent) contentBottomY = Math.min(contentBottomY, -0.32)
  const explainButtonY = Math.max(-0.52, contentBottomY - 0.09)
  // Size panel to content so we don't keep excessive empty space below controls.
  const panelBottomY = explainButtonY - 0.075
  const panelHeight = Math.max(0.84, panelTopY - panelBottomY)
  const innerPanelHeight = Math.max(0.2, panelHeight - 0.004)
  const panelCenterY = panelTopY - panelHeight * 0.5

  return (
    <group ref={groupRef}>
      <mesh position={[0, -0.01, 0.03]} userData={{ xrUiBlocker: true }}>
        <planeGeometry args={[0.24, 1.08]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      {/* Outer capsule frame */}
      <mesh position={[0, -0.01, 0]}>
        <planeGeometry args={[0.074, 0.9]} />
        <meshBasicMaterial color={0xe2e8f0} transparent opacity={0.82} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner dark rail */}
      <mesh position={[0, -0.01, 0.002]}>
        <planeGeometry args={[0.038, 0.864]} />
        <meshBasicMaterial color={0x0f172a} side={THREE.DoubleSide} />
      </mesh>

      {stops.map((stop, i) => {
        const yTop = 0.36
        const yBottom = -0.38
        const t = stops.length > 1 ? i / (stops.length - 1) : 0
        const y = yTop + (yBottom - yTop) * t
        const isSelected = selectedIndex === i
        const isHovered = hoveredIndex === i
        const stopColor = new THREE.Color(TIMELINE_COLORS[i % TIMELINE_COLORS.length])
        const displayColor = isHovered ? stopColor.clone().lerp(new THREE.Color('#ffffff'), 0.28) : stopColor
        return (
          <group key={stop.label}>
            <mesh
              ref={(node: THREE.Mesh | null) => {
                buttonRefs.current[i] = node
              }}
              position={[0, y, 0.004]}
            >
              <circleGeometry args={[isSelected ? 0.023 : 0.019, 26]} />
              <meshBasicMaterial color={displayColor.getHex()} />
            </mesh>
            {isSelected && (
              <>
                <mesh position={[0, y, 0.0034]}>
                  <circleGeometry args={[0.038, 30]} />
                  <meshBasicMaterial color={0xf8fafc} transparent opacity={0.92} />
                </mesh>
                <mesh position={[0, y, 0.0037]}>
                  <circleGeometry args={[0.03, 30]} />
                  <meshBasicMaterial color={0x1e293b} />
                </mesh>
              </>
            )}
          </group>
        )
      })}

      {!panelOpen && (
        <group>
          <mesh ref={openPanelButtonRef} position={[0, 0.5, 0.004]}>
            <planeGeometry args={[0.34, 0.08]} />
            <meshBasicMaterial color={isOpenHovered ? 0x1d4ed8 : 0x1e293b} transparent opacity={0.95} />
          </mesh>
          <Text position={[0, 0.5, 0.006]} anchorX="center" anchorY="middle" fontSize={0.026} color="#f8fafc">
            Open timeline
          </Text>
        </group>
      )}

      {panelOpen && (
        <group>
          <mesh position={[-0.48, panelCenterY, 0.02]} userData={{ xrUiBlocker: true }}>
            <planeGeometry args={[0.96, panelHeight + 0.08]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.48, panelCenterY, 0.001]}>
            <planeGeometry args={[0.9, panelHeight]} />
            <meshBasicMaterial color={0x111827} transparent opacity={0.96} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.48, panelCenterY, 0.0015]}>
            <planeGeometry args={[0.896, innerPanelHeight]} />
            <meshBasicMaterial color={0x0b1222} transparent opacity={0.54} side={THREE.DoubleSide} />
          </mesh>

          <mesh position={[-0.84, headerIconY, 0.004]}>
            <circleGeometry args={[0.05, 30]} />
            <meshBasicMaterial color={0x3b82f6} />
          </mesh>
          <Text position={[-0.84, headerIconY, 0.006]} anchorX="center" anchorY="middle" fontSize={0.03} color="#f8fafc">
            {TIMELINE_ICONS[selectedIndex % TIMELINE_ICONS.length]}
          </Text>
          <Text position={[-0.75, headerTitleY, 0.005]} anchorX="left" anchorY="middle" fontSize={0.046} color="#f8fafc">
            {activeStop.label}
          </Text>
          <Text position={[-0.75, headerSubtitleY, 0.005]} anchorX="left" anchorY="middle" fontSize={0.029} color="#94a3b8">
            Cognitive Timeline
          </Text>
          <Text
            position={[-0.88, headerDescTopY, 0.005]}
            anchorX="left"
            anchorY="top"
            fontSize={0.034}
            maxWidth={0.78}
            lineHeight={1.2}
            color="#cbd5e1"
          >
            {activeStop.description}
          </Text>

          {vithiStageData && vithiStageData.has(selectedIndex) && (
            (() => {
              const stage = vithiStageData.get(selectedIndex)!
              const stageText = stage.blocked
                ? 'No citta at this stage'
                : `${stage.mental_details.length} cetasika(s): ${stage.mental_details.map((d) => d.name).join(', ')}`
              return (
                <Text position={[-0.88, stageInfoY, 0.006]} anchorX="left" anchorY="middle" fontSize={0.018} color={stage.blocked ? '#6b7280' : '#a5b4fc'} maxWidth={0.78}>
                  {stageText}
                </Text>
              )
            })()
          )}

          {selectedIndex === 0 && (
            <>
              <Text position={[-0.88, personTypeRowY, 0.006]} anchorX="left" anchorY="middle" fontSize={0.02} color="#94a3b8">
                Person type
              </Text>
              <mesh ref={personTypePrevButtonRef} position={[-0.56, personTypeRowY, 0.005]}>
                <planeGeometry args={[0.1, 0.06]} />
                <meshBasicMaterial color={isActionHovered('person-prev') ? 0x475569 : 0x334155} />
              </mesh>
              <Text position={[-0.56, personTypeRowY, 0.007]} anchorX="center" anchorY="middle" fontSize={0.022} color="#f8fafc">
                ◀
              </Text>
              <mesh ref={personTypeNextButtonRef} position={[-0.32, personTypeRowY, 0.005]}>
                <planeGeometry args={[0.1, 0.06]} />
                <meshBasicMaterial color={isActionHovered('person-next') ? 0x475569 : 0x334155} />
              </mesh>
              <Text position={[-0.32, personTypeRowY, 0.007]} anchorX="center" anchorY="middle" fontSize={0.022} color="#f8fafc">
                ▶
              </Text>
              <Text position={[-0.50, personTypeRowY, 0.007]} anchorX="left" anchorY="middle" fontSize={0.019} color="#e2e8f0" maxWidth={0.16}>
                {personType ?? 'puthujjana'}
              </Text>

              <Text position={[-0.88, modeRowY, 0.006]} anchorX="left" anchorY="middle" fontSize={0.02} color="#94a3b8">
                Timeline mode
              </Text>
              <mesh ref={modeManualButtonRef} position={[-0.58, modeRowY, 0.005]}>
                <planeGeometry args={[0.16, 0.06]} />
                <meshBasicMaterial color={timelineMode === 'manual' ? 0x1d4ed8 : isActionHovered('mode-manual') ? 0x334155 : 0x1f2937} />
              </mesh>
              <Text position={[-0.58, modeRowY, 0.007]} anchorX="center" anchorY="middle" fontSize={0.018} color="#f8fafc">
                Manual
              </Text>
              <mesh ref={modeSlideshowButtonRef} position={[-0.38, modeRowY, 0.005]}>
                <planeGeometry args={[0.2, 0.06]} />
                <meshBasicMaterial color={timelineMode === 'slideshow' ? 0x1d4ed8 : isActionHovered('mode-slideshow') ? 0x334155 : 0x1f2937} />
              </mesh>
              <Text position={[-0.38, modeRowY, 0.007]} anchorX="center" anchorY="middle" fontSize={0.018} color="#f8fafc">
                Slideshow
              </Text>
            </>
          )}

          {timelineMode === 'slideshow' && selectedIndex > 0 && (
            <>
              <mesh ref={slideshowPauseButtonRef} position={[-0.72, 0.09, 0.005]}>
                <planeGeometry args={[0.26, 0.065]} />
                <meshBasicMaterial color={isActionHovered('slideshow-pause') ? 0x475569 : 0x334155} />
              </mesh>
              <Text position={[-0.72, 0.09, 0.007]} anchorX="center" anchorY="middle" fontSize={0.02} color="#f8fafc">
                {slideshowPaused ? 'Play' : 'Pause'}
              </Text>
            </>
          )}

          {selectedIndex === 0 && !hasContactMental && (
            <Text position={[-0.88, senseHeaderY, 0.006]} anchorX="left" anchorY="middle" fontSize={0.02} color="#f87171" maxWidth={0.78}>
              Create Contact (Phassa) mental via code runner to unlock sense doors
            </Text>
          )}
          {selectedIndex === 0 && hasContactMental && (
            <>
              <Text position={[-0.88, senseHeaderY, 0.006]} anchorX="left" anchorY="middle" fontSize={0.024} color="#94a3b8">
                Choose sense door
              </Text>
              {T0_SENSE_OPTIONS.map((opt, idx) => {
                const col = idx % 3
                const row = Math.floor(idx / 3)
                const x = -0.72 + col * 0.27
                const y = senseRowStartY - row * senseRowGap
                const isSelected = selectedSense === opt.id
                return (
                  <group key={opt.id}>
                    <mesh
                      ref={(node: THREE.Mesh | null) => {
                        senseButtonRefs.current[opt.id] = node
                      }}
                      position={[x, y, 0.005]}
                    >
                      <planeGeometry args={[0.24, 0.075]} />
                      <meshBasicMaterial color={isSelected ? 0x2563eb : isActionHovered(`sense-${opt.id}`) ? 0x334155 : 0x1f2937} />
                    </mesh>
                    <Text
                      position={[x - 0.097, y, 0.007]}
                      anchorX="left"
                      anchorY="middle"
                      fontSize={0.024}
                      color={isSelected || isActionHovered(`sense-${opt.id}`) ? '#f8fafc' : '#e2e8f0'}
                    >
                      {`${opt.icon} ${opt.label}`}
                    </Text>
                  </group>
                )
              })}
              {selectedVariants.length > 0 && (
                <>
                  <Text position={[-0.88, variantHeaderY, 0.006]} anchorX="left" anchorY="middle" fontSize={0.024} color="#94a3b8">
                    What kind?
                  </Text>
                  {selectedVariants.slice(0, 3).map((variant, idx) => {
                    const y = variantStartY - idx * 0.08
                    return (
                      <group key={variant.id}>
                        <mesh
                          ref={(node: THREE.Mesh | null) => {
                            variantButtonRefs.current[variant.id] = node
                          }}
                          position={[-0.48, y, 0.005]}
                        >
                          <planeGeometry args={[0.8, 0.065]} />
                          <meshBasicMaterial color={isActionHovered(`variant-${variant.id}`) ? 0x0d9488 : 0x0f766e} />
                        </mesh>
                        <Text
                          position={[-0.86, y, 0.007]}
                          anchorX="left"
                          anchorY="middle"
                          fontSize={0.022}
                          color={isActionHovered(`variant-${variant.id}`) ? '#ffffff' : '#ecfeff'}
                          maxWidth={0.74}
                        >
                          {`${variant.icon} ${variant.label}`}
                        </Text>
                      </group>
                    )
                  })}
                </>
              )}
            </>
          )}

          {vithiCurrentEvent && (
            <>
              <mesh position={[-0.48, -0.24, 0.004]}>
                <planeGeometry args={[0.8, 0.15]} />
                <meshBasicMaterial color={0x1d4ed8} transparent opacity={0.24} />
              </mesh>
              <Text position={[-0.86, -0.2, 0.007]} anchorX="left" anchorY="middle" fontSize={0.02} color="#60a5fa" maxWidth={0.74}>
                {vithiCurrentEvent.stage.replace(/_/g, ' ').toUpperCase()}
              </Text>
              <Text position={[-0.86, -0.24, 0.007]} anchorX="left" anchorY="middle" fontSize={0.022} color="#e2e8f0" maxWidth={0.74}>
                {vithiCurrentEvent.mind_name || `Citta ${vithiCurrentEvent.mind_id ?? '?'}`}
              </Text>
              <Text position={[-0.86, -0.28, 0.007]} anchorX="left" anchorY="middle" fontSize={0.019} color="#94a3b8" maxWidth={0.74}>
                {`Step ${vithiCurrentEvent.order}: ${vithiCurrentEvent.description}`}
              </Text>
            </>
          )}

          {selectedIndex === 3 && (
            <>
              <Text position={[-0.88, -0.1, 0.006]} anchorX="left" anchorY="middle" fontSize={0.024} color="#94a3b8">
                Add option
              </Text>
              <mesh ref={happyButtonRef} position={[-0.72, -0.16, 0.005]}>
                <planeGeometry args={[0.3, 0.075]} />
                <meshBasicMaterial color={t3HappySelected ? 0x0891b2 : isActionHovered('happy-toggle') ? 0x334155 : 0x1f2937} />
              </mesh>
              <Text
                position={[-0.84, -0.16, 0.007]}
                anchorX="left"
                anchorY="middle"
                fontSize={0.024}
                color={isActionHovered('happy-toggle') ? '#f8fafc' : '#e2e8f0'}
              >
                😊 Happy
              </Text>
            </>
          )}

          {selectedIndex === 5 && (
            <>
              <Text position={[-0.88, -0.08, 0.006]} anchorX="left" anchorY="middle" fontSize={0.024} color="#94a3b8">
                Choose mental factors (cetasikas)
              </Text>
              <mesh position={[-0.48, -0.145, 0.005]}>
                <planeGeometry args={[0.8, 0.08]} />
                <meshBasicMaterial color={0x1f2937} />
              </mesh>
              <Text position={[-0.86, -0.145, 0.007]} anchorX="left" anchorY="middle" fontSize={0.02} color="#e2e8f0" maxWidth={0.74}>
                {t5CurrentLabel}
              </Text>
              <mesh ref={t5PrevButtonRef} position={[-0.72, -0.225, 0.005]}>
                <planeGeometry args={[0.18, 0.065]} />
                <meshBasicMaterial color={isActionHovered('t5-prev') ? 0x475569 : 0x334155} />
              </mesh>
              <Text
                position={[-0.72, -0.225, 0.007]}
                anchorX="center"
                anchorY="middle"
                fontSize={0.022}
                color={isActionHovered('t5-prev') ? '#ffffff' : '#f8fafc'}
              >
                Prev
              </Text>
              <mesh ref={t5NextButtonRef} position={[-0.48, -0.225, 0.005]}>
                <planeGeometry args={[0.18, 0.065]} />
                <meshBasicMaterial color={isActionHovered('t5-next') ? 0x475569 : 0x334155} />
              </mesh>
              <Text
                position={[-0.48, -0.225, 0.007]}
                anchorX="center"
                anchorY="middle"
                fontSize={0.022}
                color={isActionHovered('t5-next') ? '#ffffff' : '#f8fafc'}
              >
                Next
              </Text>
              <mesh ref={t5ClearButtonRef} position={[-0.24, -0.225, 0.005]}>
                <planeGeometry args={[0.18, 0.065]} />
                <meshBasicMaterial color={isActionHovered('t5-clear') ? 0x991b1b : 0x7f1d1d} />
              </mesh>
              <Text
                position={[-0.24, -0.225, 0.007]}
                anchorX="center"
                anchorY="middle"
                fontSize={0.022}
                color={isActionHovered('t5-clear') ? '#ffffff' : '#fee2e2'}
              >
                Clear
              </Text>
            </>
          )}

          <mesh ref={explainButtonRef} position={[-0.72, explainButtonY, 0.005]}>
            <planeGeometry args={[0.34, 0.075]} />
            <meshBasicMaterial color={showDetail ? 0x1d4ed8 : isActionHovered('explain-detail') ? 0x475569 : 0x334155} />
          </mesh>
          <Text position={[-0.72, explainButtonY, 0.007]} anchorX="center" anchorY="middle" fontSize={0.022} color="#f8fafc">
            {showDetail ? 'Hide detail' : 'Explain detail'}
          </Text>
          {showDetail && (() => {
            const stageName = VITHI_STAGE_ORDER[selectedIndex]
            const explanation = stageName ? VITHI_STAGE_EXPLANATIONS[stageName] : null
            const text = explanation
              ? (explanation.length > 200 ? explanation.slice(0, 200) + '...' : explanation)
              : activeStop.description
            return (
              <Text position={[-0.52, explainButtonY, 0.007]} anchorX="left" anchorY="middle" fontSize={0.018} color="#c4b5fd" maxWidth={0.42}>
                {text}
              </Text>
            )
          })()}

          <mesh ref={closePanelButtonRef} position={[-0.16, headerIconY, 0.004]}>
            <planeGeometry args={[0.19, 0.075]} />
            <meshBasicMaterial color={isCloseHovered ? 0x334155 : 0x1e293b} />
          </mesh>
          <Text position={[-0.16, headerIconY, 0.006]} anchorX="center" anchorY="middle" fontSize={0.03} color="#f8fafc">
            Close
          </Text>
        </group>
      )}
    </group>
  )
}

function InspectOptionMenu({
  selection,
  panelPosition,
  onClose,
  onViewDetail,
  onVoice,
  voiceLoading = false,
  onDragPositionChange,
}: {
  selection: InspectSelection
  panelPosition: { x: number; y: number } | null
  onClose: () => void
  onViewDetail: (selection: InspectSelection) => void
  onVoice?: (selection: InspectSelection) => void
  voiceLoading?: boolean
  onDragPositionChange?: (pos: { x: number; y: number }) => void
}) {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ dragging: boolean; offsetX: number; offsetY: number }>({
    dragging: false,
    offsetX: 0,
    offsetY: 0,
  })

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragRef.current.dragging || !menuRef.current) return
      const menu = menuRef.current
      const width = menu.offsetWidth || 240
      const height = menu.offsetHeight || 200
      const margin = 12
      const unclampedLeft = event.clientX - dragRef.current.offsetX
      const unclampedTop = event.clientY - dragRef.current.offsetY
      const left = Math.min(window.innerWidth - width - margin, Math.max(margin, unclampedLeft))
      const top = Math.min(window.innerHeight - height - margin, Math.max(margin, unclampedTop))
      onDragPositionChange?.({
        x: left + width / 2,
        y: top + height + 12,
      })
    }

    const handlePointerUp = () => {
      dragRef.current.dragging = false
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [onDragPositionChange])

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return
    const rect = event.currentTarget.getBoundingClientRect()
    dragRef.current.dragging = true
    dragRef.current.offsetX = event.clientX - rect.left
    dragRef.current.offsetY = event.clientY - rect.top
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

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

  const renderOption = (label: string, description: string, onClick: () => void, disabled = false) => (
    <button
      key={label}
      type="button"
      style={optionStyle}
      onClick={onClick}
      disabled={disabled}
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
      </div>
    </button>
  )

  return (
    <div ref={menuRef} style={menuStyle} onPointerDown={handleDragStart}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 14, boxShadow: '0 0 0 1px rgba(125,211,252,0.25), inset 0 1px 0 rgba(255,255,255,0.04)' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, cursor: 'grab' }}>
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
        {renderOption('View Detail', 'Inspect this sphere closely', () => onViewDetail(selection))}
        {renderOption(voiceLoading ? 'Playing...' : 'Voice', 'Hear a narrated explanation', () => onVoice?.(selection), voiceLoading)}
        {renderOption('How it works?', 'Learn the mechanics in-game', () => {})}
      </div>
    </div>
  )
}

function ThreeScene({
  mind,
  mentals,
  selected,
  profile,
  profileAttrs,
  selectedMentalName,
  inspectOpen,
  onSelectMental,
  onViewDetail,
  onBackFromDetail,
  onShowProfile,
  onCloseProfile,
  onCloseSelection,
  onVoiceSelection,
  onUpdatePanelPosition,
  sendMode,
  emojiMode,
  onSendSelection,
  soundReceiveRequestId,
  sceneReceiveRequestId,
  onSoundReceiveHighlightChange,
  onSceneReceiveHighlightChange,
  onSoundReceiveComplete,
  onSceneReceiveComplete,
  showHumanModel,
  humanShape,
  xrMode,
  defaultMindPosition,
  defaultMindScale,
  onRendererReady,
  searchHighlight,
  explainHighlight,
  timelineIndex,
  onTimelineSelect,
  t3HappySelected,
  onT3HappyChange,
  t5SelectedId,
  onT5Change,
  onSenseSelect,
  hasContactMental,
  vithiCurrentEvent,
  stops,
  personType,
  onPersonTypeChange,
  timelineMode,
  onTimelineModeChange,
  slideshowPaused,
  onSlideshowPausedChange,
  vithiStageData,
  xrTimelineOpen,
  xrTimelineDetailOpen,
  onToggleXrTimeline,
  onOpenXrTimelineDetail,
  onCloseXrTimelineDetail,
}: {
  mind: Mind
  mentals: Mental[]
  selected: InspectSelection | null
  profile: InspectSelection | null
  profileAttrs: Array<{ key: string; value: string }>
  selectedMentalName: string | null
  inspectOpen: boolean
  onSelectMental: (info: InspectSelection) => void
  onViewDetail: (selection: InspectSelection) => void
  onBackFromDetail: () => void
  onShowProfile: (selection: InspectSelection) => void
  onCloseProfile: () => void
  onCloseSelection: () => void
  onVoiceSelection?: (selection: InspectSelection) => void
  onUpdatePanelPosition?: (pos: { x: number; y: number } | null) => void
  sendMode: boolean
  emojiMode: boolean
  onSendSelection?: (info: { sender?: string | null; receiver?: string | null; status?: string }) => void
  soundReceiveRequestId: number
  sceneReceiveRequestId: number
  onSoundReceiveHighlightChange?: (objects: THREE.Object3D[]) => void
  onSceneReceiveHighlightChange?: (objects: THREE.Object3D[]) => void
  onSoundReceiveComplete?: () => void
  onSceneReceiveComplete?: () => void
  showHumanModel: boolean
  humanShape: MorphShapeKey
  xrMode: 'vr' | 'ar' | null
  defaultMindPosition: Vec3
  defaultMindScale: number
  onRendererReady?: (gl: THREE.WebGLRenderer) => void
  searchHighlight?: THREE.Object3D[]
  explainHighlight?: THREE.Object3D[]
  timelineIndex: number
  onTimelineSelect: (index: number) => void
  t3HappySelected: boolean
  onT3HappyChange: (selected: boolean) => void
  t5SelectedId: string | null
  onT5Change: (id: string | null) => void
  onSenseSelect: (senseId: string, params: VithiParams) => void
  hasContactMental: boolean
  vithiCurrentEvent: VithiEvent | null
  stops: Array<{ label: string; description: string }>
  personType: PersonType
  onPersonTypeChange: (pt: PersonType) => void
  timelineMode: 'manual' | 'slideshow'
  onTimelineModeChange: (mode: 'manual' | 'slideshow') => void
  slideshowPaused: boolean
  onSlideshowPausedChange: (paused: boolean) => void
  vithiStageData: Map<number, VithiStageInfo> | null
  xrTimelineOpen: boolean
  xrTimelineDetailOpen: boolean
  onToggleXrTimeline: () => void
  onOpenXrTimelineDetail: () => void
  onCloseXrTimelineDetail: () => void
}) {
  const focusTargetRef = useRef<THREE.Vector3 | null>(null)
  const xrPanelWorldAnchorRef = useRef(new THREE.Vector3())
  const [hoverSelection, setHoverSelection] = useState<THREE.Object3D[]>([])
  const [sendMeshSelection, setSendMeshSelection] = useState<THREE.Object3D[]>([])
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const isXrActive = xrMode !== null
  const isArMode = xrMode === 'ar'
  const effectiveMindPosition = useMemo<Vec3>(() => {
    if (!isXrActive) return defaultMindPosition
    return [defaultMindPosition[0], defaultMindPosition[1] + XR_MIND_HEIGHT_OFFSET, defaultMindPosition[2]]
  }, [defaultMindPosition, isXrActive])
  const effectiveHumanGroundY = useMemo(() => {
    if (!isXrActive) return DEFAULT_HUMAN_GROUND_Y
    return DEFAULT_HUMAN_GROUND_Y + XR_MIND_HEIGHT_OFFSET
  }, [isXrActive])
  const xrInitialOffset = useMemo<[number, number, number]>(() => {
    // Push XR start position backward so the mind is visible in front on enter.
    return [0, 0, 4]
  }, [])
  // Keep mentals interactable in AR so controller trigger/tap can pick them.
  const showMentalsLayer = true
  const showHumanInScene = showHumanModel && (!isArMode || !sendMode)

  const selectedOutlineSelection = useMemo(() => {
    if (!selectedMentalName) return [] as THREE.Object3D[]
    const selectedMental = mentals.find((m) => m.getName() === selectedMentalName)
    const mesh = selectedMental?.getMesh()
    return mesh ? [mesh] : []
  }, [mentals, selectedMentalName])

  const handleSelectMental = useCallback((info: InspectSelection) => {
    if (isXrActive && xrTimelineOpen) return
    onSelectMental(info)
  }, [isXrActive, onSelectMental, xrTimelineOpen])

  // Priority: active explanation sphere, search results, send mode picks, selected sphere, then hover.
  const outlineSelection =
    (explainHighlight?.length ?? 0) > 0
      ? explainHighlight!
      : (searchHighlight?.length ?? 0) > 0
      ? searchHighlight!
      : sendMode && sendMeshSelection.length > 0
        ? sendMeshSelection
        : selectedOutlineSelection.length > 0
          ? selectedOutlineSelection
          : hoverSelection

  // When hiding the human model, put the mind back to its default position/scale.
  useLayoutEffect(() => {
    if (showHumanModel) return
    mind.setScale(defaultMindScale)
    mind.setPosition(effectiveMindPosition)

    const ctl = controlsRef.current
    if (ctl) {
      ctl.target.set(effectiveMindPosition[0], effectiveMindPosition[1], effectiveMindPosition[2])
      ctl.update()
    }
  }, [defaultMindScale, effectiveMindPosition, mind, showHumanModel])

  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 75 }}
      shadows={!isArMode}
      gl={{ antialias: true, toneMappingExposure: 0.95, alpha: isArMode }}
      onCreated={({ gl }) => {
        if (isArMode) gl.setClearColor(0x000000, 0)
      }}
    >
      <XRClearMode isArMode={isArMode} />
      <XRStatusBridge
        onRendererReady={onRendererReady}
      />
      <XRControllers />
      <XRExitByGrip enabled={isXrActive} />
      <XRMovement enabled={isXrActive} initialOffset={xrInitialOffset} />
      {!isArMode && <Environment preset="dawn" background blur={1} backgroundIntensity={0.6} environmentIntensity={1.05} />}
      <OrbitControls
        ref={controlsRef}
        enabled={!isXrActive}
        enableDamping={!selectedMentalName}
        dampingFactor={selectedMentalName ? 0 : 0.05}
        enableZoom
        enablePan={false}
        enableRotate={!selectedMentalName && !isXrActive}
        minDistance={0.35}
        maxDistance={24}
        maxPolarAngle={Math.PI / 2 - 0.02}
        target={[mind.position.x, mind.position.y, mind.position.z]}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.6} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={50} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
      <directionalLight position={[-5, 3, -5]} intensity={0.85} />
      <pointLight position={[0, 6, 0]} intensity={1.35} distance={15} decay={2} />
      <pointLight position={[0, 0, 5]} intensity={1.0} distance={15} decay={2} />
      {!isArMode && <GroundPlane />}
      <SoundReceiveEffect
        requestId={soundReceiveRequestId}
        mind={mind}
        mentals={mentals}
        planeModelPath={paperPlaneModel}
        onHighlightChange={onSoundReceiveHighlightChange}
        onComplete={onSoundReceiveComplete}
      />
      <SoundReceiveEffect
        requestId={sceneReceiveRequestId}
        mind={mind}
        mentals={mentals}
        planeModelPath={paperPlaneModel}
        onHighlightChange={onSceneReceiveHighlightChange}
        onComplete={onSceneReceiveComplete}
        visualMode="scene"
      />
      {showHumanInScene && (
        <React.Suspense fallback={null}>
          <HumanBody
            mind={mind}
            controlsRef={controlsRef}
            selectedShape={humanShape}
            groundY={effectiveHumanGroundY}
          />
        </React.Suspense>
      )}
      <MindSphere mind={mind} />
      {showMentalsLayer && (
        <MentalsLayer
          mind={mind}
          mentals={mentals}
          selectedMentalName={selectedMentalName}
          onSelectMental={handleSelectMental}
          controlsRef={controlsRef}
          focusTargetRef={focusTargetRef}
          planeModelPath={paperPlaneModel}
          sendMode={sendMode}
          emojiMode={emojiMode}
          blockXrMentalPick={isXrActive && xrTimelineOpen}
          onSendSelection={onSendSelection}
          onHoverSelection={setHoverSelection}
          onSendMeshSelection={setSendMeshSelection}
        />
      )}
      {isXrActive && selected && !profile && (
        <XRInspectPanel
          selection={selected}
          inspectOpen={inspectOpen}
          onViewDetail={onViewDetail}
          onBack={onBackFromDetail}
          onShowProfile={onShowProfile}
          onVoice={onVoiceSelection}
          onClose={onCloseSelection}
          panelWorldAnchorRef={xrPanelWorldAnchorRef}
        />
      )}
      {isXrActive && profile && (
        <XRProfilePanel
          profile={profile}
          attrs={profileAttrs}
          onBack={onCloseProfile}
          panelWorldAnchorRef={xrPanelWorldAnchorRef}
        />
      )}
      {isXrActive && (
        <XRTimelineToggle enabled={isXrActive} onToggle={onToggleXrTimeline} />
      )}
      {isXrActive && xrTimelineOpen && (
        <XRTimelinePanel
          stops={stops}
          selectedIndex={timelineIndex}
          onSelect={onTimelineSelect}
          panelOpen={xrTimelineDetailOpen}
          onOpenPanel={onOpenXrTimelineDetail}
          onClosePanel={onCloseXrTimelineDetail}
          t3HappySelected={t3HappySelected}
          onT3HappyChange={onT3HappyChange}
          t5SelectedId={t5SelectedId}
          onT5Change={onT5Change}
          onSenseSelect={onSenseSelect}
          hasContactMental={hasContactMental}
          personType={personType}
          onPersonTypeChange={onPersonTypeChange}
          timelineMode={timelineMode}
          onTimelineModeChange={onTimelineModeChange}
          slideshowPaused={slideshowPaused}
          onSlideshowPausedChange={onSlideshowPausedChange}
          vithiCurrentEvent={vithiCurrentEvent}
          vithiStageData={vithiStageData}
        />
      )}
      <XROccludedConnector
        focusTargetRef={focusTargetRef}
        selectedMentalName={selectedMentalName}
        enabled={isXrActive}
        panelWorldAnchorRef={xrPanelWorldAnchorRef}
      />
      <PanelPositionSync focusTargetRef={focusTargetRef} selectedMentalName={selectedMentalName} onUpdate={onUpdatePanelPosition} />
      {showMentalsLayer && !isXrActive && (
        <EffectComposer multisampling={2} autoClear={false}>
          <Outline
            selection={outlineSelection}
            blendFunction={BlendFunction.ALPHA}
            visibleEdgeColor={0xffffff}
            hiddenEdgeColor={0x190a05}
            edgeStrength={30}
            resolutionScale={1}
            xRay
          />
        </EffectComposer>
      )}
    </Canvas>
  )
}

export function Simulation(): React.ReactElement {
  const [selected, setSelected] = useState<InspectSelection | null>(null)
  const [inspectOpen, setInspectOpen] = useState(false)
  const [panelPosition, setPanelPosition] = useState<{ x: number; y: number } | null>(null)
  const [profile, setProfile] = useState<InspectSelection | null>(null)
  const [profileAttrs, setProfileAttrs] = useState<Array<{ key: string; value: string }>>([])
  const [profileMarkers, setProfileMarkers] = useState<Array<{ key: string; value: string; position: { x: number; y: number; z: number } }>>([])
  const [attrKey, setAttrKey] = useState('')
  const [attrValue, setAttrValue] = useState('')
  const [sendMode, setSendMode] = useState(false)
  const [emojiMode, setEmojiMode] = useState(false)
  const [soundReceiveRequestId, setSoundReceiveRequestId] = useState(0)
  const [soundReceiveActive, setSoundReceiveActive] = useState(false)
  const [sceneReceiveRequestId, setSceneReceiveRequestId] = useState(0)
  const [sceneReceiveActive, setSceneReceiveActive] = useState(false)
  const [showHumanModel, setShowHumanModel] = useState(false)
  const [humanShape, setHumanShape] = useState<MorphShapeKey>('human')
  const [scriptMentals, setScriptMentals] = useState<Mental[]>([])
  const [scriptMatchedDefaultMentals, setScriptMatchedDefaultMentals] = useState<Mental[]>([])
  const [scriptResultActive, setScriptResultActive] = useState(false)
  const scriptMentalMapRef = useRef<Map<string, Mental>>(new Map())
  const [codeRunnerOpen, setCodeRunnerOpen] = useState(false)
  const [codeRunnerCode, setCodeRunnerCode] = useState(CODE_RUNNER_TEMPLATE)
  const [codeRunnerTimelinePreset, setCodeRunnerTimelinePreset] = useState<string>('__current__')
  const [codeRunnerStatus, setCodeRunnerStatus] = useState<string | null>(null)
  const [codeRunnerErrorLine, setCodeRunnerErrorLine] = useState<number | null>(null)
  const [codeRunnerDirty, setCodeRunnerDirty] = useState(false)

  const [personType, setPersonType] = useState<PersonType>('puthujjana')

  const [vithiQueue, setVithiQueue] = useState<VithiEvent[]>([])
  const vithiProcessingRef = useRef(false)
  const [vithiCurrentEvent, setVithiCurrentEvent] = useState<VithiEvent | null>(null)
  const [vithiStageData, setVithiStageData] = useState<Map<number, VithiStageInfo> | null>(null)
  const [backendMindId, setBackendMindId] = useState<number | null>(null)
  const [activeVariants, setActiveVariants] = useState<Set<string>>(new Set())
  const vithiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [codeRunnerPos, setCodeRunnerPos] = useState<{ x: number; y: number }>({ x: 38, y: 104 })
  const codeRunnerDragRef = useRef<{ active: boolean; dx: number; dy: number }>({ active: false, dx: 0, dy: 0 })
  const codeRunnerHydratedRef = useRef(false)
  const [isMindExplaining, setIsMindExplaining] = useState(false)
  const [isInspectVoicePlaying, setIsInspectVoicePlaying] = useState(false)
  const [explainOverlay, setExplainOverlay] = useState<{ name: string; detail: string; progressLabel: string } | null>(null)
  const [explainHighlight, setExplainHighlight] = useState<THREE.Object3D[]>([])
  const [soundReceiveHighlight, setSoundReceiveHighlight] = useState<THREE.Object3D[]>([])
  const [focusScreenPosition, setFocusScreenPosition] = useState<{ x: number; y: number } | null>(null)
  const [menuRevealReady, setMenuRevealReady] = useState(false)
  const [menuLineProgress, setMenuLineProgress] = useState(1)
  const [timelineIndex, setTimelineIndex] = useState(0)
  const [timelineMode, setTimelineMode] = useState<'manual' | 'slideshow'>('manual')
  const [slideshowPaused, setSlideshowPaused] = useState(false)
  const [t3HappySelected, setT3HappySelected] = useState(false)
  const [t5SelectedId, setT5SelectedId] = useState<string | null>(null)

  const timelineScriptPresetsForStep = useMemo((): TimelineScriptPick[] => {
    if (timelineIndex === 3) {
      return TIMELINE_SCRIPT_CATALOG.filter((p) => p.timelineIndex === 3)
    }
    if (timelineIndex === 5) {
      return TIMELINE_SCRIPT_CATALOG.filter((p) => p.timelineIndex === 5)
    }
    return []
  }, [timelineIndex])

  const showTimelineScriptPresetDropdown = timelineScriptPresetsForStep.length > 0
  const [xrTimelineOpen, setXrTimelineOpen] = useState(false)
  const [xrTimelineDetailOpen, setXrTimelineDetailOpen] = useState(false)
  const timelineSignatureRef = useRef<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const overlayRootRef = useRef<HTMLDivElement | null>(null)
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null)
  const menuRevealFrameRef = useRef<number | null>(null)
  const mentalCacheRef = useRef<Map<MentalVariant, Mental>>(new Map())
  const [sendInfo, setSendInfo] = useState<{ sender?: string | null; receiver?: string | null; status?: string }>({
    status: 'Idle',
  })
  const {
    activeXrMode,
    vrSupport,
    arSupport,
    vrMessage,
    arMessage,
    vrButtonDisabled,
    vrButtonTitle,
    arButtonDisabled,
    arButtonTitle,
    handleToggleVr,
    handleToggleAr,
  } = useXRSession({
    renderer,
    overlayRoot: overlayRootRef.current,
  })
  const isXrActive = activeXrMode !== null

  useEffect(() => {
    if (!isXrActive) {
      setXrTimelineOpen(false)
      setXrTimelineDetailOpen(false)
    }
  }, [isXrActive])

  useEffect(() => {
    if (activeXrMode !== 'ar') return
    setSendMode(false)
    setSelected(null)
    setProfile(null)
  }, [activeXrMode])

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    body.classList.add('simulation-no-scroll')

    if (activeXrMode !== null) {
      // Keep XR layout stable and avoid resize-driven renderer warnings while presenting.
      root.style.setProperty('--mindsim-nav-height', '0px')
      return () => {
        body.classList.remove('simulation-no-scroll')
        root.style.removeProperty('--mindsim-nav-height')
      }
    }

    const updateNavHeight = () => {
      const nav = document.querySelector('.nav') as HTMLElement | null
      const navHeight = nav ? nav.getBoundingClientRect().height : 0
      root.style.setProperty('--mindsim-nav-height', `${Math.round(navHeight)}px`)
    }

    updateNavHeight()
    window.addEventListener('resize', updateNavHeight)
    return () => {
      window.removeEventListener('resize', updateNavHeight)
      body.classList.remove('simulation-no-scroll')
      root.style.removeProperty('--mindsim-nav-height')
    }
  }, [activeXrMode])

  useEffect(() => {
    const nav = document.querySelector('.nav') as HTMLElement | null
    const body = document.body
    if (!nav) return

    const isXrActive = activeXrMode !== null
    if (isXrActive) {
      nav.dataset.preXrDisplay = nav.style.display
      nav.style.display = 'none'
      body.classList.add('xr-active')
    } else {
      nav.style.display = nav.dataset.preXrDisplay ?? ''
      delete nav.dataset.preXrDisplay
      body.classList.remove('xr-active')
    }

    return () => {
      nav.style.display = nav.dataset.preXrDisplay ?? ''
      delete nav.dataset.preXrDisplay
      body.classList.remove('xr-active')
    }
  }, [activeXrMode])

  const mind = useMemo(() => {
    return new Mind({
      name: 'Mind',
      detail: 'Static demo mind',
      position: DEFAULT_MIND_POSITION,
      scale: DEFAULT_MIND_SCALE,
      transparent: true,
      opacity: 0.15,
      color: parseInt('3b82f6', 16),
      labelEnabled: false,
      labelWorldSize: 0.6,
      labelOffset: 0.25,
    })
  }, [])

  useEffect(() => {
    mind.setLabelEnabled(!showHumanModel)
  }, [mind, showHumanModel])

  const getOrCreateMental = useCallback((variant: MentalVariant): Mental => {
    const cached = mentalCacheRef.current.get(variant)
    if (cached) return cached

    const seed = jitterSeedForVariant(resolveSeedForVariant(variant), variant)
    const nextMental = createMentalFromSeed(seed)
    mentalCacheRef.current.set(variant, nextMental)
    return nextMental
  }, [])

  const [mentals, setMentals] = useState<Mental[]>(() =>
    getMentalVariantsForTimelineStop(0, false, null).map((variant) => getOrCreateMental(variant))
  )

  useEffect(() => {
    if (vithiStageData && vithiStageData.size > 0) {
      const allVariants = new Set<MentalVariant>()
      const currentVariants = new Set<string>()
      for (let t = 0; t <= timelineIndex; t++) {
        const stage = vithiStageData.get(t)
        if (!stage || stage.blocked) continue
        const stageVars = stage.mental_details.map((d) =>
          d.name.toLowerCase().replace(/\s+/g, '_') as MentalVariant
        )
        stageVars.forEach((v) => allVariants.add(v))
        if (t === timelineIndex) stageVars.forEach((v) => currentVariants.add(v))
      }
      setActiveVariants(currentVariants)
      setMentals([...allVariants].map((v) => getOrCreateMental(v)))
      return
    }
    setActiveVariants(new Set())
    const variants = getMentalVariantsForTimelineStop(timelineIndex, t3HappySelected, t5SelectedId)
    setMentals(variants.map((variant) => getOrCreateMental(variant)))
  }, [getOrCreateMental, t3HappySelected, t5SelectedId, timelineIndex, vithiStageData])

  const allMentals = useMemo(() => {
    const base = scriptResultActive ? [...scriptMatchedDefaultMentals] : [...mentals]
    scriptMentals.forEach((m) => {
      if (!base.includes(m)) base.push(m)
    })
    return base
  }, [mentals, scriptMatchedDefaultMentals, scriptMentals, scriptResultActive])

  useEffect(() => {
    if (activeVariants.size === 0) return
    allMentals.forEach((m) => {
      const variant = m.getName().toLowerCase().replace(/\s+/g, '_')
      m.setGlow(activeVariants.has(variant))
    })
  }, [allMentals, activeVariants])

  const hasContactMental = useMemo(
    () => allMentals.some((m) => m instanceof ContactMental),
    [allMentals],
  )

  useEffect(() => {
    mind.setLabelDepthOcclusion(isXrActive)
    allMentals.forEach((mental) => {
      mental.setLabelDepthOcclusion(isXrActive)
    })
  }, [allMentals, isXrActive, mind])

  useEffect(() => {
    const signature = `${timelineIndex}|${t3HappySelected ? '1' : '0'}|${t5SelectedId ?? ''}`
    if (!timelineSignatureRef.current) {
      timelineSignatureRef.current = signature
      return
    }
    if (signature === timelineSignatureRef.current) return
    timelineSignatureRef.current = signature
    if (!scriptResultActive && scriptMentals.length === 0 && scriptMatchedDefaultMentals.length === 0) return
    scriptMentalMapRef.current.forEach((mental) => mental.dispose())
    scriptMentalMapRef.current.clear()
    setScriptMentals([])
    setScriptMatchedDefaultMentals([])
    setScriptResultActive(false)
    setCodeRunnerStatus((prev) => (prev ? 'Timeline changed: script result cleared.' : prev))
  }, [
    scriptMatchedDefaultMentals.length,
    scriptMentals.length,
    scriptResultActive,
    t3HappySelected,
    t5SelectedId,
    timelineIndex,
  ])

  useEffect(() => {
    return () => {
      cancelNarration()
      mind.stopMentalExplanationAnimation()
      const activeMentals = new Set(mind.getMentals())
      mind.dispose()
      scriptMentalMapRef.current.forEach((mental) => {
        if (!activeMentals.has(mental)) mental.dispose()
      })
      scriptMentalMapRef.current.clear()
      mentalCacheRef.current.forEach((mental) => {
        if (!activeMentals.has(mental)) {
          mental.dispose()
        }
      })
      mentalCacheRef.current.clear()
    }
  }, [mind])

  const searchHighlight = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return [] as THREE.Object3D[]
    return allMentals
      .filter((m) => m.getName().toLowerCase().includes(term))
      .flatMap((m) => {
        const mesh = m.getMesh()
        return mesh ? [mesh] : []
      })
  }, [allMentals, searchTerm])

  const handleSelect = (info: InspectSelection) => {
    if (menuRevealFrameRef.current !== null) {
      cancelAnimationFrame(menuRevealFrameRef.current)
      menuRevealFrameRef.current = null
    }

    setSelected(info)
    setInspectOpen(false)
    setFocusScreenPosition(info.screenPosition ?? null)
    setMenuRevealReady(false)
    setMenuLineProgress(0)
    if (info.screenPosition) {
      const src = info.screenPosition
      if (typeof window !== 'undefined' && overlayRootRef.current) {
        const rect = overlayRootRef.current.getBoundingClientRect()
        const overlayCenter = {
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY + rect.height / 2,
        }

        const outward = {
          x: src.x - overlayCenter.x,
          y: src.y - overlayCenter.y,
        }
        const length = Math.hypot(outward.x, outward.y)
        const nx = length > 1e-5 ? outward.x / length : 0.9
        const ny = length > 1e-5 ? outward.y / length : -0.4
        const pushDistance = 210

        const desiredX = src.x + nx * pushDistance
        const desiredY = src.y + ny * pushDistance

        const menuWidth = 260
        const menuHeight = 210
        const margin = 12

        const minX = rect.left + window.scrollX + menuWidth / 2 + margin
        const maxX = rect.left + window.scrollX + rect.width - menuWidth / 2 - margin
        // Menu uses translate(-50%, -100%), so anchor Y is bottom edge.
        const minY = rect.top + window.scrollY + menuHeight + margin
        const maxY = rect.top + window.scrollY + rect.height - margin

        setPanelPosition({
          x: THREE.MathUtils.clamp(desiredX, minX, maxX) - 28,
          y: THREE.MathUtils.clamp(desiredY, minY, maxY),
        })
      } else {
        setPanelPosition({ x: src.x - 28, y: src.y })
      }
    } else if (typeof window !== 'undefined') {
      setPanelPosition({
        x: window.scrollX + window.innerWidth - 238,
        y: window.scrollY + window.innerHeight * 0.52,
      })
    } else {
      setPanelPosition(null)
    }

    const startTs = typeof performance !== 'undefined' ? performance.now() : Date.now()
    const durationMs = 360
    const step = (nowTs: number) => {
      const elapsed = nowTs - startTs
      const t = THREE.MathUtils.clamp(elapsed / durationMs, 0, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setMenuLineProgress(eased)
      if (t < 1) {
        menuRevealFrameRef.current = requestAnimationFrame(step)
        return
      }
      menuRevealFrameRef.current = null
      setMenuRevealReady(true)
    }
    menuRevealFrameRef.current = requestAnimationFrame(step)
  }

  const handleViewDetail = (info: InspectSelection) => {
    setSelected(info)
    setFocusScreenPosition((prev) => prev ?? info.screenPosition ?? null)
    setInspectOpen(true)
  }

  const handleBackFromDetail = () => {
    setInspectOpen(false)
  }

  const handleClose = () => {
    if (menuRevealFrameRef.current !== null) {
      cancelAnimationFrame(menuRevealFrameRef.current)
      menuRevealFrameRef.current = null
    }
    setSelected(null)
    setInspectOpen(false)
    setPanelPosition(null)
    setFocusScreenPosition(null)
    setMenuRevealReady(false)
    setMenuLineProgress(1)
  }

  const handleShowProfile = (info: InspectSelection) => {
    setProfile(info)
    const mental = allMentals.find((m) => m.getName() === info.name && m.getType?.() === 'perception_mental')
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

  const handleSpeakInspectSelection = useCallback(async (selection: InspectSelection) => {
    const detail = selection.detail?.trim() || 'No detail provided.'
    const text = `${selection.name}. ${detail}`
    const hasThai = /[\u0E00-\u0E7F]/.test(text)
    setIsInspectVoicePlaying(true)
    try {
      await speakNarration(text, { lang: hasThai ? 'th-TH' : 'en-US' })
    } catch (error) {
      console.error('Inspect narration failed', error)
    } finally {
      setIsInspectVoicePlaying(false)
    }
  }, [])

  const handleAddAttribute = () => {
    const key = attrKey.trim()
    if (!key) return
    const mental = allMentals.find((m) => m.getName() === profile?.name && m.getType?.() === 'perception_mental')
    if (mental && mental instanceof PerceptionMental) {
      mental.addAttribute(key, attrValue)
      setProfileAttrs(mental.getAttributes())
      setProfileMarkers(mental.getAttributeMarkers())
      setAttrKey('')
      setAttrValue('')
    }
  }

  const parseNumberList = useCallback((value: string): [number, number, number] | null => {
    const match = value.match(/\[([^\]]+)\]/)
    if (!match) return null
    const parts = match[1].split(',').map((v) => Number.parseFloat(v.trim()))
    if (parts.length !== 3 || parts.some((v) => Number.isNaN(v))) return null
    return [parts[0], parts[1], parts[2]]
  }, [])

  const stringifyCodeText = useCallback((value: string): string => {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }, [])

  const toHexColor = useCallback((color: string): string => {
    const normalized = color.trim()
    if (/^#[0-9a-fA-F]{6}$/.test(normalized)) return normalized.toLowerCase()
    const parsed = Number.parseInt(normalized, 10)
    if (!Number.isNaN(parsed)) return `#${(parsed & 0xffffff).toString(16).padStart(6, '0')}`
    return '#3b82f6'
  }, [])

  const formatVec = useCallback((vec: [number, number, number]): string => {
    return `[${vec[0].toFixed(3)}, ${vec[1].toFixed(3)}, ${vec[2].toFixed(3)}]`
  }, [])

  const normalizeMentalName = useCallback((value: string): string => {
    return value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
  }, [])

  const generateCodeFromCurrentScene = useCallback((): string => {
    const lines: string[] = []
    const mindName = mind.getName() || 'Mind'
    const mindColor = toHexColor(`#${(mind.color & 0xffffff).toString(16).padStart(6, '0')}`)
    const mindScale = mind.scale
    lines.push('m = Mind()')
    lines.push(`m.name = ${stringifyCodeText(mindName)}`)
    lines.push(`m.color = ${stringifyCodeText(mindColor)}`)
    lines.push(`m.scale = ${Number.isFinite(mindScale) ? mindScale.toFixed(3) : DEFAULT_MIND_SCALE.toFixed(3)}`)
    lines.push('')

    mentals.forEach((mental, index) => {
      const varName = `mt${index + 1}`
      const pos = mental.getPosition()
      const ctorName =
        (mental as unknown as { constructor?: { name?: string } }).constructor?.name ?? 'Mental'
      const scriptCtor = ctorName.endsWith('Mental') ? ctorName : 'Mental'
      lines.push(`${varName} = ${scriptCtor}()`)
      lines.push(`${varName}.name = ${stringifyCodeText(mental.getName())}`)
      lines.push(`${varName}.color = ${stringifyCodeText(toHexColor(`#${(mental.color & 0xffffff).toString(16).padStart(6, '0')}`))}`)
      lines.push(`${varName}.scale = ${mental.scale.toFixed(3)}`)
      lines.push(`${varName}.position = ${formatVec([pos.x, pos.y, pos.z])}`)
      lines.push(`m.add(${varName})`)
      lines.push('')
    })

    return lines.join('\n').trim() || CODE_RUNNER_TEMPLATE
  }, [formatVec, mentals, mind, stringifyCodeText, toHexColor])

  const handleCodeRunnerTimelinePreset = useCallback(
    (presetId: string) => {
      setCodeRunnerTimelinePreset(presetId)
      setCodeRunnerDirty(false)
      setCodeRunnerErrorLine(null)
      if (presetId === '__current__') {
        setCodeRunnerCode(generateCodeFromCurrentScene())
        setCodeRunnerStatus('Editor: code matches the current scene (right panel).')
        return
      }
      const pick = TIMELINE_SCRIPT_CATALOG.find((p) => p.id === presetId)
      if (!pick) return
      setCodeRunnerCode(generateCodeRunnerDslForTimelinePick(pick, mind))
      setCodeRunnerStatus('Editor: sample code for this choice. Run script to apply; scene uses the panel until then.')
    },
    [generateCodeFromCurrentScene, mind],
  )

  const handleDownloadAllTimelineScripts = useCallback(() => {
    const text = buildAllTimelineScriptsBundle(mind)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mindsim-timeline-code-runner-scripts.txt'
    a.click()
    URL.revokeObjectURL(url)
    setCodeRunnerStatus(`Downloaded bundle (${TIMELINE_SCRIPT_CATALOG.length} scripts).`)
  }, [mind])

  useEffect(() => {
    if (codeRunnerDirty) return
    let preset = codeRunnerTimelinePreset
    const presetOkForStep =
      preset === '__current__' ||
      preset === '__custom__' ||
      (timelineIndex === 3 && (preset === 't3-unhappy' || preset === 't3-happy')) ||
      (timelineIndex === 5 && preset.startsWith('t5-'))
    if (!presetOkForStep) {
      setCodeRunnerTimelinePreset('__current__')
      preset = '__current__'
    }
    if (preset !== '__current__') return
    const nextCode = generateCodeFromCurrentScene()
    setCodeRunnerCode(nextCode)
    codeRunnerHydratedRef.current = true
    if (codeRunnerOpen) {
      setCodeRunnerStatus('Editor: code matches the current scene (right panel).')
      setCodeRunnerErrorLine(null)
    }
  }, [
    codeRunnerDirty,
    codeRunnerOpen,
    codeRunnerTimelinePreset,
    generateCodeFromCurrentScene,
    t3HappySelected,
    t5SelectedId,
    timelineIndex,
  ])

  useEffect(() => {
    if (timelineIndex !== 0 && codeRunnerOpen) {
      setCodeRunnerOpen(false)
      setCodeRunnerStatus('Code Runner closed — only available at T0 (Awakening).')
    }
  }, [timelineIndex, codeRunnerOpen])

  useEffect(() => {
    if (timelineMode !== 'slideshow' || slideshowPaused) return
    const maxIdx = TIMELINE_STOPS.length - 1
    if (timelineIndex >= maxIdx) return
    const timer = setInterval(() => {
      setTimelineIndex((prev) => {
        if (prev >= maxIdx) {
          setSlideshowPaused(true)
          return prev
        }
        return prev + 1
      })
    }, 10000)
    return () => clearInterval(timer)
  }, [timelineMode, slideshowPaused, timelineIndex])

  const handleRunCodeRunner = useCallback(async () => {
    const parser = new CodeParser()
    let actions: ParsedAction[]
    try {
      actions = parser.parse(codeRunnerCode)
      setCodeRunnerErrorLine(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Parse error'
      const lineMatch = message.match(/Line\s+(\d+)/i)
      setCodeRunnerErrorLine(lineMatch ? Number.parseInt(lineMatch[1], 10) : null)
      setCodeRunnerStatus(message)
      return
    }

    const scriptMindVars = new Set<string>()
    const linkedMentalVars = new Set<string>()
    const newMentalsByVar = new Map<string, Mental>()
    const nowMentalsByVar = new Map<string, Mental>()
    const usedDefaultMentals = new Set<Mental>()
    const defaultMentalsByName = new Map<string, Mental>()
    const plannedMentalNameByVar = new Map<string, string>()

    actions.forEach((action) => {
      if (action.type === 'create_mental') {
        plannedMentalNameByVar.set(action.variable, action.data.name || '')
      } else if (action.type === 'update_mental_attribute' && action.attribute === 'name') {
        plannedMentalNameByVar.set(action.variable, action.value)
      } else if (action.type === 'add_mental_to_mind') {
        linkedMentalVars.add(action.mentalVariable)
      }
    })

    mentals.forEach((mental) => {
      const key = normalizeMentalName(mental.getName())
      if (!key || defaultMentalsByName.has(key)) return
      defaultMentalsByName.set(key, mental)
    })

    // Keep default mentals, but reset previously scripted output each run.
    scriptMentalMapRef.current.forEach((mental) => mental.dispose())
    scriptMentalMapRef.current.clear()

    actions.forEach((action) => {
      if (action.type === 'create_mind') {
        scriptMindVars.add(action.variable)
        mind.setName(action.data.name || mind.getName())
        mind.setColor(action.data.color || '#3b82f6')
        mind.setScale(action.data.scale || DEFAULT_MIND_SCALE)
        mind.setPosition(action.data.position || DEFAULT_MIND_POSITION)
      } else if (action.type === 'create_mental') {
        if (!linkedMentalVars.has(action.variable)) return
        const targetName = plannedMentalNameByVar.get(action.variable) || action.data.name || ''
        const maybeName = normalizeMentalName(targetName)
        const matchedDefault =
          maybeName.length > 0 ? defaultMentalsByName.get(maybeName) ?? null : null
        const canReuseDefault = Boolean(matchedDefault && !usedDefaultMentals.has(matchedDefault))
        const mental =
          canReuseDefault && matchedDefault
            ? matchedDefault
            : new Mental({
                name: action.data.name || 'Mental Sphere',
                detail: '',
                color: action.data.color || '#ff6b9d',
                scale: action.data.scale || 0.12,
                position: action.data.position || [0, 0, 0],
                labelEnabled: false,
                motionSpeed: 0.0012,
                opacity: 0.55,
              })
        mental.setName(action.data.name || mental.getName())
        mental.setColor(action.data.color || '#ff6b9d')
        mental.setScale(action.data.scale || 0.12)
        mental.setPosition(action.data.position || [0, 0, 0])
        mental.setFrozen(false)
        if (canReuseDefault && matchedDefault) {
          usedDefaultMentals.add(matchedDefault)
        } else {
          newMentalsByVar.set(action.variable, mental)
        }
        nowMentalsByVar.set(action.variable, mental)
      } else if (action.type === 'update_mind_attribute') {
        if (action.attribute === 'name') mind.setName(action.value)
        else if (action.attribute === 'color') mind.setColor(action.value)
        else if (action.attribute === 'scale') {
          const scale = Number.parseFloat(action.value)
          if (!Number.isNaN(scale)) mind.setScale(scale)
        } else if (action.attribute === 'position') {
          const vec = parseNumberList(action.value)
          if (vec) mind.setPosition(vec)
        }
      } else if (action.type === 'update_mental_attribute') {
        if (!linkedMentalVars.has(action.variable)) return
        const mental = nowMentalsByVar.get(action.variable)
        if (!mental) return
        if (action.attribute === 'name') mental.setName(action.value)
        else if (action.attribute === 'color') mental.setColor(action.value)
        else if (action.attribute === 'scale') {
          const scale = Number.parseFloat(action.value)
          if (!Number.isNaN(scale)) mental.setScale(scale)
        } else if (action.attribute === 'position') {
          const vec = parseNumberList(action.value)
          if (vec) mental.setPosition(vec)
        } else if (action.attribute === 'detail') {
          mental.setDetail(action.value)
        }
        nowMentalsByVar.set(action.variable, mental)
      } else if (action.type === 'add_mental_to_mind') {
        const linked = nowMentalsByVar.get(action.mentalVariable)
        if (linked) {
          nowMentalsByVar.set(action.mentalVariable, linked)
          scriptMindVars.add(action.mindVariable)
        }
      }
    })

    // Collect all mental names for validation
    const allLinkedNames: string[] = []
    nowMentalsByVar.forEach((mental) => {
      allLinkedNames.push(mental.getName())
    })

    const validation = validateMentalComposition(allLinkedNames, personType)
    if (!validation.valid) {
      setCodeRunnerErrorLine(null)
      setCodeRunnerStatus(`Validation failed:\n${validation.errors.join('\n')}`)
      return
    }

    const localMsg = `Applied ${actions.length} action(s), ${scriptMindVars.size} mind var(s), ${linkedMentalVars.size} linked mental var(s), ${newMentalsByVar.size} scripted + ${usedDefaultMentals.size} matched default mental(s).`
    setCodeRunnerStatus(`${localMsg} Persisting...`)

    const pythonCode = convertDslToPython(codeRunnerCode)
    try {
      const res = await fetch(`${API_BASE}/api/execute_code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pythonCode }),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
        setCodeRunnerStatus(`${localMsg} Backend error: ${errBody.detail || `HTTP ${res.status}`}`)
        return
      }
      const data: {
        summary?: { minds_created?: number; mentals_created?: number }
        created_minds?: Array<{ id: number }>
      } = await res.json()
      const mc = data.summary?.minds_created ?? 0
      const mtc = data.summary?.mentals_created ?? 0

      const lastMindId = data.created_minds?.length
        ? data.created_minds[data.created_minds.length - 1].id
        : null
      if (lastMindId !== null) setBackendMindId(lastMindId)

      newMentalsByVar.forEach((mental, variable) => {
        scriptMentalMapRef.current.set(variable, mental)
      })
      setScriptMentals(Array.from(newMentalsByVar.values()))
      setScriptMatchedDefaultMentals(Array.from(usedDefaultMentals))
      setScriptResultActive(true)

      setCodeRunnerStatus(`${localMsg} Persisted ${mc} mind(s) and ${mtc} mental(s).${lastMindId !== null ? ` Mind ID: ${lastMindId}` : ''}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setCodeRunnerStatus(`${localMsg} (Backend: ${msg})`)
    }
  }, [codeRunnerCode, mentals, mind, normalizeMentalName, parseNumberList, personType])

  useEffect(() => {
    if (vithiQueue.length === 0) {
      vithiProcessingRef.current = false
      setVithiCurrentEvent(null)
      return
    }
    if (vithiProcessingRef.current) return
    vithiProcessingRef.current = true
    const next = vithiQueue[0]
    setVithiCurrentEvent(next)
    const id = setTimeout(() => {
      vithiProcessingRef.current = false
      setVithiQueue((q) => q.slice(1))
    }, 400)
    return () => clearTimeout(id)
  }, [vithiQueue])

  const handleSenseSelect = useCallback((senseId: string, variantParams: VithiParams) => {
    const apiSense = SENSE_BUTTON_TO_API[senseId] || 'eye'
    const sannaMental = allMentals.find((m) => m instanceof PerceptionMental) as PerceptionMental | undefined
    fetch(`${API_BASE}/api/vithi/pancadvara`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sense: apiSense,
        ...variantParams,
        person_type: personType,
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: { events?: VithiEvent[]; updated_experience_weight?: Record<string, number> }) => {
        if (data.events) setVithiQueue(data.events)
        if (data.updated_experience_weight && sannaMental) {
          sannaMental.updateExperienceWeightFromResponse(data.updated_experience_weight)
        }

        if (data.events && data.events.length > 0) {
          const stageMap = new Map<number, VithiStageInfo>()
          const grouped = new Map<string, VithiEvent[]>()
          for (const ev of data.events) {
            const list = grouped.get(ev.stage) || []
            list.push(ev)
            grouped.set(ev.stage, list)
          }

          for (let tIdx = 0; tIdx < VITHI_STAGE_ORDER.length; tIdx++) {
            const stageName = VITHI_STAGE_ORDER[tIdx]
            const eventsForStage = grouped.get(stageName)
            if (!eventsForStage || eventsForStage.length === 0) {
              stageMap.set(tIdx, {
                mind_id: null,
                mind_id_range: null,
                mind_name: null,
                description: `No citta at ${stageName.replace(/_/g, ' ')}`,
                mental_ids: [],
                mental_details: [],
                blocked: true,
              })
              continue
            }

            const allMentalIds = new Set<number>()
            const allDetails = new Map<number, VithiMentalDetail>()
            let firstMindId: number | null = null
            let rangeMindIds: number[] | null = null
            let mindName: string | null = null
            let desc = ''

            for (const ev of eventsForStage) {
              if (ev.mind_id && !firstMindId) firstMindId = ev.mind_id
              if (ev.mind_id_range) {
                if (!rangeMindIds) rangeMindIds = [...ev.mind_id_range]
                else {
                  const lo = Math.min(rangeMindIds[0], ev.mind_id_range[0])
                  const hi = Math.max(rangeMindIds[rangeMindIds.length - 1], ev.mind_id_range[ev.mind_id_range.length - 1])
                  rangeMindIds = [lo, hi]
                }
              }
              if (ev.mind_name && !mindName) mindName = ev.mind_name
              if (ev.description) desc = ev.description
              for (const mid of (ev.mental_ids ?? [])) allMentalIds.add(mid)
              for (const d of (ev.mental_details ?? [])) allDetails.set(d.id, d)
            }

            stageMap.set(tIdx, {
              mind_id: firstMindId,
              mind_id_range: rangeMindIds,
              mind_name: mindName,
              description: desc,
              mental_ids: Array.from(allMentalIds).sort((a, b) => a - b),
              mental_details: Array.from(allDetails.values()),
              blocked: false,
            })
          }
          setVithiStageData(stageMap)

          if (timelineMode === 'slideshow') {
            setTimelineIndex(0)
            setSlideshowPaused(false)
          }
        }
      })
      .catch((err: unknown) => {
        console.error('Vithi API error:', err)
      })
  }, [allMentals, personType, timelineMode])

  const handleClearCodeRunnerMentals = useCallback(() => {
    scriptMentalMapRef.current.forEach((mental) => mental.dispose())
    scriptMentalMapRef.current.clear()
    setScriptMentals([])
    setScriptMatchedDefaultMentals([])
    setScriptResultActive(false)
    setCodeRunnerErrorLine(null)
    setCodeRunnerStatus('Cleared scripted mentals.')
  }, [])

  const handleCodeRunnerPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-cr-drag-handle]') === null) return
    codeRunnerDragRef.current.active = true
    codeRunnerDragRef.current.dx = e.clientX - codeRunnerPos.x
    codeRunnerDragRef.current.dy = e.clientY - codeRunnerPos.y
    const handleMove = (ev: PointerEvent) => {
      if (!codeRunnerDragRef.current.active) return
      setCodeRunnerPos({
        x: Math.max(8, ev.clientX - codeRunnerDragRef.current.dx),
        y: Math.max(8, ev.clientY - codeRunnerDragRef.current.dy),
      })
    }
    const handleUp = () => {
      codeRunnerDragRef.current.active = false
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
    }
    window.addEventListener('pointermove', handleMove, { passive: true })
    window.addEventListener('pointerup', handleUp)
  }, [codeRunnerPos.x, codeRunnerPos.y])

  const handleExplainMind = useCallback(async () => {
    if (isMindExplaining) return
    setIsMindExplaining(true)
    setSendMode(false)
    setSelected(null)
    setInspectOpen(false)
    setPanelPosition(null)
    setFocusScreenPosition(null)
    setExplainHighlight([])
    setExplainOverlay({
      name: mind.getName() || 'Mind',
      detail: mind.getDetail() || 'Introducing the mind and its mentals.',
      progressLabel: 'Starting explanation...',
    })

    try {
      await mind.explainMindMentalsAnimation({
        outDurationMs: 620,
        holdDurationMs: 220,
        returnDurationMs: 520,
        outDistanceWorld: 0.62,
        // Present spheres in front of the mind (camera-facing view).
        presentationDirectionLocal: { x: 0, y: 0.14, z: 1 },
        presentationSpread: 0.024,
        onStart: async () => {
          const mindMesh = mind.getMesh()
          setExplainHighlight(mindMesh ? [mindMesh] : [])
          const overviewDetail = mind.getDetail() || 'Static demo mind'
          setExplainOverlay({
            name: mind.getName() || 'Mind',
            detail: overviewDetail,
            progressLabel: 'Mind overview',
          })
          await speakNarration(`${mind.getName() || 'Mind'}. ${overviewDetail}`)
        },
        onMentalFocus: async ({ mental, index, total }) => {
          const mesh = mental.getMesh()
          setExplainHighlight(mesh ? [mesh] : [])
          const detail = mental.getDetail() || 'No detail provided.'
          setExplainOverlay({
            name: mental.getName(),
            detail,
            progressLabel: `Mental ${index + 1} / ${total}`,
          })
          await speakNarration(`${mental.getName()}. ${detail}`)
        },
        onComplete: () => {
          setExplainHighlight([])
          setExplainOverlay(null)
        },
      })
    } catch (error) {
      console.error('Failed to run mind explanation animation', error)
    } finally {
      cancelNarration()
      setExplainHighlight([])
      setExplainOverlay(null)
      setIsMindExplaining(false)
    }
  }, [isMindExplaining, mind])

  const getOverlayPoint = useCallback((point: { x: number; y: number } | null): { x: number; y: number } | null => {
    if (!point || !overlayRootRef.current || typeof window === 'undefined') return null
    const rect = overlayRootRef.current.getBoundingClientRect()
    return {
      x: point.x - (rect.left + window.scrollX),
      y: point.y - (rect.top + window.scrollY),
    }
  }, [])

  const menuConnectorStart = getOverlayPoint(focusScreenPosition ?? selected?.screenPosition ?? null)
  const menuConnectorEnd = getOverlayPoint(panelPosition)
  const showMenuConnector = Boolean(!isXrActive && selected && menuConnectorStart && menuConnectorEnd)
  const connectorProgress = menuRevealReady ? 1 : menuLineProgress
  const connectorAnimatedEnd =
    menuConnectorStart && menuConnectorEnd
      ? {
          x: menuConnectorStart.x + (menuConnectorEnd.x - menuConnectorStart.x) * connectorProgress,
          y: menuConnectorStart.y + (menuConnectorEnd.y - menuConnectorStart.y) * connectorProgress,
        }
      : null

  useEffect(() => {
    return () => {
      if (menuRevealFrameRef.current !== null) {
        cancelAnimationFrame(menuRevealFrameRef.current)
        menuRevealFrameRef.current = null
      }
    }
  }, [])

  const VITHI_STAGE_LABELS: Record<string, string> = {
    pancadvaravajjana: 'Pancadvaravajjana — five-door adverting',
    pancavinnana: 'Pancavinnana — sense consciousness',
    sampaticchana: 'Sampaticchana — receiving',
    santirana: 'Santirana — investigating',
    votthapana: 'Votthapana — determining',
    javana: 'Javana — impulsion',
    tadalammana: 'Tadalammana — registration',
  }

  const dynamicStops = useMemo(() => {
    if (!vithiStageData || vithiStageData.size === 0) return TIMELINE_STOPS
    return TIMELINE_STOPS.map((stop, i) => {
      const stage = vithiStageData.get(i)
      if (!stage) return stop
      const stageName = VITHI_STAGE_ORDER[i]
      const vithiLabel = stageName ? VITHI_STAGE_LABELS[stageName] : null
      if (stage.blocked) {
        return { label: stop.label, description: `${vithiLabel ?? stop.description} — (blocked)` }
      }
      return {
        label: stop.label,
        description: vithiLabel
          ? `${vithiLabel}${stage.mind_name ? ` (${stage.mind_name})` : ''}`
          : stop.description,
      }
    })
  }, [vithiStageData])

  return (
    <main className="page simulation-page">
      <div ref={overlayRootRef} className="simulation-full" style={{ position: 'relative' }}>
        {showMenuConnector && menuConnectorStart && connectorAnimatedEnd && (
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 19,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            <defs>
              <linearGradient id="inspect-menu-connector-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(56,189,248,0.95)" />
                <stop offset="100%" stopColor="rgba(167,139,250,0.95)" />
              </linearGradient>
            </defs>
            <line
              x1={menuConnectorStart.x}
              y1={menuConnectorStart.y}
              x2={connectorAnimatedEnd.x}
              y2={connectorAnimatedEnd.y}
              stroke="url(#inspect-menu-connector-gradient)"
              strokeWidth={2.8}
              strokeLinecap="round"
            />
          </svg>
        )}
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
              setSendMode((prev) => {
                const next = !prev
                if (activeXrMode === 'ar') setShowHumanModel(!next)
                if (next) setEmojiMode(false)
                return next
              })
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
            onClick={() => {
              setSendMode(false)
              setEmojiMode(false)
              setSelected(null)
              setInspectOpen(false)
              setProfile(null)
              setSceneReceiveActive(false)
              setSendInfo({ sender: 'Sound', receiver: 'Contact', status: 'Receiving...' })
              setSoundReceiveActive(true)
              setSoundReceiveRequestId((prev) => prev + 1)
            }}
            disabled={soundReceiveActive || sceneReceiveActive}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: soundReceiveActive ? '#22c55e' : '#6366f1',
              color: 'white',
              cursor: (soundReceiveActive || sceneReceiveActive) ? 'wait' : 'pointer',
              fontWeight: 600,
              opacity: (soundReceiveActive || sceneReceiveActive) ? 0.9 : 1,
            }}
          >
            {soundReceiveActive ? 'Receiving Sound...' : 'Receive Sound Data'}
          </button>
          <button
            type="button"
            onClick={() => {
              setSendMode(false)
              setEmojiMode(false)
              setSelected(null)
              setInspectOpen(false)
              setProfile(null)
              setSoundReceiveActive(false)
              setSendInfo({ sender: 'Scene', receiver: 'Contact', status: 'Receiving...' })
              setSceneReceiveActive(true)
              setSceneReceiveRequestId((prev) => prev + 1)
            }}
            disabled={soundReceiveActive || sceneReceiveActive}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: sceneReceiveActive ? '#22c55e' : '#7c3aed',
              color: 'white',
              cursor: (soundReceiveActive || sceneReceiveActive) ? 'wait' : 'pointer',
              fontWeight: 600,
              opacity: (soundReceiveActive || sceneReceiveActive) ? 0.9 : 1,
            }}
          >
            {sceneReceiveActive ? 'Receiving Scene...' : 'Receive Scene Data'}
          </button>
          <button
            type="button"
            onClick={() => {
              setEmojiMode((prev) => {
                const next = !prev
                if (next) {
                  setSendMode(false)
                  setSelected(null)
                  setInspectOpen(false)
                  setProfile(null)
                }
                return next
              })
            }}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: emojiMode ? '#22c55e' : '#64748b',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {emojiMode ? 'Exit Emoji' : 'Emoji'}
          </button>
          <button
            type="button"
            onClick={handleExplainMind}
            disabled={isMindExplaining}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: isMindExplaining ? '#22c55e' : '#64748b',
              color: 'white',
              cursor: isMindExplaining ? 'wait' : 'pointer',
              fontWeight: 600,
              opacity: isMindExplaining ? 0.9 : 1,
            }}
          >
            {isMindExplaining ? 'Explaining Mind...' : 'Explain Mind'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowHumanModel((prev) => {
                const next = !prev
                if (activeXrMode === 'ar' && next) setSendMode(false)
                return next
              })
            }}
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
          {showHumanModel && (
            <select
              value={humanShape}
              onChange={(e) => setHumanShape(e.target.value as MorphShapeKey)}
              style={{
                padding: '6px 8px',
                borderRadius: 6,
                border: '1px solid rgba(255,255,255,0.3)',
                background: 'rgba(15,23,42,0.75)',
                color: 'white',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              <option value="sphere">Sphere</option>
              <option value="cube">Cube</option>
              <option value="human">Human</option>
              <option value="dog">Dog</option>
              <option value="angel">Angel</option>
            </select>
          )}
          <button
            type="button"
            onClick={() => setSearchOpen((prev) => !prev)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: searchOpen ? '#22c55e' : '#64748b',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Search
          </button>
          {searchOpen && (
            <>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchOpen(false)}
                placeholder="Search mental sphere..."
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  width: 160,
                  fontSize: 13,
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', fontSize: 12 }}
              >
                Close
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              if (timelineIndex !== 0 && !codeRunnerOpen) {
                setCodeRunnerStatus('Code Runner is only available at T0 (Awakening). Please navigate back to T0.')
                return
              }
              if (!codeRunnerOpen && !codeRunnerDirty) {
                setCodeRunnerCode(generateCodeFromCurrentScene())
                setCodeRunnerTimelinePreset('__current__')
                codeRunnerHydratedRef.current = true
                setCodeRunnerStatus('Loaded script from current mind and mentals.')
                setCodeRunnerErrorLine(null)
              }
              setCodeRunnerOpen((prev) => !prev)
            }}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: codeRunnerOpen ? '#7c3aed' : '#475569',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {codeRunnerOpen ? 'Hide Code Runner' : 'Code Runner'}
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
              background: vrButtonDisabled ? '#334155' : activeXrMode === 'vr' ? '#ef4444' : '#0ea5e9',
              color: 'white',
              cursor: vrButtonDisabled ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: vrButtonDisabled ? 0.8 : 1,
            }}
          >
            {activeXrMode === 'vr' ? 'Exit VR' : 'VR Mode'}
          </button>
          <button
            type="button"
            onClick={handleToggleAr}
            disabled={arButtonDisabled}
            title={arButtonTitle}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: 'none',
              background: arButtonDisabled ? '#334155' : activeXrMode === 'ar' ? '#ef4444' : '#f97316',
              color: 'white',
              cursor: arButtonDisabled ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              opacity: arButtonDisabled ? 0.8 : 1,
            }}
          >
            {activeXrMode === 'ar' ? 'Exit AR' : 'AR Mode'}
          </button>
          <div style={{ display: 'flex', gap: 10 }}>
            <span>Sender: {sendInfo.sender ?? '—'}</span>
            <span>Receiver: {sendInfo.receiver ?? '—'}</span>
            <span>Status: {sendInfo.status ?? 'Idle'}</span>
            <span>
              VR:{' '}
              {activeXrMode === 'vr'
                ? 'On'
                : vrSupport === 'supported'
                  ? 'Ready'
                  : vrSupport === 'checking'
                    ? 'Checking'
                    : 'Unavailable'}
            </span>
            <span>
              AR:{' '}
              {activeXrMode === 'ar'
                ? 'On'
                : arSupport === 'supported'
                  ? 'Ready'
                  : arSupport === 'checking'
                    ? 'Checking'
                    : 'Unavailable'}
            </span>
            {vrMessage && <span style={{ color: '#fbbf24' }}>{vrMessage}</span>}
            {arMessage && <span style={{ color: '#fbbf24' }}>{arMessage}</span>}
          </div>
        </div>
        {isMindExplaining && explainOverlay && (
          <div
            style={{
              position: 'absolute',
              left: 26,
              top: 68,
              zIndex: 14,
              width: 280,
              pointerEvents: 'none',
              color: '#0f172a',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                border: '2px solid rgba(15,23,42,0.8)',
                background: 'rgba(255,255,255,0.58)',
                backdropFilter: 'blur(3px)',
                padding: '8px 10px',
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  border: '3px solid rgba(15,23,42,0.9)',
                  background: 'rgba(255,255,255,0.35)',
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.75 }}>{explainOverlay.progressLabel}</div>
                <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.08 }}>{explainOverlay.name}</div>
              </div>
            </div>
            <div
              style={{
                border: '2px solid rgba(15,23,42,0.8)',
                background: 'rgba(255,255,255,0.58)',
                backdropFilter: 'blur(3px)',
                minHeight: 122,
                padding: '12px 14px',
                fontSize: 16,
                lineHeight: 1.35,
                whiteSpace: 'pre-wrap',
              }}
            >
              {explainOverlay.detail}
            </div>
          </div>
        )}
        {codeRunnerOpen && (
          <div
            onPointerDown={handleCodeRunnerPointerDown}
            style={{
              position: 'absolute',
              left: codeRunnerPos.x,
              top: codeRunnerPos.y,
              zIndex: 16,
              width: 420,
              borderRadius: 12,
              border: '1px solid rgba(148,163,184,0.4)',
              background: 'rgba(2,6,23,0.92)',
              boxShadow: '0 18px 48px rgba(2, 6, 23, 0.45)',
              color: '#e2e8f0',
              overflow: 'hidden',
            }}
          >
            <div
              data-cr-drag-handle
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                padding: '9px 10px',
                background: 'rgba(15,23,42,0.88)',
                borderBottom: '1px solid rgba(148,163,184,0.3)',
                cursor: 'grab',
                userSelect: 'none',
              }}
            >
              <strong style={{ fontSize: 13, letterSpacing: 0.2 }}>Code Runner</strong>
              <button
                type="button"
                onClick={() => setCodeRunnerOpen(false)}
                style={{
                  border: 'none',
                  borderRadius: 6,
                  padding: '2px 8px',
                  background: 'rgba(148,163,184,0.2)',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Close
              </button>
            </div>
            <div style={{ padding: 10, display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 12, opacity: 0.86 }}>
                Use `Mind()`, `Mental()` or class names like `RecklessnessMental()`, then call `mind.add(mental)`.
              </div>
              {showTimelineScriptPresetDropdown && (
                <label style={{ display: 'grid', gap: 4, fontSize: 12, opacity: 0.9 }}>
                  <span>
                    {timelineIndex === 3
                      ? 'T3 — pick a variant (fills the editor; same idea as the timeline)'
                      : 'T5 — pick a rooted factor (fills the editor; same groups as Open timeline)'}
                  </span>
                  <select
                    value={
                      codeRunnerTimelinePreset === '__custom__' ||
                      codeRunnerTimelinePreset === '__current__' ||
                      timelineScriptPresetsForStep.some((p) => p.id === codeRunnerTimelinePreset)
                        ? codeRunnerTimelinePreset
                        : '__current__'
                    }
                    onChange={(e) => handleCodeRunnerTimelinePreset(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 6,
                      border: '1px solid rgba(148,163,184,0.4)',
                      background: 'rgba(15,23,42,0.85)',
                      color: '#e2e8f0',
                      fontSize: 11,
                    }}
                  >
                    <option value="__current__">Current scene (right panel)</option>
                    {codeRunnerTimelinePreset === '__custom__' ? (
                      <option value="__custom__">Custom (edited in editor)</option>
                    ) : null}
                    {timelineIndex === 3
                      ? timelineScriptPresetsForStep.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))
                      : timelineIndex === 5
                        ? (
                            <>
                              <option value="t5-no-root">No rooted factor (fixed RNG pool)</option>
                              {T5_CATEGORIES.map((cat) => (
                                <optgroup key={cat.label} label={cat.label}>
                                  {cat.optionIds.map((oid) => {
                                    const pick = TIMELINE_SCRIPT_CATALOG.find((p) => p.id === `t5-${oid}`)
                                    if (!pick) return null
                                    const optLabel =
                                      T5_MENTAL_OPTIONS.find((o) => o.id === oid)?.label ?? pick.label
                                    return (
                                      <option key={pick.id} value={pick.id}>
                                        {optLabel}
                                      </option>
                                    )
                                  })}
                                </optgroup>
                              ))}
                            </>
                          )
                        : null}
                  </select>
                </label>
              )}
              <button
                type="button"
                onClick={handleDownloadAllTimelineScripts}
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid rgba(148,163,184,0.45)',
                  background: 'rgba(30,41,59,0.9)',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Download all timeline scripts ({TIMELINE_SCRIPT_CATALOG.length})
              </button>
              <textarea
                value={codeRunnerCode}
                onChange={(e) => {
                  setCodeRunnerCode(e.target.value)
                  setCodeRunnerDirty(true)
                  setCodeRunnerTimelinePreset('__custom__')
                  if (codeRunnerErrorLine !== null) setCodeRunnerErrorLine(null)
                }}
                spellCheck={false}
                style={{
                  width: '100%',
                  minHeight: 220,
                  resize: 'vertical',
                  background: 'rgba(15,23,42,0.72)',
                  color: '#e2e8f0',
                  border:
                    codeRunnerErrorLine !== null
                      ? '1px solid rgba(239,68,68,0.95)'
                      : '1px solid rgba(148,163,184,0.35)',
                  borderRadius: 8,
                  padding: '10px 11px',
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  fontSize: 12,
                  lineHeight: 1.45,
                  boxShadow:
                    codeRunnerErrorLine !== null
                      ? 'inset 0 -2px 0 rgba(239,68,68,0.85)'
                      : 'none',
                }}
              />
              {codeRunnerErrorLine !== null && (
                <div
                  style={{
                    fontSize: 12,
                    color: '#fca5a5',
                    borderLeft: '3px solid #ef4444',
                    paddingLeft: 8,
                  }}
                >
                  Error on line {codeRunnerErrorLine}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleRunCodeRunner}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#3b82f6',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Run Script
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCodeRunnerCode(generateCodeFromCurrentScene())
                    setCodeRunnerDirty(false)
                    setCodeRunnerTimelinePreset('__current__')
                    setCodeRunnerErrorLine(null)
                    setCodeRunnerStatus('Reset to current default mind script.')
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid rgba(148,163,184,0.45)',
                    background: 'transparent',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                  }}
                >
                  Reset Template
                </button>
                <button
                  type="button"
                  onClick={handleClearCodeRunnerMentals}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#b91c1c',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Clear Scripted
                </button>
                {codeRunnerStatus && (
                  <span
                    style={{
                      fontSize: 12,
                      opacity: 0.9,
                      color: codeRunnerErrorLine !== null ? '#fca5a5' : '#cbd5e1',
                    }}
                  >
                    {codeRunnerStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 12,
            pointerEvents: 'auto',
          }}
        >
          {!isXrActive && (
            <TimelineCanvas
              stops={dynamicStops}
              selectedIndex={timelineIndex ?? 0}
              onSelect={setTimelineIndex}
              colors={TIMELINE_COLORS}
              t3HappySelected={t3HappySelected}
              onT3HappyChange={setT3HappySelected}
              t5SelectedId={t5SelectedId}
              onT5Change={setT5SelectedId}
              onSenseSelect={handleSenseSelect}
              hasContactMental={hasContactMental}
              personType={personType}
              onPersonTypeChange={setPersonType}
              vithiCurrentEvent={vithiCurrentEvent}
              timelineMode={timelineMode}
              onTimelineModeChange={setTimelineMode}
              slideshowPaused={slideshowPaused}
              onSlideshowPausedChange={setSlideshowPaused}
              vithiStageData={vithiStageData}
            />
          )}
        </div>
        {selected && !isXrActive && !inspectOpen && menuRevealReady && (
          <InspectOptionMenu
            selection={selected}
            panelPosition={panelPosition}
            onClose={handleClose}
            onViewDetail={handleViewDetail}
            onVoice={handleSpeakInspectSelection}
            voiceLoading={isInspectVoicePlaying}
            onDragPositionChange={setPanelPosition}
          />
        )}
        {selected && !isXrActive && inspectOpen && (
          <InspectPanel
            selection={selected}
            panelPosition={panelPosition}
            onClose={handleClose}
            onShowProfile={handleShowProfile}
            onVoice={handleSpeakInspectSelection}
            voiceLoading={isInspectVoicePlaying}
            onDragPositionChange={setPanelPosition}
          />
        )}
        {profile && !isXrActive && (
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
          mentals={allMentals}
          selected={selected}
          profile={profile}
          profileAttrs={profileAttrs}
          selectedMentalName={selected?.name ?? null}
          inspectOpen={inspectOpen}
          onSelectMental={handleSelect}
          onViewDetail={handleViewDetail}
          onBackFromDetail={handleBackFromDetail}
          onShowProfile={handleShowProfile}
          onCloseProfile={handleCloseProfile}
          onCloseSelection={handleClose}
          onVoiceSelection={handleSpeakInspectSelection}
          onUpdatePanelPosition={inspectOpen ? undefined : setFocusScreenPosition}
          sendMode={sendMode}
          emojiMode={emojiMode}
          onSendSelection={setSendInfo}
          soundReceiveRequestId={soundReceiveRequestId}
          sceneReceiveRequestId={sceneReceiveRequestId}
          onSoundReceiveHighlightChange={setSoundReceiveHighlight}
          onSceneReceiveHighlightChange={setSoundReceiveHighlight}
          onSoundReceiveComplete={() => {
            setSoundReceiveActive(false)
            setSoundReceiveHighlight([])
            setSendInfo({ sender: 'Sound', receiver: 'Contact', status: 'Delivered' })
          }}
          onSceneReceiveComplete={() => {
            setSceneReceiveActive(false)
            setSoundReceiveHighlight([])
            setSendInfo({ sender: 'Scene', receiver: 'Contact', status: 'Delivered' })
          }}
          showHumanModel={showHumanModel}
          humanShape={humanShape}
          xrMode={activeXrMode}
          defaultMindPosition={DEFAULT_MIND_POSITION}
          defaultMindScale={DEFAULT_MIND_SCALE}
          searchHighlight={searchHighlight}
          explainHighlight={soundReceiveHighlight.length > 0 ? soundReceiveHighlight : explainHighlight}
          stops={dynamicStops}
          timelineIndex={timelineIndex}
          onTimelineSelect={setTimelineIndex}
          t3HappySelected={t3HappySelected}
          onT3HappyChange={setT3HappySelected}
          t5SelectedId={t5SelectedId}
          onT5Change={setT5SelectedId}
          onSenseSelect={handleSenseSelect}
          hasContactMental={hasContactMental}
          personType={personType}
          onPersonTypeChange={setPersonType}
          timelineMode={timelineMode}
          onTimelineModeChange={setTimelineMode}
          slideshowPaused={slideshowPaused}
          onSlideshowPausedChange={setSlideshowPaused}
          vithiCurrentEvent={vithiCurrentEvent}
          vithiStageData={vithiStageData}
          xrTimelineOpen={xrTimelineOpen}
          xrTimelineDetailOpen={xrTimelineDetailOpen}
          onToggleXrTimeline={() =>
            setXrTimelineOpen((prev) => {
              const next = !prev
              if (!next) setXrTimelineDetailOpen(false)
              return next
            })
          }
          onOpenXrTimelineDetail={() => setXrTimelineDetailOpen(true)}
          onCloseXrTimelineDetail={() => setXrTimelineDetailOpen(false)}
          onRendererReady={(gl) => {
            setRenderer(gl)
          }}
        />
      </div>
    </main>
  )
}