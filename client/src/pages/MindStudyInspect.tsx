import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useNavigate, useParams } from 'react-router-dom';
import Mind from '../mindwebsite/classes/Mind';
import Mental from '../mindwebsite/classes/Mental';
import type { MentalBaseOptions } from '../mindwebsite/classes/AbstractMental';
import NeutralMental from '../mindwebsite/classes/neutral/NeutralMental';
import ContactMental from '../mindwebsite/classes/neutral/ContactMental';
import AttentionMental from '../mindwebsite/classes/neutral/AttentionMental';
import FeelingMental from '../mindwebsite/classes/neutral/FeelingMental';
import IntentionMental from '../mindwebsite/classes/neutral/IntentionMental';
import ConsciousnessMental from '../mindwebsite/classes/neutral/ConsciousnessMental';
import AwarenessMental from '../mindwebsite/classes/neutral/AwarenessMental';
import PerceptionMental from '../mindwebsite/classes/neutral/PerceptionMental';
import LifeFacultyMental from '../mindwebsite/classes/neutral/LifeFacultyMental';
import ConcentrationMental from '../mindwebsite/classes/neutral/ConcentrationMental';
import DeterminationMental from '../mindwebsite/classes/neutral/DeterminationMental';
import InitialApplicationMental from '../mindwebsite/classes/neutral/InitialApplicationMental';
import SustainedApplicationMental from '../mindwebsite/classes/neutral/SustainedApplicationMental';
import EnergyMental from '../mindwebsite/classes/neutral/EnergyMental';
import RaptureMental from '../mindwebsite/classes/neutral/RaptureMental';
import DesireMental from '../mindwebsite/classes/neutral/DesireMental';
import BadMental from '../mindwebsite/classes/bad/BadMental';
import GreedMental from '../mindwebsite/classes/bad/GreedMental';
import WrongViewMental from '../mindwebsite/classes/bad/WrongViewMental';
import ConceitMental from '../mindwebsite/classes/bad/ConceitMental';
import HatredMental from '../mindwebsite/classes/bad/HatredMental';
import SlothMental from '../mindwebsite/classes/bad/SlothMental';
import TorporMental from '../mindwebsite/classes/bad/TorporMental';
import DoubtMental from '../mindwebsite/classes/bad/DoubtMental';
import StinginessMental from '../mindwebsite/classes/bad/StinginessMental';
import ShamelessnessMental from '../mindwebsite/classes/bad/ShamelessnessMental';
import RecklessnessMental from '../mindwebsite/classes/bad/RecklessnessMental';
import RestlessnessMental from '../mindwebsite/classes/bad/RestlessnessMental';
import EnvyMental from '../mindwebsite/classes/bad/EnvyMental';
import DelusionMental from '../mindwebsite/classes/bad/DelusionMental';
import WorryMental from '../mindwebsite/classes/bad/WorryMental';
import GoodMental from '../mindwebsite/classes/good/GoodMental';
import WisdomMental from '../mindwebsite/classes/good/WisdomMental';
import EquanimityMental from '../mindwebsite/classes/good/EquanimityMental';
import CompassionMental from '../mindwebsite/classes/good/CompassionMental';
import ProficiencyMindMental from '../mindwebsite/classes/good/ProficiencyMindMental';
import PliancyMindMental from '../mindwebsite/classes/good/PliancyMindMental';
import MoralDreadMental from '../mindwebsite/classes/good/MoralDreadMental';
import RightLivelihoodMental from '../mindwebsite/classes/good/RightLivelihoodMental';
import LightnessMindMental from '../mindwebsite/classes/good/LightnessMindMental';
import TranquilityMindMental from '../mindwebsite/classes/good/TranquilityMindMental';
import AppreciativeJoyMental from '../mindwebsite/classes/good/AppreciativeJoyMental';
import MindfulnessMental from '../mindwebsite/classes/good/MindfulnessMental';
import MoralShameMental from '../mindwebsite/classes/good/MoralShameMental';
import RightSpeechMental from '../mindwebsite/classes/good/RightSpeechMental';
import RightActionMental from '../mindwebsite/classes/good/RightActionMental';
import PliancyBodyMental from '../mindwebsite/classes/good/PliancyBodyMental';
import LightnessBodyMental from '../mindwebsite/classes/good/LightnessBodyMental';
import TranquilityBodyMental from '../mindwebsite/classes/good/TranquilityBodyMental';
import WieldinessBodyMental from '../mindwebsite/classes/good/WieldinessBodyMental';
import RectitudeMindMental from '../mindwebsite/classes/good/RectitudeMindMental';
import RectitudeBodyMental from '../mindwebsite/classes/good/RectitudeBodyMental';
import ProficiencyBodyMental from '../mindwebsite/classes/good/ProficiencyBodyMental';
import FaithMental from '../mindwebsite/classes/good/FaithMental';
import NonGreedMental from '../mindwebsite/classes/good/NonGreedMental';
import NonHatredMental from '../mindwebsite/classes/good/NonHatredMental';
import WieldinessMindMental from '../mindwebsite/classes/good/WieldinessMindMental';
import paperPlaneModel from '../assets/paper_plane.glb?url';
import perceptionBowlModel from '../assets/bowl.glb?url';
import type { InspectSelection } from '../types/InspectSelection';
import { EffectComposer, Outline } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import InspectPanel from '../components/InspectPanel';
import XRInspectPanel from '../components/XRInspectPanel';
import { loadMindElementRows, type MindElementRow } from '../utils/mindElement';
import { detailTextForVoiceNarration } from '../utils/inspectVoiceText';
import { useXRSession } from './simulation/useXRSession';
import type { StationaryXrPanelLayout } from './simulation/useStationaryDraggableXrPanel';
import { XRClearMode, XRControllers, XRExitByGrip, XRStatusBridge } from './simulation/XRSceneHelpers';
const API_BASE_STATIC = import.meta.env.VITE_API_URL || 'http://localhost:8004';
const DESKTOP_INSPECT_CAMERA_POS: [
    number,
    number,
    number
] = [0, 0, 5];
const MINDSTUDY_INSPECT_AR_SCALE = 1.1;
const MINDSTUDY_INSPECT_AR_MIND_SCALE_BASE = 0.5;
const MINDSTUDY_INSPECT_LABEL_WORLD_SIZE = 0.46;
const MINDSTUDY_INSPECT_LABEL_OFFSET = 0.24;
const MINDSTUDY_INSPECT_AR_LABEL_WORLD_SIZE = 0.23;
const MINDSTUDY_INSPECT_AR_LABEL_OFFSET = 0.18;
const MINDSTUDY_INSPECT_AR_XR_PANEL_GROUP_BASE = 0.5;
const MINDSTUDY_INSPECT_AR_XR_PANEL_CONTENT_SCALE = MINDSTUDY_INSPECT_AR_XR_PANEL_GROUP_BASE * MINDSTUDY_INSPECT_AR_SCALE;
const MINDSTUDY_INSPECT_XR_PANEL_LAYOUT: Partial<StationaryXrPanelLayout> = {
    forward: 0.85,
};
const MINDSTUDY_INSPECT_OPTION_MENU_EST_HEIGHT = 330;
const MINDSTUDY_INSPECT_FLOATING_BTN: React.CSSProperties = {
    width: 54,
    height: 54,
    borderRadius: 12,
    background: 'rgba(17, 24, 39, 0.9)',
    color: '#e5e7eb',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 22,
};
type ApiStaticMentalRow = {
    id: number;
    name: string;
    pali?: string;
    thai?: string;
    description?: string;
    category?: string;
};
type ApiStaticMindRow = {
    id: number;
    name: string;
    name_en?: string;
    pali?: string;
    thai?: string;
    category?: string;
    description?: string;
    mental_ids: number[];
};
type MindStudyInspectParams = {
    mindId?: string;
};
type NeutralSeed = {
    name: string;
    color: string;
    scale: number;
    position: [
        number,
        number,
        number
    ];
    variant: 'neutral' | 'contact' | 'attention' | 'feeling' | 'intention' | 'consciousness' | 'awareness' | 'perception';
    detail?: string;
    modelPath?: string;
    modelTargetWorldSize?: number;
    modelOffset?: {
        x?: number;
        y?: number;
        z?: number;
    };
};
const neutralSeeds: NeutralSeed[] = [
    {
        name: 'Neutral Ground',
        color: '#9ca3af',
        scale: 0.14,
        position: [-0.08, -0.46, -0.12],
        variant: 'neutral',
        detail: 'Baseline neutral mental factor',
    },
    {
        name: 'Contact',
        color: '#a1a1aa',
        scale: 0.14,
        position: [0.0, -0.45, 0.1],
        variant: 'contact',
        detail: 'Meeting of sense base and object',
        modelPath: paperPlaneModel,
        modelTargetWorldSize: 0.08,
        modelOffset: { x: 0, y: -0.04, z: 0 },
    },
    {
        name: 'Attention',
        color: '#a1a1aa',
        scale: 0.14,
        position: [-0.18, -0.48, 0.06],
        variant: 'attention',
        detail: 'Directing the mind toward an object',
    },
    {
        name: 'Feeling',
        color: '#a1a1aa',
        scale: 0.14,
        position: [0.16, -0.44, -0.06],
        variant: 'feeling',
        detail: 'Tone of pleasant, unpleasant, or neutral',
    },
    {
        name: 'Intention',
        color: '#a1a1aa',
        scale: 0.14,
        position: [0.05, -0.52, 0.05],
        variant: 'intention',
        detail: 'The shaping force behind actions',
    },
    {
        name: 'Consciousness',
        color: '#a1a1aa',
        scale: 0.14,
        position: [-0.22, -0.42, -0.02],
        variant: 'consciousness',
        detail: 'Knowing of the object',
    },
    {
        name: 'Awareness',
        color: '#a1a1aa',
        scale: 0.14,
        position: [0.22, -0.5, 0.12],
        variant: 'awareness',
        detail: 'Monitoring quality of mind',
    },
    {
        name: 'Perception',
        color: '#60a5fa',
        scale: 0.18,
        position: [-0.14, 0.08, 0.18],
        variant: 'perception',
        detail: 'เจตสิกจำอารมณ์ทุกอย่างที่ปรากฏสืบต่อเป็นเรื่องราว สัตว์ บุคคล ต่างๆ สัญญาเจตสิก จำความรู้สึกสุขทุกข์ ดีใจ เสียใจ เฉยๆ ในอารมณ์ทุกอย่าง สัญญาเจตสิก เป็นปัจจัยที่สำคัญที่ส่งเสริมความผูกพันยึดมั่นในชีวิต เช่นเดียวกับเวทนาเจตสิกซึ่งเมื่อรู้สึกสุขหรือดีใจ เป็นต้น ก็ย่อมสำคัญยึดมั่นผูกพันต้องการความรู้สึกนั้นๆ เรื่อยๆ ไป',
        modelPath: perceptionBowlModel,
        modelTargetWorldSize: 0.022,
        modelOffset: { x: 0, y: -0.28, z: 0.42 },
    },
];
const buildDefaultNeutralMentals = (): Mental[] => neutralSeeds.map((seed) => {
    const baseOptions = {
        name: seed.name,
        detail: seed.detail ?? '',
        color: seed.color,
        scale: seed.scale,
        position: seed.position,
        labelEnabled: false,
        motionSpeed: 0.0015,
        modelPath: seed.modelPath,
        modelTargetWorldSize: seed.modelTargetWorldSize,
        modelOffset: seed.modelOffset,
        opacity: 0.5,
    };
    switch (seed.variant) {
        case 'contact':
            return new ContactMental(baseOptions);
        case 'attention':
            return new AttentionMental(baseOptions);
        case 'feeling':
            return new FeelingMental(baseOptions);
        case 'intention':
            return new IntentionMental(baseOptions);
        case 'consciousness':
            return new ConsciousnessMental(baseOptions);
        case 'awareness':
            return new AwarenessMental(baseOptions);
        case 'perception':
            return new PerceptionMental(baseOptions);
        case 'neutral':
        default:
            return new NeutralMental(baseOptions);
    }
});
const randomPosition = (): [
    number,
    number,
    number
] => [
    (Math.random() - 0.5) * 0.8,
    (Math.random() - 0.5) * 0.8,
    (Math.random() - 0.5) * 0.8,
];
const pickMentalFactory = (label: string): ((opts: MentalBaseOptions) => Mental) => {
    const key = label.toLowerCase();
    if (key.includes('universal') && key.includes('common'))
        return (opts) => new NeutralMental(opts);
    if (key.includes('universal unwholesome'))
        return (opts) => new BadMental({ color: '#f87171', ...opts });
    if (key.includes('greed') && !key.includes('non-greed'))
        return (opts) => new GreedMental(opts);
    if (key.includes('wrong view'))
        return (opts) => new WrongViewMental(opts);
    if (key.includes('conceit'))
        return (opts) => new ConceitMental(opts);
    if (key.includes('hatred') && !key.includes('non-hatred'))
        return (opts) => new HatredMental(opts);
    if (key.includes('sloth'))
        return (opts) => new SlothMental(opts);
    if (key.includes('torpor'))
        return (opts) => new TorporMental(opts);
    if (key.includes('doubt'))
        return (opts) => new DoubtMental(opts);
    if (key.includes('stinginess'))
        return (opts) => new StinginessMental(opts);
    if (key.includes('shamelessness'))
        return (opts) => new ShamelessnessMental(opts);
    if (key.includes('recklessness'))
        return (opts) => new RecklessnessMental(opts);
    if (key.includes('restlessness'))
        return (opts) => new RestlessnessMental(opts);
    if (key.includes('envy'))
        return (opts) => new EnvyMental(opts);
    if (key.includes('delusion'))
        return (opts) => new DelusionMental(opts);
    if (key.includes('worry'))
        return (opts) => new WorryMental(opts);
    if (key.includes('wisdom') || key.includes('paññā'))
        return (opts) => new WisdomMental(opts);
    if (key.includes('equanimity') || key.includes('tatramajjhattatā'))
        return (opts) => new EquanimityMental(opts);
    if (key.includes('compassion') || key.includes('karuṇā'))
        return (opts) => new CompassionMental(opts);
    if (key.includes('proficiency') && key.includes('mind'))
        return (opts) => new ProficiencyMindMental(opts);
    if (key.includes('proficiency') && (key.includes('body') || key.includes('mental')))
        return (opts) => new ProficiencyBodyMental(opts);
    if (key.includes('proficiency'))
        return (opts) => new ProficiencyMindMental(opts);
    if (key.includes('pliancy') && key.includes('mind'))
        return (opts) => new PliancyMindMental(opts);
    if (key.includes('pliancy') && (key.includes('body') || key.includes('mental')))
        return (opts) => new PliancyBodyMental(opts);
    if (key.includes('pliancy'))
        return (opts) => new PliancyMindMental(opts);
    if (key.includes('moral dread') || key.includes('ottappa'))
        return (opts) => new MoralDreadMental(opts);
    if (key.includes('right livelihood') || key.includes('sammā-ājīva'))
        return (opts) => new RightLivelihoodMental(opts);
    if (key.includes('lightness') && key.includes('mind'))
        return (opts) => new LightnessMindMental(opts);
    if (key.includes('lightness') && (key.includes('body') || key.includes('mental')))
        return (opts) => new LightnessBodyMental(opts);
    if (key.includes('lightness'))
        return (opts) => new LightnessMindMental(opts);
    if (key.includes('tranquility') && key.includes('mind'))
        return (opts) => new TranquilityMindMental(opts);
    if (key.includes('tranquility') && (key.includes('body') || key.includes('mental')))
        return (opts) => new TranquilityBodyMental(opts);
    if (key.includes('tranquility'))
        return (opts) => new TranquilityMindMental(opts);
    if (key.includes('appreciative joy') || key.includes('muditā'))
        return (opts) => new AppreciativeJoyMental(opts);
    if (key.includes('mindfulness') || key.includes('sati'))
        return (opts) => new MindfulnessMental(opts);
    if (key.includes('moral shame') || key.includes('hiri'))
        return (opts) => new MoralShameMental(opts);
    if (key.includes('right speech') || key.includes('sammā-vācā'))
        return (opts) => new RightSpeechMental(opts);
    if (key.includes('right action') || key.includes('sammā-kammanta'))
        return (opts) => new RightActionMental(opts);
    if (key.includes('wieldiness') && key.includes('mind'))
        return (opts) => new WieldinessMindMental(opts);
    if (key.includes('wieldiness') && (key.includes('body') || key.includes('mental')))
        return (opts) => new WieldinessBodyMental(opts);
    if (key.includes('wieldiness'))
        return (opts) => new WieldinessMindMental(opts);
    if (key.includes('rectitude') && key.includes('mind'))
        return (opts) => new RectitudeMindMental(opts);
    if (key.includes('rectitude') && (key.includes('body') || key.includes('mental')))
        return (opts) => new RectitudeBodyMental(opts);
    if (key.includes('rectitude'))
        return (opts) => new RectitudeMindMental(opts);
    if (key.includes('faith') || key.includes('saddhā'))
        return (opts) => new FaithMental(opts);
    if (key.includes('non-greed') || key.includes('alobha'))
        return (opts) => new NonGreedMental(opts);
    if (key.includes('non-hatred') || key.includes('adosa'))
        return (opts) => new NonHatredMental(opts);
    if (key.includes('beautiful') || key.includes('abstinences') || key.includes('illimitables'))
        return (opts) => new GoodMental(opts);
    if (key.includes('energy') || key.includes('viriya'))
        return (opts) => new EnergyMental(opts);
    if (key.includes('joy') && !key.includes('appreciative'))
        return (opts) => new GoodMental({ color: '#38bdf8', ...opts });
    if (key.includes('contact') || key.includes('phassa'))
        return (opts) => new ContactMental(opts);
    if (key.includes('attention') || key.includes('manasikāra') || key.includes('manasikara'))
        return (opts) => new AttentionMental(opts);
    if (key.includes('feeling') || key.includes('vedanā') || key.includes('vedana'))
        return (opts) => new FeelingMental(opts);
    if (key.includes('intention') || key.includes('cetanā') || key.includes('cetana'))
        return (opts) => new IntentionMental(opts);
    if (key.includes('consciousness') || key.includes('viññāṇa') || key.includes('vinnana'))
        return (opts) => new ConsciousnessMental(opts);
    if (key.includes('awareness'))
        return (opts) => new AwarenessMental(opts);
    if (key.includes('perception') || key.includes('saññā') || key.includes('sanna'))
        return (opts) => new PerceptionMental(opts);
    if (key.includes('life faculty') || key.includes('jīvitindriya'))
        return (opts) => new LifeFacultyMental(opts);
    if (key.includes('concentration') || key.includes('ekaggatā'))
        return (opts) => new ConcentrationMental(opts);
    if (key.includes('determination') || key.includes('adhimokkha'))
        return (opts) => new DeterminationMental(opts);
    if (key.includes('initial application') || key.includes('vitakka'))
        return (opts) => new InitialApplicationMental(opts);
    if (key.includes('sustained application') || key.includes('vicāra') || key.includes('vicara'))
        return (opts) => new SustainedApplicationMental(opts);
    if (key.includes('rapture') || key.includes('pīti') || key.includes('piti'))
        return (opts) => new RaptureMental(opts);
    if (key.includes('desire') || key.includes('chanda'))
        return (opts) => new DesireMental(opts);
    if (key.includes('decision'))
        return (opts) => new IntentionMental(opts);
    return (opts) => new NeutralMental(opts);
};
const buildMentalsFromRow = (row: MindElementRow): Mental[] => {
    const mentals: Mental[] = [];
    Object.entries(row.counts).forEach(([label, count]) => {
        if (!count || Number.isNaN(count))
            return;
        const key = label.toLowerCase();
        if (key.includes('universal') && !key.includes('unwholesome')) {
            const amount = Math.max(1, Math.min(20, Math.round(count)));
            const scale = Math.min(0.26, 0.12 + Math.log1p(amount) * 0.05);
            const detail = `${label} — universal set (Attention, Awareness, Consciousness, Contact, ` +
                `Feeling, Intention, Perception) — ${count} factor${count > 1 ? 's' : ''} (MindElement.xlsx)`;
            const universalMentals: Array<{
                name: string;
                factory: (opts: MentalBaseOptions) => Mental;
            }> = [
                { name: 'Attention', factory: (opts) => new AttentionMental(opts) },
                { name: 'Awareness', factory: (opts) => new AwarenessMental(opts) },
                { name: 'Consciousness', factory: (opts) => new ConsciousnessMental(opts) },
                { name: 'Contact', factory: (opts) => new ContactMental(opts) },
                { name: 'Feeling', factory: (opts) => new FeelingMental(opts) },
                { name: 'Intention', factory: (opts) => new IntentionMental(opts) },
                { name: 'Perception', factory: (opts) => new PerceptionMental(opts) },
            ];
            universalMentals.forEach(({ name, factory }) => {
                mentals.push(factory({
                    name,
                    detail,
                    position: randomPosition(),
                    motionSpeed: 0.0012 + Math.random() * 0.0007,
                    scale,
                    labelEnabled: false,
                    opacity: 0.52,
                }));
            });
            return;
        }
        const amount = Math.max(1, Math.min(20, Math.round(count)));
        const factory = pickMentalFactory(label);
        const scale = Math.min(0.26, 0.12 + Math.log1p(amount) * 0.05);
        const detail = `${label} — ${count} factor${count > 1 ? 's' : ''} (MindElement.xlsx)`;
        for (let i = 0; i < amount; i += 1) {
            const name = amount > 1 ? `${label} #${i + 1}` : label;
            mentals.push(factory({
                name,
                detail,
                position: randomPosition(),
                motionSpeed: 0.0012 + Math.random() * 0.0007,
                scale,
                labelEnabled: false,
                opacity: 0.52,
            }));
        }
    });
    if (!mentals.length) {
        return buildDefaultNeutralMentals();
    }
    return mentals;
};
const CETASIKA_ID_TO_LABEL: Record<string, string> = {
    contact: 'Contact', feeling: 'Feeling', perception: 'Perception', intention: 'Intention',
    concentration: 'Concentration', 'life-faculty': 'Life faculty', attention: 'Attention',
    'initial-application': 'Initial application', 'sustained-application': 'Sustained application',
    decision: 'Determination', energy: 'Energy', rapture: 'Rapture', desire: 'Desire',
    delusion: 'Delusion', shamelessness: 'Shamelessness', recklessness: 'Recklessness', restlessness: 'Restlessness',
    greed: 'Greed', 'wrong-view': 'Wrong view', conceit: 'Conceit', hatred: 'Hatred', envy: 'Envy',
    stinginess: 'Stinginess', worry: 'Worry', sloth: 'Sloth', torpor: 'Torpor', doubt: 'Doubt',
    faith: 'Faith', mindfulness: 'Mindfulness', 'moral-shame': 'Moral shame', 'moral-dread': 'Moral dread',
    'non-greed': 'Non-greed', 'non-hatred': 'Non-hatred', equanimity: 'Equanimity',
    'tranquility-body': 'Tranquility body', 'tranquility-mind': 'Tranquility mind',
    'lightness-body': 'Lightness body', 'lightness-mind': 'Lightness mind',
    'wieldiness-body': 'Wieldiness body', 'wieldiness-mind': 'Wieldiness mind',
    'proficiency-body': 'Proficiency body', 'proficiency-mind': 'Proficiency mind',
    'pliancy-body': 'Pliancy body', 'pliancy-mind': 'Pliancy mind',
    'rectitude-body': 'Rectitude body', 'rectitude-mind': 'Rectitude mind',
    'right-speech': 'Right speech', 'right-action': 'Right action', 'right-livelihood': 'Right livelihood',
    compassion: 'Compassion', 'appreciative-joy': 'Appreciative joy', wisdom: 'Wisdom',
};
function buildSingleMentalFromCetasikaId(id: string): Mental[] | null {
    const label = CETASIKA_ID_TO_LABEL[id.toLowerCase()];
    if (!label)
        return null;
    const factory = pickMentalFactory(label);
    const name = label;
    const mental = factory({
        name,
        detail: `${label} (cetasika)`,
        position: randomPosition(),
        motionSpeed: 0.001,
        scale: 0.18,
        labelEnabled: false,
        opacity: 0.52,
    });
    return [mental];
}
function simulationScaleForBackendMental(label: string, category?: string): number {
    const key = label.toLowerCase();
    if (key.includes('perception'))
        return 0.18;
    if (category === 'good' || category === 'bad')
        return 0.12;
    if (key.includes('energy') ||
        key.includes('desire') ||
        key.includes('rapture') ||
        key.includes('pīti') ||
        key.includes('piti')) {
        return 0.12;
    }
    return 0.14;
}
const SIM_COLOR_GOOD = '#22c55e';
const SIM_COLOR_BAD = '#ef4444';
const SIM_COLOR_NEUTRAL_GRAY = '#a1a1aa';
const SIM_COLOR_PERCEPTION = '#60a5fa';
const SIM_COLOR_RAPTURE = '#38bdf8';
function simulationColorForBackendMental(label: string, category?: string): string {
    const key = label.toLowerCase();
    if (category === 'good')
        return SIM_COLOR_GOOD;
    if (category === 'bad')
        return SIM_COLOR_BAD;
    if (key.includes('perception'))
        return SIM_COLOR_PERCEPTION;
    if (key.includes('rapture') ||
        key.includes('pīti') ||
        key.includes('piti') ||
        (key.includes('joy') && key.includes('pīti')) ||
        (key.includes('joy') && key.includes('piti'))) {
        return SIM_COLOR_RAPTURE;
    }
    return SIM_COLOR_NEUTRAL_GRAY;
}
function buildMentalsFromBackendMentalIds(mentalIds: number[], mentalById: Map<number, ApiStaticMentalRow>): Mental[] {
    const ids = mentalIds.filter((id) => Number.isFinite(id));
    if (!ids.length)
        return buildDefaultNeutralMentals();
    const mentals: Mental[] = [];
    ids.forEach((mid) => {
        const row = mentalById.get(mid);
        const label = row?.name?.trim() || `Mental ${mid}`;
        const factory = pickMentalFactory(label);
        const scale = simulationScaleForBackendMental(label, row?.category);
        const color = simulationColorForBackendMental(label, row?.category);
        const meta: string[] = [];
        if (row?.thai?.trim())
            meta.push(`Thai: ${row.thai.trim()}`);
        if (row?.pali?.trim())
            meta.push(`Pāli: ${row.pali.trim()}`);
        const desc = row?.description?.trim();
        const detail = [desc, meta.length ? meta.join(' · ') : null].filter(Boolean).join(' — ') ||
            `${label} (cetasika #${mid} · /api/static/mentals)`;
        mentals.push(factory({
            name: label,
            detail,
            color,
            position: randomPosition(),
            motionSpeed: 0.0015,
            scale,
            labelEnabled: false,
            opacity: 0.5,
        }));
    });
    return mentals;
}
const formatMindName = (id?: string): string => {
    const mindKey = id ?? 'mind';
    const names: Record<string, string> = {
        calm: 'Calm & Balanced',
        focused: 'Focused & Collected',
        curious: 'Curious & Investigative',
        compassionate: 'Warm & Compassionate',
    };
    if (names[mindKey])
        return names[mindKey];
    const plain = mindKey.replace(/[-_]/g, ' ');
    return plain.length ? plain.charAt(0).toUpperCase() + plain.slice(1) : 'Mind';
};
function NeutralMindContents({ mind, mentals }: {
    mind: Mind;
    mentals: Mental[];
}) {
    const { gl } = useThree();
    useEffect(() => {
        mentals.forEach((mental) => mind.addMental(mental));
        return () => {
            mind.clearMentals();
        };
    }, [mind, mentals]);
    useEffect(() => {
        const basisPath = 'https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/';
        mentals.forEach((mental) => {
            mental.loadModel(gl, { basisPath }).catch((err) => {
                console.error('Failed to load neutral mental model', err);
            });
        });
        return () => {
            mentals.forEach((mental) => mental.detachModel());
        };
    }, [gl, mentals]);
    return null;
}
function MindSphere({ mind }: {
    mind: Mind;
}) {
    useEffect(() => {
        return () => {
            mind.dispose();
        };
    }, [mind]);
    useFrame((_state, delta) => {
        mind.updatePhysics(delta);
    });
    const mindMesh = mind.getMesh();
    if (!mindMesh)
        return null;
    return <primitive object={mindMesh}/>;
}
function GroundPlane() {
    return (<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <planeGeometry args={[20, 20]}/>
      <meshStandardMaterial color={0x9ca3af} metalness={0.08} roughness={0.48}/>
    </mesh>);
}
function PanelPositionSync({ focusTargetRef, selectedMentalName, overlayRootRef, onUpdate, }: {
    focusTargetRef: React.MutableRefObject<THREE.Vector3 | null>;
    selectedMentalName: string | null;
    overlayRootRef: React.RefObject<HTMLElement | null>;
    onUpdate: ((pos: {
        x: number;
        y: number;
    } | null) => void) | undefined;
}) {
    const { camera, gl } = useThree();
    useFrame(() => {
        if (!onUpdate)
            return;
        if (!selectedMentalName || !focusTargetRef.current) {
            onUpdate(null);
            return;
        }
        const root = overlayRootRef.current;
        if (!root)
            return;
        const target = focusTargetRef.current.clone();
        const ndc = target.project(camera);
        const canvasRect = gl.domElement.getBoundingClientRect();
        const px = (ndc.x + 1) * 0.5 * canvasRect.width;
        const py = (1 - (ndc.y + 1) * 0.5) * canvasRect.height;
        const clientX = canvasRect.left + px;
        const clientY = canvasRect.top + py;
        const or = root.getBoundingClientRect();
        onUpdate({ x: clientX - or.left, y: clientY - or.top });
    });
    return null;
}
function RendererBridge({ onRendererReady, }: {
    onRendererReady?: (renderer: THREE.WebGLRenderer) => void;
}) {
    const { gl } = useThree();
    useEffect(() => {
        onRendererReady?.(gl);
    }, [gl, onRendererReady]);
    return null;
}
function ExitArCameraReset({ isArActive, controlsRef, mind, }: {
    isArActive?: boolean;
    controlsRef: React.RefObject<OrbitControlsImpl | null>;
    mind: Mind;
}) {
    const { camera } = useThree();
    const wasArActiveRef = useRef(Boolean(isArActive));
    useEffect(() => {
        const wasArActive = wasArActiveRef.current;
        const nowArActive = Boolean(isArActive);
        wasArActiveRef.current = nowArActive;
        if (!wasArActive || nowArActive)
            return;
        camera.position.set(DESKTOP_INSPECT_CAMERA_POS[0], DESKTOP_INSPECT_CAMERA_POS[1], DESKTOP_INSPECT_CAMERA_POS[2]);
        camera.up.set(0, 1, 0);
        const target = new THREE.Vector3(mind.position.x, mind.position.y, mind.position.z);
        camera.lookAt(target);
        camera.updateProjectionMatrix();
        if (controlsRef.current) {
            controlsRef.current.target.set(target.x, target.y, target.z);
            controlsRef.current.update();
        }
    }, [camera, controlsRef, isArActive, mind]);
    return null;
}
function FlyToCameraEffect({ mind, targetName, onDone, }: {
    mind: Mind;
    targetName: string | null;
    onDone?: () => void;
}) {
    const { camera } = useThree();
    const animRef = useRef<{
        mental: Mental;
        start: THREE.Vector3;
        target: THREE.Vector3;
        progress: number;
        phase: 'forward' | 'hold' | 'back';
        timer: number;
        wasFrozen: boolean;
    } | null>(null);
    const resetActive = useCallback(() => {
        const anim = animRef.current;
        if (anim) {
            anim.mental.setPosition(anim.start.x, anim.start.y, anim.start.z);
            anim.mental.setFrozen(anim.wasFrozen);
        }
        animRef.current = null;
    }, []);
    useEffect(() => {
        resetActive();
        if (!targetName)
            return;
        const mental = mind
            .getMentals()
            .find((m) => m.getName().toLowerCase() === targetName.toLowerCase());
        const mindMesh = mind.getMesh();
        if (!mental || !mindMesh) {
            onDone?.();
            return;
        }
        const startPos = mental.getPosition();
        const start = new THREE.Vector3(startPos.x, startPos.y, startPos.z);
        const mindWorld = new THREE.Vector3();
        mindMesh.getWorldPosition(mindWorld);
        const dir = camera.position.clone().sub(mindWorld);
        if (dir.lengthSq() < 1e-6)
            dir.set(0, 0, 1);
        dir.normalize();
        const worldTarget = mindWorld.clone().add(dir.multiplyScalar(1.4));
        const targetLocal = mindMesh.worldToLocal(worldTarget);
        const wasFrozen = mental.isFrozen();
        mental.setFrozen(true);
        animRef.current = {
            mental,
            start,
            target: targetLocal,
            progress: 0,
            phase: 'forward',
            timer: 0,
            wasFrozen,
        };
    }, [camera, mind, onDone, resetActive, targetName]);
    useFrame((_, delta) => {
        const anim = animRef.current;
        if (!anim)
            return;
        const speed = 2;
        const ease = (t: number) => t * t * (3 - 2 * t);
        if (anim.phase === 'forward') {
            anim.progress = Math.min(1, anim.progress + delta * speed);
            const t = ease(anim.progress);
            const pos = anim.start.clone().lerp(anim.target, t);
            anim.mental.setPosition(pos.x, pos.y, pos.z);
            if (anim.progress >= 1) {
                anim.phase = 'hold';
                anim.timer = 0;
            }
            return;
        }
    });
    return null;
}
function NeutralMentalsLayer({ mind, mentals, selectedMentalName, onSelectMental, focusTargetRef, controlsRef, isXrActive, onHoverSelection, }: {
    mind: Mind;
    mentals: Mental[];
    selectedMentalName: string | null;
    onSelectMental: (info: InspectSelection) => void;
    focusTargetRef: React.MutableRefObject<THREE.Vector3 | null>;
    controlsRef?: React.RefObject<OrbitControlsImpl | null>;
    isXrActive?: boolean;
    onHoverSelection?: (objects: THREE.Object3D[]) => void;
}) {
    const { gl, camera } = useThree();
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const pointer = useMemo(() => new THREE.Vector2(), []);
    const hoveredMeshRef = useRef<THREE.Object3D | null>(null);
    const dragStateRef = useRef<{
        mental: Mental;
        startX: number;
        startY: number;
        plane: THREE.Plane;
    } | null>(null);
    const xrDragStateRef = useRef<{
        mental: Mental;
        controller: THREE.Object3D;
        distance: number;
        moved: boolean;
    } | null>(null);
    const dragActiveRef = useRef(false);
    const dragPointRef = useRef(new THREE.Vector3());
    const dragNormalRef = useRef(new THREE.Vector3());
    const xrRayOriginRef = useRef(new THREE.Vector3());
    const xrRayDirectionRef = useRef(new THREE.Vector3());
    const finalizeDraggedMental = useCallback((mental: Mental, didDrag: boolean) => {
        if (!didDrag) {
            mental.setDragging(false);
            mental.setFrozen(false);
            mental.normalizeVelocityToMotionSpeed();
            return;
        }
        const position = mental.getPosition();
        const worldDistance = Math.sqrt(position.x * position.x + position.y * position.y + position.z * position.z) * mind.scale;
        const mindRadius = mind.getRadius();
        const mentalRadius = mental.getRadius() * mind.scale;
        const maxDistance = Math.max(mentalRadius + 0.005, mindRadius - mentalRadius - 0.01);
        const outside = worldDistance > maxDistance + 1e-6;
        if (outside) {
            mental.setOutsideMindPinned(true);
            mental.setDragging(false);
            mental.setFrozen(true);
            mental.setVelocity(0, 0, 0);
            mental.setLabelEnabled(true);
            mental.setLabelWorldSize(0.3);
            mental.setLabelOffset(0.12);
            mental.setLabelDepthOcclusion(false);
            return;
        }
        mental.setOutsideMindPinned(false);
        mental.setDragging(false);
        mental.setFrozen(false);
        mental.setLabelEnabled(false);
        mental.setLabelWorldSize(0.18);
        mental.setLabelOffset(0.06);
        mental.normalizeVelocityToMotionSpeed();
    }, [mind]);
    useEffect(() => {
        const canvas = gl.domElement;
        const DRAG_THRESHOLD_PX = 6;
        const setPointerFromEvent = (event: PointerEvent) => {
            const rect = canvas.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };
        const handlePointer = (event: PointerEvent) => {
            const isRightButton = event.button === 2;
            const isLeftButton = event.button === 0;
            setPointerFromEvent(event);
            raycaster.setFromCamera(pointer, camera);
            const list = mind.getMentals();
            const targets: THREE.Object3D[] = [];
            list.forEach((mental) => {
                const mesh = mental.getMesh();
                if (mesh)
                    targets.push(mesh);
            });
            const hits = raycaster.intersectObjects(targets, true);
            if (!hits.length)
                return;
            const hit = hits[0].object;
            const found = list.find((mental) => {
                const mesh = mental.getMesh();
                if (!mesh)
                    return false;
                let node: THREE.Object3D | null = hit;
                while (node) {
                    if (node === mesh)
                        return true;
                    node = node.parent;
                }
                return false;
            });
            if (found) {
                if (isLeftButton) {
                    mind.getMentals().forEach((m) => m.setFrozen(m === found));
                    found.setFrozen(true);
                    const foundMesh = found.getMesh();
                    const worldPos = new THREE.Vector3();
                    foundMesh?.getWorldPosition(worldPos);
                    focusTargetRef.current = worldPos;
                    const screenPos = { x: event.clientX, y: event.clientY };
                    const idx = list.indexOf(found);
                    onSelectMental({
                        name: found.getName(),
                        detail: found.getDetail(),
                        type: found.getType?.() ?? 'mental',
                        labelNumber: idx + 1,
                        screenPosition: screenPos,
                        modelPath: found.getModelPath?.(),
                    });
                    return;
                }
                if (!isRightButton)
                    return;
                const mesh = found.getMesh();
                const mindMesh = mind.getMesh();
                if (!mesh || !mindMesh)
                    return;
                const worldPos = new THREE.Vector3();
                mesh.getWorldPosition(worldPos);
                camera.getWorldDirection(dragNormalRef.current);
                const dragPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(dragNormalRef.current, worldPos);
                dragStateRef.current = {
                    mental: found,
                    startX: event.clientX,
                    startY: event.clientY,
                    plane: dragPlane,
                };
                dragActiveRef.current = false;
                found.setOutsideMindPinned(false);
                found.setDragging(true);
                found.setFrozen(true);
                found.setVelocity(0, 0, 0);
                if (controlsRef?.current)
                    controlsRef.current.enabled = false;
                event.stopPropagation();
                event.preventDefault();
            }
        };
        const handlePointerMove = (event: PointerEvent) => {
            const state = dragStateRef.current;
            if (!state)
                return;
            const dx = event.clientX - state.startX;
            const dy = event.clientY - state.startY;
            const movedEnough = Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX;
            if (!dragActiveRef.current && movedEnough) {
                dragActiveRef.current = true;
            }
            if (!dragActiveRef.current)
                return;
            const mindMesh = mind.getMesh();
            if (!mindMesh)
                return;
            setPointerFromEvent(event);
            raycaster.setFromCamera(pointer, camera);
            const hit = raycaster.ray.intersectPlane(state.plane, dragPointRef.current);
            if (!hit)
                return;
            const local = mindMesh.worldToLocal(hit.clone());
            state.mental.setPosition(local.x, local.y, local.z);
            state.mental.setVelocity(0, 0, 0);
        };
        const handlePointerUp = () => {
            const state = dragStateRef.current;
            dragStateRef.current = null;
            if (!state)
                return;
            if (controlsRef?.current)
                controlsRef.current.enabled = true;
            finalizeDraggedMental(state.mental, dragActiveRef.current);
            dragActiveRef.current = false;
        };
        canvas.addEventListener('pointerdown', handlePointer);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        const handleContextMenu = (event: MouseEvent) => {
            if (dragStateRef.current)
                event.preventDefault();
        };
        canvas.addEventListener('contextmenu', handleContextMenu);
        return () => {
            canvas.removeEventListener('pointerdown', handlePointer);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            canvas.removeEventListener('contextmenu', handleContextMenu);
            if (controlsRef?.current)
                controlsRef.current.enabled = true;
            if (dragStateRef.current) {
                dragStateRef.current.mental.setDragging(false);
            }
            dragStateRef.current = null;
            dragActiveRef.current = false;
        };
    }, [camera, controlsRef, finalizeDraggedMental, gl, mind, onSelectMental, pointer, raycaster, focusTargetRef]);
    useEffect(() => {
        if (!isXrActive)
            return;
        const xrRaycaster = new THREE.Raycaster();
        xrRaycaster.camera = camera;
        const controllers = [gl.xr.getController(0), gl.xr.getController(1)];
        const listMentals = () => mind.getMentals();
        const findMentalHit = (controller: THREE.Object3D): {
            mental: Mental;
            distance: number;
        } | null => {
            const list = listMentals();
            const targets: THREE.Object3D[] = [];
            list.forEach((mental) => {
                const mesh = mental.getMesh();
                if (mesh)
                    targets.push(mesh);
            });
            if (!targets.length)
                return null;
            xrRayOriginRef.current.setFromMatrixPosition(controller.matrixWorld);
            xrRayDirectionRef.current.set(0, 0, -1).transformDirection(controller.matrixWorld);
            xrRaycaster.set(xrRayOriginRef.current, xrRayDirectionRef.current);
            const hits = xrRaycaster.intersectObjects(targets, false);
            if (!hits.length)
                return null;
            const hit = hits[0];
            const found = list.find((mental) => {
                const mesh = mental.getMesh();
                if (!mesh)
                    return false;
                let node: THREE.Object3D | null = hit.object;
                while (node) {
                    if (node === mesh)
                        return true;
                    node = node.parent;
                }
                return false;
            });
            if (!found)
                return null;
            return { mental: found, distance: hit.distance };
        };
        const handleXrSelectStart = (controller: THREE.Object3D, event: Event) => {
            if (!gl.xr.isPresenting)
                return;
            if (!controller)
                return;
            const hit = findMentalHit(controller);
            if (!hit)
                return;
            const handedness = (event as {
                data?: XRInputSource;
            }).data?.handedness;
            const isRightHand = handedness === 'right';
            const isLeftHand = handedness === 'left';
            if (isRightHand) {
                hit.mental.setOutsideMindPinned(false);
                hit.mental.setDragging(true);
                hit.mental.setFrozen(true);
                hit.mental.setVelocity(0, 0, 0);
                xrDragStateRef.current = {
                    mental: hit.mental,
                    controller,
                    distance: THREE.MathUtils.clamp(hit.distance, 0.35, 5),
                    moved: false,
                };
                return;
            }
            if (!isLeftHand)
                return;
            if (selectedMentalName)
                return;
            mind.getMentals().forEach((m) => m.setFrozen(m === hit.mental));
            hit.mental.setFrozen(true);
            const foundMesh = hit.mental.getMesh();
            const worldPos = new THREE.Vector3();
            foundMesh?.getWorldPosition(worldPos);
            focusTargetRef.current = worldPos;
            const list = listMentals();
            const idx = list.indexOf(hit.mental);
            onSelectMental({
                name: hit.mental.getName(),
                detail: hit.mental.getDetail(),
                type: hit.mental.getType?.() ?? 'mental',
                labelNumber: idx + 1,
                modelPath: hit.mental.getModelPath?.(),
            });
        };
        const handleXrSelectEnd = (controller: THREE.Object3D) => {
            const state = xrDragStateRef.current;
            if (!state)
                return;
            if (!controller || controller !== state.controller)
                return;
            finalizeDraggedMental(state.mental, state.moved);
            xrDragStateRef.current = null;
        };
        const teardown: Array<() => void> = [];
        controllers.forEach((controller) => {
            const onSelectStart = (event: {
                data: XRInputSource;
            }) => {
                handleXrSelectStart(controller, event as unknown as Event);
            };
            const onSelectEnd = () => {
                handleXrSelectEnd(controller);
            };
            controller.addEventListener('selectstart', onSelectStart);
            controller.addEventListener('selectend', onSelectEnd);
            teardown.push(() => {
                controller.removeEventListener('selectstart', onSelectStart);
                controller.removeEventListener('selectend', onSelectEnd);
            });
        });
        return () => {
            teardown.forEach((fn) => fn());
            if (xrDragStateRef.current) {
                xrDragStateRef.current.mental.setDragging(false);
                xrDragStateRef.current.mental.setFrozen(false);
                xrDragStateRef.current = null;
            }
        };
    }, [camera, finalizeDraggedMental, focusTargetRef, gl, isXrActive, mind, onSelectMental, selectedMentalName]);
    useEffect(() => {
        if (!onHoverSelection)
            return;
        const canvas = gl.domElement;
        const handlePointerMove = (event: PointerEvent) => {
            if (dragStateRef.current)
                return;
            const rect = canvas.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            raycaster.setFromCamera(pointer, camera);
            const list = mind.getMentals();
            const targets: THREE.Object3D[] = [];
            list.forEach((mental) => {
                const mesh = mental.getMesh();
                if (mesh)
                    targets.push(mesh);
            });
            const hits = raycaster.intersectObjects(targets, true);
            if (!hits.length) {
                if (hoveredMeshRef.current) {
                    hoveredMeshRef.current = null;
                    onHoverSelection([]);
                }
                return;
            }
            const hit = hits[0].object;
            const foundMesh = targets.find((mesh) => {
                let node: THREE.Object3D | null = hit;
                while (node) {
                    if (node === mesh)
                        return true;
                    node = node.parent;
                }
                return false;
            });
            if (foundMesh && foundMesh !== hoveredMeshRef.current) {
                hoveredMeshRef.current = foundMesh;
                onHoverSelection([foundMesh]);
            }
        };
        canvas.addEventListener('pointermove', handlePointerMove);
        return () => {
            canvas.removeEventListener('pointermove', handlePointerMove);
            if (hoveredMeshRef.current) {
                hoveredMeshRef.current = null;
            }
        };
    }, [camera, gl, mind, onHoverSelection, pointer, raycaster]);
    useEffect(() => {
        if (!selectedMentalName) {
            mind.getMentals().forEach((m) => m.setFrozen(false));
            focusTargetRef.current = null;
        }
    }, [selectedMentalName, focusTargetRef, mind]);
    useFrame(() => {
        const state = xrDragStateRef.current;
        if (!state || !gl.xr.isPresenting || !isXrActive)
            return;
        const mindMesh = mind.getMesh();
        if (!mindMesh)
            return;
        const controller = state.controller;
        xrRayOriginRef.current.setFromMatrixPosition(controller.matrixWorld);
        xrRayDirectionRef.current.set(0, 0, -1).transformDirection(controller.matrixWorld);
        const worldTarget = xrRayOriginRef.current.clone().addScaledVector(xrRayDirectionRef.current, state.distance);
        const local = mindMesh.worldToLocal(worldTarget);
        const prev = state.mental.getPosition();
        if (Math.hypot(local.x - prev.x, local.y - prev.y, local.z - prev.z) > 1e-4) {
            state.moved = true;
        }
        state.mental.setPosition(local.x, local.y, local.z);
        state.mental.setVelocity(0, 0, 0);
    });
    return null;
}
function OptionMenu({ selection, panelPosition, overlayRootRef, onClose, onVoice, voiceLoading, onViewDetail, onDragPositionChange, }: {
    selection: InspectSelection;
    panelPosition: {
        x: number;
        y: number;
    } | null;
    overlayRootRef: React.RefObject<HTMLElement | null>;
    onClose: () => void;
    onVoice: (selection: InspectSelection) => void;
    voiceLoading: boolean;
    onViewDetail: (selection: InspectSelection) => void;
    onDragPositionChange?: (pos: {
        x: number;
        y: number;
    }) => void;
}) {
    const menuRef = useRef<HTMLDivElement | null>(null);
    const dragRef = useRef<{
        dragging: boolean;
        offsetX: number;
        offsetY: number;
    }>({
        dragging: false,
        offsetX: 0,
        offsetY: 0,
    });
    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            if (!dragRef.current.dragging || !menuRef.current)
                return;
            const root = overlayRootRef.current;
            if (!root)
                return;
            const menu = menuRef.current;
            const width = menu.offsetWidth || 240;
            const height = menu.offsetHeight || 200;
            const margin = 12;
            const cr = root.getBoundingClientRect();
            const visualLeft = event.clientX - dragRef.current.offsetX - cr.left;
            const visualTop = event.clientY - dragRef.current.offsetY - cr.top;
            const minCx = width / 2 + margin;
            const maxCx = cr.width - width / 2 - margin;
            const centerX = THREE.MathUtils.clamp(visualLeft + width / 2, minCx, maxCx);
            const cssTopMin = height + margin;
            const cssTopMax = cr.height - margin;
            const cssTop = THREE.MathUtils.clamp(visualTop + height, cssTopMin, cssTopMax);
            onDragPositionChange?.({
                x: centerX,
                y: cssTop + 12,
            });
        };
        const handlePointerUp = () => {
            dragRef.current.dragging = false;
        };
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [onDragPositionChange, overlayRootRef]);
    const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
        if ((event.target as HTMLElement).closest('button'))
            return;
        const rect = event.currentTarget.getBoundingClientRect();
        dragRef.current.dragging = true;
        dragRef.current.offsetX = event.clientX - rect.left;
        dragRef.current.offsetY = event.clientY - rect.top;
        event.currentTarget.setPointerCapture?.(event.pointerId);
    };
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
    };
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
    };
    const renderOption = (label: string, description: string, onClick: () => void, disabled?: boolean) => (<button key={label} type="button" style={{
            ...optionStyle,
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer',
        }} onClick={() => {
            if (disabled)
                return;
            onClick();
        }} onMouseEnter={(e) => {
            ;
            (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(120deg, rgba(96,165,250,0.28), rgba(16,185,129,0.24))';
        }} onMouseLeave={(e) => {
            ;
            (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(120deg, rgba(59,130,246,0.18), rgba(16,185,129,0.16))';
        }}>
      <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(59,130,246,0.55), rgba(16,185,129,0.55))',
            border: '1px solid rgba(96,165,250,0.45)',
            boxShadow: '0 0 12px rgba(34,211,238,0.35)',
        }}/>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: '#f8fafc', letterSpacing: 0.2 }}>{label}</div>
        <div style={{ fontSize: 12, color: '#dbeafe', marginTop: 2, opacity: 0.9 }}>{description}</div>
        {disabled && label === 'Voice' ? (<div style={{ fontSize: 11, color: '#bfdbfe', marginTop: 2 }}>Generating audio…</div>) : null}
      </div>
    </button>);
    return (<div ref={menuRef} style={menuStyle} onPointerDown={handleDragStart}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 14, boxShadow: '0 0 0 1px rgba(125,211,252,0.25), inset 0 1px 0 rgba(255,255,255,0.04)' }}/>
      <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            cursor: 'grab',
        }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 1.4, color: '#bfdbfe', textTransform: 'uppercase' }}>Mental Sphere</div>
          <div style={{ fontWeight: 900, fontSize: 18, color: '#f8fafc', textShadow: '0 2px 6px rgba(0,0,0,0.35)' }}>{selection.name}</div>
        </div>
        <button type="button" onClick={onClose} style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'rgba(15,23,42,0.5)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#e5e7eb',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
        }}>
          ✕
        </button>
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {renderOption('View Detail', 'Inspect this sphere closely', () => onViewDetail(selection))}
        {renderOption('Voice', 'Hear a narrated explanation', () => onVoice(selection), voiceLoading)}
        {renderOption('How it works?', 'Learn the mechanics in-game', () => { })}
      </div>
    </div>);
}
function InspectConnector({ panelRect, target, overlayRootRef, }: {
    panelRect: DOMRect | null;
    target: {
        x: number;
        y: number;
    } | null;
    overlayRootRef: React.RefObject<HTMLElement | null>;
}) {
    if (!panelRect || !target)
        return null;
    const root = overlayRootRef.current;
    if (!root)
        return null;
    const or = root.getBoundingClientRect();
    const start = {
        x: panelRect.left - or.left + panelRect.width / 2,
        y: panelRect.top - or.top + panelRect.height / 2,
    };
    const padding = 24;
    const left = Math.min(start.x, target.x) - padding;
    const top = Math.min(start.y, target.y) - padding;
    const width = Math.abs(start.x - target.x) + padding * 2;
    const height = Math.abs(start.y - target.y) + padding * 2;
    const from = { x: start.x - left, y: start.y - top };
    const to = { x: target.x - left, y: target.y - top };
    return (<div style={{
            position: 'absolute',
            left,
            top,
            width,
            height,
            pointerEvents: 'none',
            zIndex: 17,
        }}>
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="inspect-connector-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8"/>
            <stop offset="50%" stopColor="#a78bfa"/>
            <stop offset="100%" stopColor="#38bdf8"/>
          </linearGradient>
          <marker id="inspect-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L10,5 L0,10 z" fill="#7dd3fc"/>
          </marker>
        </defs>
        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="url(#inspect-connector-gradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" markerEnd="url(#inspect-arrow)" style={{ filter: 'drop-shadow(0 0 6px rgba(125,211,252,0.6))' }}/>
        <circle cx={to.x} cy={to.y} r={6} fill="#38bdf8" opacity={0.9}/>
        <circle cx={to.x} cy={to.y} r={11} fill="none" stroke="#38bdf8" strokeOpacity={0.3} strokeWidth={2}/>
      </svg>
    </div>);
}
function NeutralMindScene({ mind, mentals, selectedMentalName, onSelectMental, onUpdatePanelPosition, overlayRootRef, highlightSelection, flyTargetName, onFlyComplete, onRendererReady, isArActive, selected, inspectOpen, onViewDetail, onBackFromDetail, onVoiceSelection, onCloseSelection, voiceLoading = false, }: {
    mind: Mind;
    mentals: Mental[];
    selectedMentalName: string | null;
    onSelectMental: (info: InspectSelection) => void;
    onUpdatePanelPosition?: (pos: {
        x: number;
        y: number;
    } | null) => void;
    overlayRootRef: React.RefObject<HTMLElement | null>;
    highlightSelection?: THREE.Object3D[];
    flyTargetName?: string | null;
    onFlyComplete?: () => void;
    onRendererReady?: (renderer: THREE.WebGLRenderer) => void;
    isArActive?: boolean;
    selected?: InspectSelection | null;
    inspectOpen?: boolean;
    onViewDetail?: (selection: InspectSelection) => void;
    onBackFromDetail?: () => void;
    onVoiceSelection?: (selection: InspectSelection) => void;
    onCloseSelection?: () => void;
    voiceLoading?: boolean;
}) {
    const focusTargetRef = useRef<THREE.Vector3 | null>(null);
    const [hoverSelection, setHoverSelection] = useState<THREE.Object3D[]>([]);
    const controlsRef = useRef<OrbitControlsImpl | null>(null);
    const combinedSelection = useMemo(() => [...hoverSelection, ...(highlightSelection ?? [])], [hoverSelection, highlightSelection]);
    return (<Canvas camera={{ position: DESKTOP_INSPECT_CAMERA_POS, fov: 60 }} shadows gl={{ antialias: true, toneMappingExposure: 1.05, alpha: true }}>
      {!isArActive ? (<Environment preset="dawn" background blur={1} backgroundIntensity={0.58} environmentIntensity={0.95}/>) : null}
      <XRClearMode isArMode={Boolean(isArActive)}/>
      <XRControllers />
      <XRExitByGrip enabled={Boolean(isArActive)} holdMs={5000}/>
      <OrbitControls ref={controlsRef} enabled={!isArActive} enableDamping dampingFactor={0.05} enableZoom enablePan={false} enableRotate minDistance={2} maxDistance={18} target={[mind.position.x, mind.position.y, mind.position.z]}/>
      <ExitArCameraReset isArActive={isArActive} controlsRef={controlsRef} mind={mind}/>
      <ambientLight intensity={0.52}/>
      <directionalLight position={[6, 8, 6]} intensity={1.35} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
      <directionalLight position={[-4, 5, -6]} intensity={0.55}/>
      <pointLight position={[0, 5, 0]} intensity={1.05} distance={14} decay={2}/>
      <pointLight position={[0, 0, 5]} intensity={0.85} distance={14} decay={2}/>
      <pointLight position={[4, 2, -4]} intensity={0.45} distance={16} decay={2}/>
      {!isArActive ? <GroundPlane /> : null}
      <NeutralMindContents mind={mind} mentals={mentals}/>
      <MindSphere mind={mind}/>
      <NeutralMentalsLayer mind={mind} mentals={mentals} selectedMentalName={selectedMentalName} onSelectMental={onSelectMental} focusTargetRef={focusTargetRef} controlsRef={controlsRef} isXrActive={isArActive} onHoverSelection={setHoverSelection}/>
      {isArActive && selected && (<XRInspectPanel selection={selected} inspectOpen={Boolean(inspectOpen)} onViewDetail={onViewDetail ?? (() => { })} onBack={onBackFromDetail ?? (() => { })} onShowProfile={onViewDetail ?? (() => { })} onVoice={onVoiceSelection} onClose={onCloseSelection ?? (() => { })} voiceLoading={Boolean(voiceLoading)} contentScale={MINDSTUDY_INSPECT_AR_XR_PANEL_CONTENT_SCALE} stationaryLayout={MINDSTUDY_INSPECT_XR_PANEL_LAYOUT}/>)}
      <FlyToCameraEffect mind={mind} targetName={flyTargetName ?? null} onDone={onFlyComplete}/>
      <PanelPositionSync focusTargetRef={focusTargetRef} selectedMentalName={selectedMentalName} overlayRootRef={overlayRootRef} onUpdate={onUpdatePanelPosition}/>
      
      {!isArActive && (<EffectComposer multisampling={2} autoClear={false}>
          <Outline selection={combinedSelection} blendFunction={BlendFunction.ALPHA} visibleEdgeColor={0xffffff} hiddenEdgeColor={0x190a05} edgeStrength={30} resolutionScale={1} xRay/>
        </EffectComposer>)}
      <XRStatusBridge onRendererReady={onRendererReady}/>
    </Canvas>);
}
export function MindStudyInspect(): React.ReactElement {
    const { mindId = 'mind' } = useParams<MindStudyInspectParams>();
    const navigate = useNavigate();
    const [selected, setSelected] = useState<InspectSelection | null>(null);
    const [panelPosition, setPanelPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightSelection, setHighlightSelection] = useState<THREE.Object3D[]>([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [flyTargetName, setFlyTargetName] = useState<string | null>(null);
    const [voiceLoading, setVoiceLoading] = useState(false);
    const [inspectOpen, setInspectOpen] = useState(false);
    const [panelRect, setPanelRect] = useState<DOMRect | null>(null);
    const overlayRootRef = useRef<HTMLDivElement | null>(null);
    const menuRevealFrameRef = useRef<number | null>(null);
    const [focusScreenPosition, setFocusScreenPosition] = useState<{
        x: number;
        y: number;
    } | null>(null);
    const [menuRevealReady, setMenuRevealReady] = useState(false);
    const [menuLineProgress, setMenuLineProgress] = useState(1);
    const [mentals, setMentals] = useState<Mental[]>(() => buildDefaultNeutralMentals());
    const [mindLabel, setMindLabel] = useState<string>(() => formatMindName(mindId));
    const [mindDetail, setMindDetail] = useState<string>('Neutral mentals playground');
    const [loadError, setLoadError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
    const { activeXrMode, arMessage, arButtonDisabled, arButtonTitle, handleToggleAr, } = useXRSession({
        renderer,
        overlayRoot: overlayRootRef.current,
    });
    useEffect(() => {
        if (!renderer)
            return;
        renderer.xr.enabled = true;
    }, [renderer]);
    const isArActive = activeXrMode === 'ar';
    const wasArActiveRef = useRef(isArActive);
    useEffect(() => {
        const wasArActive = wasArActiveRef.current;
        wasArActiveRef.current = isArActive;
        if (wasArActive && !isArActive) {
            window.location.reload();
        }
    }, [isArActive]);
    useEffect(() => {
        if (!selected) {
            setInspectOpen(false);
            setPanelRect(null);
            setMenuRevealReady(false);
            setMenuLineProgress(1);
        }
    }, [selected]);
    useEffect(() => {
        return () => {
            if (menuRevealFrameRef.current !== null) {
                cancelAnimationFrame(menuRevealFrameRef.current);
                menuRevealFrameRef.current = null;
            }
        };
    }, []);
    const readableMindName = useMemo(() => formatMindName(mindId), [mindId]);
    useEffect(() => {
        let cancelled = false;
        const hydrateFromSheet = async () => {
            setLoading(true);
            try {
                const targetIdEarly = (mindId ?? 'mind').toLowerCase();
                const canonicalMind = /^mind-(\d+)$/.exec(targetIdEarly);
                if (canonicalMind) {
                    try {
                        const [mentalsRes, mindsRes] = await Promise.all([
                            fetch(`${API_BASE_STATIC}/api/static/mentals`).then((r) => r.json()),
                            fetch(`${API_BASE_STATIC}/api/static/minds`).then((r) => r.json()),
                        ]);
                        if (cancelled)
                            return;
                        const numericMindId = Number(canonicalMind[1]);
                        const minds: ApiStaticMindRow[] = mindsRes.minds ?? [];
                        const mentalsList: ApiStaticMentalRow[] = mentalsRes.mentals ?? [];
                        const staticMind = minds.find((row) => row.id === numericMindId);
                        if (staticMind) {
                            const mentalById = new Map(mentalsList.map((x) => [x.id, x]));
                            const built = buildMentalsFromBackendMentalIds(staticMind.mental_ids ?? [], mentalById);
                            const englishMindName = staticMind.name_en?.trim() ||
                                staticMind.name?.trim() ||
                                staticMind.thai?.trim() ||
                                formatMindName(targetIdEarly);
                            setMindLabel(englishMindName);
                            const meta = [staticMind.pali, staticMind.category].filter(Boolean).join(' · ');
                            const thaiMeta = staticMind.thai?.trim() ? `Thai: ${staticMind.thai.trim()}` : '';
                            setMindDetail(staticMind.description?.trim() ||
                                [meta, thaiMeta].filter(Boolean).join(' · ') ||
                                'Canonical citta from /api/static/minds');
                            setMentals((prev) => {
                                prev.forEach((m) => m.dispose());
                                return built;
                            });
                            setLoadError(null);
                            return;
                        }
                    }
                    catch {
                    }
                }
                const rows = await loadMindElementRows();
                if (cancelled)
                    return;
                if (!rows.length) {
                    setLoadError('MindElement.xlsx is empty; showing neutral factors.');
                    setMindLabel(readableMindName);
                    setMindDetail('Neutral mentals playground');
                    setMentals((prev) => {
                        prev.forEach((m) => m.dispose());
                        return buildDefaultNeutralMentals();
                    });
                    return;
                }
                const targetId = (mindId ?? 'mind').toLowerCase();
                const targetRow = rows.find((row) => row.id === targetId);
                if (targetRow) {
                    setMindLabel(targetRow.name);
                    setMindDetail(targetRow.group || 'MindElement.xlsx');
                    setMentals((prev) => {
                        prev.forEach((m) => m.dispose());
                        return buildMentalsFromRow(targetRow!);
                    });
                }
                else {
                    const singleMentals = buildSingleMentalFromCetasikaId(targetId);
                    if (singleMentals) {
                        setMindLabel(formatMindName(targetId));
                        setMindDetail('Cetasika');
                        setMentals((prev) => {
                            prev.forEach((m) => m.dispose());
                            return singleMentals;
                        });
                    }
                    else if (rows[0]) {
                        setMindLabel(rows[0].name);
                        setMindDetail(rows[0].group || 'MindElement.xlsx');
                        setMentals((prev) => {
                            prev.forEach((m) => m.dispose());
                            return buildMentalsFromRow(rows[0]!);
                        });
                    }
                    else {
                        setMindLabel(formatMindName(targetId));
                        setMindDetail('Neutral mentals playground');
                        setMentals((prev) => {
                            prev.forEach((m) => m.dispose());
                            return buildDefaultNeutralMentals();
                        });
                    }
                }
                setLoadError(null);
            }
            catch (err) {
                console.error('Failed to load MindElement.xlsx', err);
                if (!cancelled) {
                    setLoadError('Unable to read MindElement.xlsx; showing neutral factors.');
                    setMindLabel(readableMindName);
                    setMindDetail('Neutral mentals playground');
                    setMentals((prev) => {
                        prev.forEach((m) => m.dispose());
                        return buildDefaultNeutralMentals();
                    });
                }
            }
            finally {
                if (!cancelled)
                    setLoading(false);
            }
        };
        hydrateFromSheet();
        return () => {
            cancelled = true;
        };
    }, [mindId, readableMindName]);
    const mind = useMemo(() => new Mind({
        name: mindLabel,
        detail: mindDetail,
        position: [0, -0.25, 0],
        scale: 1.6,
        transparent: true,
        opacity: 0.18,
        color: parseInt('3b82f6', 16),
        labelEnabled: true,
        labelWorldSize: MINDSTUDY_INSPECT_LABEL_WORLD_SIZE,
        labelOffset: MINDSTUDY_INSPECT_LABEL_OFFSET,
    }), [mindLabel, mindDetail]);
    useEffect(() => () => mind.dispose(), [mind]);
    useEffect(() => {
        if (isArActive) {
            mind.setScale(MINDSTUDY_INSPECT_AR_MIND_SCALE_BASE * MINDSTUDY_INSPECT_AR_SCALE);
            mind.setPosition(0, 1.5, -2);
            mind.setLabelWorldSize(MINDSTUDY_INSPECT_AR_LABEL_WORLD_SIZE);
            mind.setLabelOffset(MINDSTUDY_INSPECT_AR_LABEL_OFFSET);
            return;
        }
        mind.setScale(1.6);
        mind.setPosition(0, -0.25, 0);
        mind.setLabelWorldSize(MINDSTUDY_INSPECT_LABEL_WORLD_SIZE);
        mind.setLabelOffset(MINDSTUDY_INSPECT_LABEL_OFFSET);
    }, [isArActive, mind]);
    useEffect(() => {
        mind.setPassthroughFriendlyGlass(isArActive);
        mentals.forEach((m) => m.setPassthroughFriendlyGlass(isArActive));
    }, [isArActive, mind, mentals]);
    const mentalNames = useMemo(() => mentals.map((m) => m.getName()), [mentals]);
    const pickedMentalMesh = useMemo(() => {
        if (!selected?.name)
            return null;
        const mental = mentals.find((m) => m.getName() === selected.name);
        return mental?.getMesh() ?? null;
    }, [mentals, selected?.name]);
    const sceneOutlineSelection = useMemo(() => {
        const seen = new Set<THREE.Object3D>();
        const out: THREE.Object3D[] = [];
        for (const o of highlightSelection) {
            if (!seen.has(o)) {
                seen.add(o);
                out.push(o);
            }
        }
        if (pickedMentalMesh && !seen.has(pickedMentalMesh))
            out.push(pickedMentalMesh);
        return out;
    }, [highlightSelection, pickedMentalMesh]);
    const suggestionItems = useMemo(() => [mindLabel, ...mentalNames], [mindLabel, mentalNames]);
    const filteredSuggestions = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term)
            return suggestionItems;
        return suggestionItems.filter((item) => item.toLowerCase().includes(term));
    }, [searchTerm, suggestionItems]);
    useEffect(() => () => {
        mentals.forEach((m) => m.dispose());
    }, [mentals]);
    const handleSelect = (info: InspectSelection) => {
        setFlyTargetName(null);
        if (menuRevealFrameRef.current !== null) {
            cancelAnimationFrame(menuRevealFrameRef.current);
            menuRevealFrameRef.current = null;
        }
        setSelected(info);
        setInspectOpen(false);
        setMenuRevealReady(false);
        setMenuLineProgress(0);
        if (isArActive) {
            setFocusScreenPosition(null);
            setPanelPosition(null);
            setMenuRevealReady(true);
            setMenuLineProgress(1);
            return;
        }
        if (info.screenPosition && overlayRootRef.current) {
            const rect = overlayRootRef.current.getBoundingClientRect();
            const srcLocal = {
                x: info.screenPosition.x - rect.left,
                y: info.screenPosition.y - rect.top,
            };
            setFocusScreenPosition(srcLocal);
            const overlayCenter = { x: rect.width / 2, y: rect.height / 2 };
            const outward = {
                x: srcLocal.x - overlayCenter.x,
                y: srcLocal.y - overlayCenter.y,
            };
            const length = Math.hypot(outward.x, outward.y);
            const nx = length > 1e-5 ? outward.x / length : 0.9;
            const ny = length > 1e-5 ? outward.y / length : -0.4;
            const pushDistance = 210;
            const desiredX = srcLocal.x + nx * pushDistance;
            const desiredY = srcLocal.y + ny * pushDistance;
            const menuWidth = 260;
            const margin = 12;
            const menuH = MINDSTUDY_INSPECT_OPTION_MENU_EST_HEIGHT;
            const minAnchorY = menuH + margin + 12;
            const maxAnchorY = rect.height - margin + 12;
            const minX = menuWidth / 2 + margin;
            const maxX = rect.width - menuWidth / 2 - margin;
            setPanelPosition({
                x: THREE.MathUtils.clamp(desiredX, minX, maxX),
                y: THREE.MathUtils.clamp(desiredY, minAnchorY, maxAnchorY),
            });
        }
        else if (info.screenPosition) {
            setFocusScreenPosition(info.screenPosition);
            setPanelPosition({ x: info.screenPosition.x - 28, y: info.screenPosition.y });
        }
        else if (typeof window !== 'undefined' && overlayRootRef.current) {
            const rect = overlayRootRef.current.getBoundingClientRect();
            setFocusScreenPosition(null);
            setPanelPosition({
                x: rect.width - 130,
                y: rect.height * 0.52,
            });
        }
        else {
            setFocusScreenPosition(null);
            setPanelPosition(null);
        }
        const startTs = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const durationMs = 360;
        const step = (nowTs: number) => {
            const elapsed = nowTs - startTs;
            const t = THREE.MathUtils.clamp(elapsed / durationMs, 0, 1);
            const eased = 1 - (1 - t) ** 3;
            setMenuLineProgress(eased);
            if (t < 1) {
                menuRevealFrameRef.current = requestAnimationFrame(step);
                return;
            }
            menuRevealFrameRef.current = null;
            setMenuRevealReady(true);
        };
        menuRevealFrameRef.current = requestAnimationFrame(step);
    };
    const handleClose = () => {
        if (menuRevealFrameRef.current !== null) {
            cancelAnimationFrame(menuRevealFrameRef.current);
            menuRevealFrameRef.current = null;
        }
        setSelected(null);
        setPanelPosition(null);
        setFocusScreenPosition(null);
        setInspectOpen(false);
        setPanelRect(null);
        setHighlightSelection([]);
        setMenuRevealReady(false);
        setMenuLineProgress(1);
    };
    const handleSearch = (value?: string) => {
        const incomingTerm = value ?? searchTerm;
        const term = incomingTerm.trim().toLowerCase();
        if (value !== undefined) {
            setSearchTerm(value);
        }
        if (!term) {
            setHighlightSelection([]);
            setFlyTargetName(null);
            return;
        }
        const matches: THREE.Object3D[] = [];
        const mindMesh = mind.getMesh();
        if (mindMesh && mind.getName().toLowerCase().includes(term)) {
            matches.push(mindMesh);
        }
        let firstMentalName: string | null = null;
        mind.getMentals().forEach((mental) => {
            if (mental.getName().toLowerCase().includes(term)) {
                const mesh = mental.getMesh();
                if (mesh)
                    matches.push(mesh);
                if (!firstMentalName)
                    firstMentalName = mental.getName();
            }
        });
        setHighlightSelection(matches);
        setFlyTargetName(firstMentalName);
    };
    const handlePickSuggestion = (value: string) => {
        handleSearch(value);
    };
    const handleViewDetail = (info: InspectSelection) => {
        setSelected(info);
        setFocusScreenPosition((prev) => {
            if (prev)
                return prev;
            if (!info.screenPosition || !overlayRootRef.current)
                return null;
            const r = overlayRootRef.current.getBoundingClientRect();
            return {
                x: info.screenPosition.x - r.left,
                y: info.screenPosition.y - r.top,
            };
        });
        setInspectOpen(true);
    };
    const handleBackFromDetail = useCallback(() => {
        setInspectOpen(false);
    }, []);
    const clientToOverlayLocal = useCallback((point: {
        x: number;
        y: number;
    } | null): {
        x: number;
        y: number;
    } | null => {
        if (!point || !overlayRootRef.current)
            return null;
        const rect = overlayRootRef.current.getBoundingClientRect();
        return { x: point.x - rect.left, y: point.y - rect.top };
    }, []);
    const menuConnectorStart = focusScreenPosition ?? clientToOverlayLocal(selected?.screenPosition ?? null);
    const menuConnectorEnd = panelPosition;
    const showMenuConnector = Boolean(!inspectOpen && selected && menuConnectorStart && menuConnectorEnd);
    const connectorProgress = menuRevealReady ? 1 : menuLineProgress;
    const connectorAnimatedEnd = menuConnectorStart && menuConnectorEnd
        ? {
            x: menuConnectorStart.x + (menuConnectorEnd.x - menuConnectorStart.x) * connectorProgress,
            y: menuConnectorStart.y + (menuConnectorEnd.y - menuConnectorStart.y) * connectorProgress,
        }
        : null;
    const handleVoice = async (selection: InspectSelection) => {
        const apiKey = import.meta.env.VITE_GOOGLE_TTS_KEY;
        if (!apiKey) {
            alert('Missing VITE_GOOGLE_TTS_KEY. Add it to your .env to enable voice.');
            return;
        }
        const voiceDetail = detailTextForVoiceNarration(selection.detail);
        const text = voiceDetail ? `${selection.name}. ${voiceDetail}` : selection.name;
        setVoiceLoading(true);
        try {
            const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: { text },
                    voice: { languageCode: 'en-US', name: 'en-US-Standard-C' },
                    audioConfig: { audioEncoding: 'MP3' },
                }),
            });
            if (!res.ok) {
                throw new Error(`TTS request failed: ${res.status}`);
            }
            const data = await res.json();
            if (!data.audioContent)
                throw new Error('No audioContent in TTS response');
            const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
            audio.play().catch((err) => console.error('Audio playback failed', err));
        }
        catch (err) {
            console.error('TTS error', err);
            alert('Voice playback failed. Check console for details.');
        }
        finally {
            setVoiceLoading(false);
        }
    };
    const mindBadgeStyle: React.CSSProperties = {
        position: 'absolute',
        top: 12,
        left: 12,
        padding: '10px 14px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(59,130,246,0.9), rgba(16,185,129,0.8))',
        color: '#f8fafc',
        fontWeight: 800,
        letterSpacing: 0.2,
        boxShadow: '0 10px 26px rgba(0,0,0,0.25), 0 0 12px rgba(59,130,246,0.35)',
        border: '1px solid rgba(255,255,255,0.22)',
        zIndex: 15,
    };
    return (<main className="page simulation-page">
      <div ref={overlayRootRef} className="simulation-full" style={{ position: 'relative', width: '100%', height: '100vh', minHeight: '100vh', borderRadius: 16, overflow: 'hidden' }}>
        {!isArActive ? (<>
            <div style={mindBadgeStyle}>{mindLabel}</div>
            <div style={{
                position: 'absolute',
                top: 16,
                right: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 10,
                pointerEvents: 'none',
                zIndex: 22,
            }}>
              {searchOpen ? (<>
                  <div style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    background: 'rgba(17, 24, 39, 0.9)',
                    color: '#e5e7eb',
                    padding: '10px 10px',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    pointerEvents: 'auto',
                }}>
                    <button type="button" aria-label="Back to Mind Study" title="Back to Mind Study" onClick={() => navigate('/mind-study')} style={MINDSTUDY_INSPECT_FLOATING_BTN}>
                      ←
                    </button>
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={(e) => {
                    if (e.key === 'Enter')
                        handleSearch();
                }} placeholder="Search mind / mental" style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid rgba(148, 163, 184, 0.6)',
                    background: 'rgba(30, 41, 59, 0.95)',
                    color: '#e5e7eb',
                    minWidth: 220,
                }}/>
                    <button className="mindstudy-btn primary" type="button" onClick={() => handleSearch()} style={{ padding: '10px 12px', height: 44, display: 'flex', alignItems: 'center', gap: 6, fontSize: 18 }}>
                      🔍
                    </button>
                    <button className="mindstudy-btn ghost" type="button" onClick={() => setSearchOpen(false)} style={{ padding: '10px 12px', height: 44, fontSize: 16 }}>
                      ✕
                    </button>
                  </div>
                  <div style={{
                    background: 'rgba(17, 24, 39, 0.9)',
                    color: '#e5e7eb',
                    padding: '10px 12px',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    maxHeight: 180,
                    overflow: 'auto',
                    minWidth: 240,
                    pointerEvents: 'auto',
                }}>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, color: '#9ca3af', marginBottom: 6 }}>Mind</div>
                    <div style={{ marginBottom: 10 }}>
                      <button type="button" onClick={() => handlePickSuggestion(mind.getName())} style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'rgba(30,41,59,0.65)',
                    color: '#e5e7eb',
                    border: '1px solid rgba(148, 163, 184, 0.6)',
                    borderRadius: 10,
                    padding: '8px 10px',
                    cursor: 'pointer',
                }}>
                        {mind.getName()}
                      </button>
                    </div>
                    <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, color: '#9ca3af', marginBottom: 4 }}>Mentals</div>
                    <ul style={{ margin: 0, paddingLeft: 0, display: 'grid', gap: 6, listStyle: 'none' }}>
                      {filteredSuggestions
                    .filter((name) => name !== mind.getName())
                    .map((m) => (<li key={m}>
                            <button type="button" onClick={() => handlePickSuggestion(m)} style={{
                        width: '100%',
                        textAlign: 'left',
                        background: 'rgba(30,41,59,0.65)',
                        color: '#e5e7eb',
                        border: '1px solid rgba(148, 163, 184, 0.6)',
                        borderRadius: 10,
                        padding: '8px 10px',
                        cursor: 'pointer',
                    }}>
                              {m}
                            </button>
                          </li>))}
                      {!filteredSuggestions.filter((name) => name !== mind.getName()).length ? (<li style={{ color: '#9ca3af', fontSize: 12 }}>No matches</li>) : null}
                    </ul>
                  </div>
                </>) : (<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
                  <button type="button" aria-label="Back to Mind Study" title="Back to Mind Study" onClick={() => navigate('/mind-study')} style={MINDSTUDY_INSPECT_FLOATING_BTN}>
                    ←
                  </button>
                  <button type="button" aria-label="Enter AR" title={arButtonTitle} onClick={() => {
                    void handleToggleAr();
                }} disabled={arButtonDisabled} style={{
                    ...MINDSTUDY_INSPECT_FLOATING_BTN,
                    fontSize: 16,
                    fontWeight: 800,
                    opacity: arButtonDisabled ? 0.55 : 1,
                    cursor: arButtonDisabled ? 'not-allowed' : 'pointer',
                }}>
                    AR
                  </button>
                  <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" style={MINDSTUDY_INSPECT_FLOATING_BTN}>
                    🔍
                  </button>
                </div>)}
              <div style={{
                fontSize: 12,
                color: loadError ? '#fca5a5' : '#bfdbfe',
                background: 'rgba(17, 24, 39, 0.75)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10,
                padding: '6px 10px',
                boxShadow: '0 8px 18px rgba(0,0,0,0.3)',
                maxWidth: 260,
            }}>
                {loading ? 'Loading MindElement.xlsx…' : arMessage ?? loadError ?? mindDetail}
              </div>
            </div>
          </>) : null}
        {selected && !isArActive && !inspectOpen && menuRevealReady && (<OptionMenu selection={selected} panelPosition={panelPosition} overlayRootRef={overlayRootRef} onClose={handleClose} onVoice={handleVoice} voiceLoading={voiceLoading} onViewDetail={handleViewDetail} onDragPositionChange={setPanelPosition}/>)}
        {selected && !isArActive && inspectOpen && (<InspectPanel selection={selected} panelPosition={panelPosition} positionRootRef={overlayRootRef} onClose={handleClose} onMeasure={setPanelRect} onVoice={handleVoice} voiceLoading={voiceLoading} onDragPositionChange={setPanelPosition}/>)}
        <NeutralMindScene mind={mind} mentals={mentals} selectedMentalName={selected?.name ?? null} onSelectMental={handleSelect} onUpdatePanelPosition={inspectOpen ? undefined : setFocusScreenPosition} overlayRootRef={overlayRootRef} highlightSelection={sceneOutlineSelection} flyTargetName={flyTargetName} onFlyComplete={() => setFlyTargetName(null)} onRendererReady={setRenderer} isArActive={isArActive} selected={selected} inspectOpen={inspectOpen} onViewDetail={handleViewDetail} onBackFromDetail={handleBackFromDetail} onVoiceSelection={handleVoice} onCloseSelection={handleClose} voiceLoading={voiceLoading}/>
        {!isArActive && showMenuConnector && menuConnectorStart && connectorAnimatedEnd && (<svg style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 17,
                pointerEvents: 'none',
                overflow: 'visible',
            }}>
            <defs>
              <linearGradient id="mindstudy-inspect-menu-connector-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(56,189,248,0.95)"/>
                <stop offset="100%" stopColor="rgba(167,139,250,0.95)"/>
              </linearGradient>
            </defs>
            <line x1={menuConnectorStart.x} y1={menuConnectorStart.y} x2={connectorAnimatedEnd.x} y2={connectorAnimatedEnd.y} stroke="url(#mindstudy-inspect-menu-connector-gradient)" strokeWidth={2.8} strokeLinecap="round"/>
          </svg>)}
        {selected && !isArActive && inspectOpen && (<InspectConnector panelRect={panelRect} target={focusScreenPosition ?? panelPosition} overlayRootRef={overlayRootRef}/>)}
      </div>
    </main>);
}
