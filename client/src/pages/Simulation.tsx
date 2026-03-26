import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
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
import { EffectComposer, Outline } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { XRClearMode, XRControllers, XRMovement, XRStatusBridge } from './simulation/XRSceneHelpers'
import { useXRSession } from './simulation/useXRSession'
import violinModel from '../assets/violin.glb?url'
import perceptionBowlModel from '../assets/bowl.glb?url'
import paperPlaneModel from '../assets/paper_plane.glb?url'
import angerEmojiModel from '../assets/emoji/anger_emoji.glb?url'
  
type Vec3 = [number, number, number]

const DEFAULT_MIND_POSITION: Vec3 = [0, -0.4, 0]
const DEFAULT_MIND_SCALE = 1.6

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
  { name: 'Perception', color: '#60a5fa', scale: 0.18, position: [-0.14, 0.08, 0.18], detail: 'Perception mental with bowl model', modelPath: perceptionBowlModel, modelTargetWorldSize: 0.022, modelOffset: { x: 0, y: -0.28, z: 0.42 }, variant: 'perception' },
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
  if (m.variant === 'perception') {
    return new PerceptionMental({
      name: m.name,
      detail: m.detail ?? '',
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
      detail: m.detail ?? '',
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
      detail: m.detail ?? '',
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
      detail: m.detail ?? '',
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
      detail: m.detail ?? '',
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
      detail: m.detail ?? '',
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
      detail: m.detail ?? '',
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
    // Temp to check visual, i will remove this later
    pushUnique('recklessness')
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

function HumanBody({
  mind,
  controlsRef,
  url = `${import.meta.env.BASE_URL}assets/humanMind/human.gltf`,
  targetHeight = 1.7,
  groundY = 0,
  bodyOpacity = 0.12,
  mindWorldScale = 0.1,
  mindFollowsHumanOffset = true,
  mindYOffsetWorld = 0.02,
  mindZOffsetWorld = -0.03,
  humanZOffsetWorld = -1.2,
}: {
  mind: Mind
  controlsRef?: React.RefObject<OrbitControlsImpl | null>
  url?: string
  targetHeight?: number
  groundY?: number
  bodyOpacity?: number
  mindWorldScale?: number
  mindFollowsHumanOffset?: boolean
  mindYOffsetWorld?: number
  mindZOffsetWorld?: number
  humanZOffsetWorld?: number
}) {
  const gltf = useGLTF(url) as unknown as { scene: THREE.Group }

  // Clone so we can safely tweak materials without affecting Drei's GLTF cache.
  const humanScene = useMemo(() => gltf.scene.clone(true), [gltf.scene])

  const { scaleFactor, humanPosition, chestWorld } = useMemo(() => {
    const bbox = new THREE.Box3().setFromObject(humanScene)
    const size = bbox.getSize(new THREE.Vector3())
    const center = bbox.getCenter(new THREE.Vector3())

    const safeHeight = Math.max(0.00001, size.y)
    const s = targetHeight / safeHeight

    // Center the model in X/Z and put its lowest point on the ground plane.
    const posX = -center.x * s
    // Base Z used for the "true" chest anchor (desktop keeps the mind fixed).
    const posZBase = -center.z * s
    // Visual-only Z offset: moves the human mesh without dragging the mind along.
    // Positive Z moves the model toward the camera (forward).
    const posZ = posZBase + humanZOffsetWorld
    const posY = groundY - bbox.min.y * s

    // Chest anchor: higher in the torso so the mind sits more naturally in the chest.
    const chestLocal = new THREE.Vector3(center.x, bbox.min.y + size.y * 0.68, center.z + size.z * 0.06)
    const chestAnchorZ = mindFollowsHumanOffset ? posZ : posZBase
    const chestW = new THREE.Vector3(posX, posY, chestAnchorZ).add(chestLocal.multiplyScalar(s))

    return {
      scaleFactor: s,
      humanPosition: new THREE.Vector3(posX, posY, posZ),
      chestWorld: chestW,
    }
  }, [groundY, humanScene, humanZOffsetWorld, mindFollowsHumanOffset, targetHeight])

  useLayoutEffect(() => {
    // Fit the mind comfortably inside the torso, then place it in the chest.
    mind.setScale(mindWorldScale)
    mind.setPosition(chestWorld.x, chestWorld.y + mindYOffsetWorld, chestWorld.z + mindZOffsetWorld)

    // Keep orbit pivot aligned with the mind/chest without relying on a React re-render.
    const ctl = controlsRef?.current
    if (ctl) {
      ctl.target.set(chestWorld.x, chestWorld.y + mindYOffsetWorld, chestWorld.z + mindZOffsetWorld)
      ctl.update()
    }
  }, [chestWorld.x, chestWorld.y, chestWorld.z, mind, mindWorldScale, mindYOffsetWorld, mindZOffsetWorld])

  useMemo(() => {
    // Make the body easy to see through so the mind is visible "inside".
    humanScene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      mesh.castShadow = true
      mesh.receiveShadow = true
      const mat = mesh.material
      const apply = (m: THREE.Material) => {
        const pm = m as THREE.MeshStandardMaterial
        pm.transparent = true
        // Explicit opacity so the body is more visible (user-requested).
        pm.opacity = THREE.MathUtils.clamp(bodyOpacity, 0, 1)
        pm.depthWrite = false
        pm.needsUpdate = true
      }
      if (Array.isArray(mat)) mat.forEach(apply)
      else if (mat) apply(mat)
    })
    return humanScene
  }, [bodyOpacity, humanScene])

  return (
    <group position={[humanPosition.x, humanPosition.y, humanPosition.z]} scale={scaleFactor}>
      <primitive object={humanScene} />
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
  focusTargetRef,
  planeModelPath,
  sendMode,
  onSendSelection,
  onHoverSelection,
  onSendMeshSelection,
}: {
  mind: Mind
  mentals: Mental[]
  selectedMentalName: string | null
  onSelectMental: (info: InspectSelection) => void
  focusTargetRef: React.MutableRefObject<THREE.Vector3 | null>
  planeModelPath: string
  sendMode: boolean
  onSendSelection?: (info: { sender?: string | null; receiver?: string | null; status?: string }) => void
  onHoverSelection?: (objects: THREE.Object3D[]) => void
  onSendMeshSelection?: (meshes: THREE.Object3D[]) => void
}) {
  const { gl, camera } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])
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
  }, [focusTargetRef, gl, mind, onSelectMental, onSendMeshSelection, onSendSelection, planeModelPath, sendMode])

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
        mental.loadModel(gl, { basisPath }).catch((err) => {
          console.error('Failed to load mental model', err)
        })
      }
    })

    appliedMentalsRef.current = next
    hasHydratedMentalsRef.current = true
  }, [gl, mentals, mind, spawnDissolveBurst])

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

    const handlePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(pointer, camera)

      const list = mind.getMentals()
      const targets = collectMentalTargets(list)

      const hits = raycaster.intersectObjects(targets, true)
      if (!hits.length) return

      const found = findMentalForHitObject(list, hits[0].object)

      if (found) {
        const screenPos = {
          x: event.clientX + window.scrollX,
          y: event.clientY + window.scrollY,
        }
        handleMentalPick(found, screenPos)
      }
    }

    canvas.addEventListener('pointerdown', handlePointer)
    return () => {
      canvas.removeEventListener('pointerdown', handlePointer)
    }
  }, [camera, collectMentalTargets, findMentalForHitObject, gl, handleMentalPick, mind, pointer, raycaster])

  useEffect(() => {
    const xrRaycaster = new THREE.Raycaster()
    const rayOrigin = new THREE.Vector3()
    const rayDirection = new THREE.Vector3()
    const controllers = [gl.xr.getController(0), gl.xr.getController(1)]

    const handleXrSelect = (event: unknown) => {
      if (!gl.xr.isPresenting) return

      const controller = (event as { target?: unknown }).target as THREE.Object3D | undefined
      if (!controller) return
      const list = mind.getMentals()
      const targets = collectMentalTargets(list)
      if (!targets.length) return

      rayOrigin.setFromMatrixPosition(controller.matrixWorld)
      rayDirection.set(0, 0, -1).transformDirection(controller.matrixWorld)
      xrRaycaster.set(rayOrigin, rayDirection)

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
  }, [collectMentalTargets, findMentalForHitObject, gl, handleMentalPick, mind])

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
}: {
  stops: Array<{ label: string; description: string }>
  selectedIndex: number
  onSelect: (i: number) => void
  colors: string[]
  t3HappySelected?: boolean
  onT3HappyChange?: (selected: boolean) => void
  t5SelectedId?: string | null
  onT5Change?: (id: string | null) => void
}) {
  const [showDetail, setShowDetail] = useState(false)
  const [detailPanelOpen, setDetailPanelOpen] = useState(true)
  const [selectedSense, setSelectedSense] = useState<string>('sound')
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

          {selectedIndex === 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>
                Choose sense data
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {T0_SENSE_OPTIONS.map((opt) => {
                  const isSelected = selectedSense === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedSense(opt.id)}
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
          {showDetail && (
            <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.5, color: '#9ca3af' }}>
              {stops[selectedIndex].description}
            </p>
          )}
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

function InspectOptionMenu({
  selection,
  panelPosition,
  onClose,
  onViewDetail,
}: {
  selection: InspectSelection
  panelPosition: { x: number; y: number } | null
  onClose: () => void
  onViewDetail: (selection: InspectSelection) => void
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

  const renderOption = (label: string, description: string, onClick: () => void) => (
    <button
      key={label}
      type="button"
      style={optionStyle}
      onClick={onClick}
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
        {renderOption('View Detail', 'Inspect this sphere closely', () => onViewDetail(selection))}
        {renderOption('Voice', 'Hear a narrated explanation', () => {})}
        {renderOption('How it works?', 'Learn the mechanics in-game', () => {})}
      </div>
    </div>
  )
}

function ThreeScene({
  mind,
  mentals,
  selectedMentalName,
  onSelectMental,
  onUpdatePanelPosition,
  sendMode,
  onSendSelection,
  showHumanModel,
  xrMode,
  defaultMindPosition,
  defaultMindScale,
  onRendererReady,
  searchHighlight,
  explainHighlight,
}: {
  mind: Mind
  mentals: Mental[]
  selectedMentalName: string | null
  onSelectMental: (info: InspectSelection) => void
  onUpdatePanelPosition?: (pos: { x: number; y: number } | null) => void
  sendMode: boolean
  onSendSelection?: (info: { sender?: string | null; receiver?: string | null; status?: string }) => void
  showHumanModel: boolean
  xrMode: 'vr' | 'ar' | null
  defaultMindPosition: Vec3
  defaultMindScale: number
  onRendererReady?: (gl: THREE.WebGLRenderer) => void
  searchHighlight?: THREE.Object3D[]
  explainHighlight?: THREE.Object3D[]
}) {
  const focusTargetRef = useRef<THREE.Vector3 | null>(null)
  const [hoverSelection, setHoverSelection] = useState<THREE.Object3D[]>([])
  const [sendMeshSelection, setSendMeshSelection] = useState<THREE.Object3D[]>([])
  const controlsRef = useRef<OrbitControlsImpl | null>(null)
  const isXrActive = xrMode !== null
  const isArMode = xrMode === 'ar'
  // Keep mentals interactable in AR so controller trigger/tap can pick them.
  const showMentalsLayer = true
  const showHumanInScene = showHumanModel && (!isArMode || !sendMode)

  const selectedOutlineSelection = useMemo(() => {
    if (!selectedMentalName) return [] as THREE.Object3D[]
    const selectedMental = mentals.find((m) => m.getName() === selectedMentalName)
    const mesh = selectedMental?.getMesh()
    return mesh ? [mesh] : []
  }, [mentals, selectedMentalName])

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
    mind.setPosition(defaultMindPosition)

    const ctl = controlsRef.current
    if (ctl) {
      ctl.target.set(defaultMindPosition[0], defaultMindPosition[1], defaultMindPosition[2])
      ctl.update()
    }
  }, [defaultMindPosition, defaultMindScale, mind, showHumanModel])

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 75 }}
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
      <XRMovement enabled={isXrActive} />
      {/* In AR, avoid overriding the camera passthrough with an HDR background */}
      {!isArMode && <Environment preset="dawn" background blur={1} backgroundIntensity={0.6} environmentIntensity={1.05} />}
      <OrbitControls
        ref={controlsRef}
        enabled={!isXrActive}
        enableDamping={!selectedMentalName}
        dampingFactor={selectedMentalName ? 0 : 0.05}
        enableZoom
        enablePan={!selectedMentalName && !isXrActive}
        enableRotate={!selectedMentalName && !isXrActive}
        minDistance={0.35}
        maxDistance={24}
        target={[mind.position.x, mind.position.y, mind.position.z]}
      />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.6} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-far={50} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
      <directionalLight position={[-5, 3, -5]} intensity={0.85} />
      <pointLight position={[0, 6, 0]} intensity={1.35} distance={15} decay={2} />
      <pointLight position={[0, 0, 5]} intensity={1.0} distance={15} decay={2} />
      {!isArMode && <GroundPlane />}
      {showHumanInScene && (
        <React.Suspense fallback={null}>
          <HumanBody
            mind={mind}
            controlsRef={controlsRef}
          />
        </React.Suspense>
      )}
      <MindSphere mind={mind} />
      {showMentalsLayer && (
        <MentalsLayer
          mind={mind}
          mentals={mentals}
          selectedMentalName={selectedMentalName}
          onSelectMental={onSelectMental}
          focusTargetRef={focusTargetRef}
          planeModelPath={paperPlaneModel}
          sendMode={sendMode}
          onSendSelection={onSendSelection}
          onHoverSelection={setHoverSelection}
          onSendMeshSelection={setSendMeshSelection}
        />
      )}
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
  const [showHumanModel, setShowHumanModel] = useState(false)
  const [isMindExplaining, setIsMindExplaining] = useState(false)
  const [explainOverlay, setExplainOverlay] = useState<{ name: string; detail: string; progressLabel: string } | null>(null)
  const [explainHighlight, setExplainHighlight] = useState<THREE.Object3D[]>([])
  const [focusScreenPosition, setFocusScreenPosition] = useState<{ x: number; y: number } | null>(null)
  const [menuRevealReady, setMenuRevealReady] = useState(false)
  const [menuLineProgress, setMenuLineProgress] = useState(1)
  const [timelineIndex, setTimelineIndex] = useState(0)
  const [t3HappySelected, setT3HappySelected] = useState(false)
  const [t5SelectedId, setT5SelectedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const overlayRootRef = useRef<HTMLDivElement | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
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
    renderer: rendererRef.current,
    overlayRoot: overlayRootRef.current,
  })

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

    const updateNavHeight = () => {
      const nav = document.querySelector('.nav') as HTMLElement | null
      const shouldReserveNavSpace = activeXrMode === null
      const navHeight = nav && shouldReserveNavSpace ? nav.getBoundingClientRect().height : 0
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
    const variants = getMentalVariantsForTimelineStop(timelineIndex, t3HappySelected, t5SelectedId)
    setMentals(variants.map((variant) => getOrCreateMental(variant)))
  }, [getOrCreateMental, t3HappySelected, t5SelectedId, timelineIndex])

  useEffect(() => {
    return () => {
      mind.stopMentalExplanationAnimation()
      const activeMentals = new Set(mind.getMentals())
      mind.dispose()
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
    return mentals
      .filter((m) => m.getName().toLowerCase().includes(term))
      .flatMap((m) => {
        const mesh = m.getMesh()
        return mesh ? [mesh] : []
      })
  }, [searchTerm, mentals])

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
    const mental = mentals.find((m) => m.getName() === info.name && m.getType?.() === 'perception_mental')
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

  const handleAddAttribute = () => {
    const key = attrKey.trim()
    if (!key) return
    const mental = mentals.find((m) => m.getName() === profile?.name && m.getType?.() === 'perception_mental')
    if (mental && mental instanceof PerceptionMental) {
      mental.addAttribute(key, attrValue)
      setProfileAttrs(mental.getAttributes())
      setProfileMarkers(mental.getAttributeMarkers())
      setAttrKey('')
      setAttrValue('')
    }
  }

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
        holdDurationMs: 440,
        returnDurationMs: 520,
        outDistanceWorld: 0.62,
        // Present spheres in front of the mind (camera-facing view).
        presentationDirectionLocal: { x: 0, y: 0.14, z: 1 },
        presentationSpread: 0.024,
        onStart: () => {
          const mindMesh = mind.getMesh()
          setExplainHighlight(mindMesh ? [mindMesh] : [])
          setExplainOverlay({
            name: mind.getName() || 'Mind',
            detail: mind.getDetail() || 'Introducing the mind and its mentals.',
            progressLabel: 'Mind overview',
          })
        },
        onMentalFocus: ({ mental, index, total }) => {
          const mesh = mental.getMesh()
          setExplainHighlight(mesh ? [mesh] : [])
          setExplainOverlay({
            name: mental.getName(),
            detail: mental.getDetail() || 'No detail provided.',
            progressLabel: `Mental ${index + 1} / ${total}`,
          })
        },
        onComplete: () => {
          setExplainHighlight([])
          setExplainOverlay(null)
        },
      })
    } catch (error) {
      console.error('Failed to run mind explanation animation', error)
    } finally {
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
  const showMenuConnector = Boolean(selected && menuConnectorStart && menuConnectorEnd)
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
              strokeDasharray="7 5"
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
          <TimelineCanvas
            stops={TIMELINE_STOPS}
            selectedIndex={timelineIndex ?? 0}
            onSelect={setTimelineIndex}
            colors={TIMELINE_COLORS}
            t3HappySelected={t3HappySelected}
            onT3HappyChange={setT3HappySelected}
            t5SelectedId={t5SelectedId}
            onT5Change={setT5SelectedId}
          />
        </div>
        {selected && !inspectOpen && menuRevealReady && (
          <InspectOptionMenu
            selection={selected}
            panelPosition={panelPosition}
            onClose={handleClose}
            onViewDetail={handleViewDetail}
          />
        )}
        {selected && inspectOpen && (
          <InspectPanel
            selection={selected}
            panelPosition={panelPosition}
            onClose={handleClose}
            onShowProfile={handleShowProfile}
          />
        )}
        {profile && (
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
          mentals={mentals}
          selectedMentalName={selected?.name ?? null}
          onSelectMental={handleSelect}
          onUpdatePanelPosition={inspectOpen ? undefined : setFocusScreenPosition}
          sendMode={sendMode}
          onSendSelection={setSendInfo}
          showHumanModel={showHumanModel}
          xrMode={activeXrMode}
          defaultMindPosition={DEFAULT_MIND_POSITION}
          defaultMindScale={DEFAULT_MIND_SCALE}
          searchHighlight={searchHighlight}
          explainHighlight={explainHighlight}
          onRendererReady={(gl) => {
            rendererRef.current = gl
          }}
        />
      </div>
    </main>
  )
}