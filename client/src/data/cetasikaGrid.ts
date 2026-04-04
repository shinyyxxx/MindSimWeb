/**
 * Cetasika grid data for Mind Study: Neutral (13), Bad (14), Good (25).
 * id is used for route /mind-study/:mindId; className matches Mental classes.
 */

export type CetasikaCard = {
  id: string
  pali: string
  thai: string
  className: string
  description: string
  highlights: string[]
  nameEn?: string
  characteristic?: string
  abhidhammaFunction?: string
  manifestation?: string
  proximateCause?: string
}

export type CetasikaSubcategory = {
  title: string
  titleEn: string
  items: CetasikaCard[]
  /** Anchor id for nav (e.g. cetasikas-neutral-universal, cetasikas-bad-moha) */
  id?: string
}

export type CetasikaCategory = {
  title: string
  titleEn: string
  count: number
  items: CetasikaCard[]
  /** When set, render as one section with sub-sections (e.g. Neutral: Universal 7 + Pakiṇṇaka 6) */
  subcategories?: CetasikaSubcategory[]
}

/** 1. อัญญสมานเจตสิก (Neutral Cetasika – 13) */
const NEUTRAL_UNIVERSAL_7: CetasikaCard[] = [
  { id: 'contact', pali: 'Phassa', thai: 'ผัสสะ', className: 'ContactMental', description: 'Contact – meeting of sense base and object', highlights: ['Occurs in every citta'] },
  { id: 'feeling', pali: 'Vedanā', thai: 'เวทนา', className: 'FeelingMental', description: 'Feeling – pleasant, unpleasant, or neutral', highlights: ['Occurs in every citta'] },
  { id: 'perception', pali: 'Saññā', thai: 'สัญญา', className: 'PerceptionMental', description: 'Perception – recognition and labeling', highlights: ['Occurs in every citta'] },
  { id: 'intention', pali: 'Cetanā', thai: 'เจตนา', className: 'IntentionMental', description: 'Intention – volition / will', highlights: ['Occurs in every citta'] },
  { id: 'concentration', pali: 'Ekaggatā', thai: 'เอกัคคตา', className: 'ConcentrationMental', description: 'Concentration – one-pointedness', highlights: ['Occurs in every citta'] },
  { id: 'life-faculty', pali: 'Jīvitindriya', thai: 'ชีวิตินทรีย์', className: 'LifeFacultyMental', description: 'Life faculty – vital factor', highlights: ['Occurs in every citta'] },
  { id: 'attention', pali: 'Manasikāra', thai: 'มนสิการ', className: 'AttentionMental', description: 'Attention – advertence to object', highlights: ['Occurs in every citta'] },
]

const NEUTRAL_OCCASIONAL_6: CetasikaCard[] = [
  { id: 'initial-application', pali: 'Vitakka', thai: 'วิตก', className: 'InitialApplicationMental', description: 'Initial application – directing thought', highlights: ['Pakiṇṇaka cetasika'] },
  { id: 'sustained-application', pali: 'Vicāra', thai: 'วิจาร', className: 'SustainedApplicationMental', description: 'Sustained application – sustaining thought', highlights: ['Pakiṇṇaka cetasika'] },
  { id: 'decision', pali: 'Adhimokkha', thai: 'อธิโมกข์', className: 'DeterminationMental', description: 'Decision – determination', highlights: ['Pakiṇṇaka cetasika'] },
  { id: 'energy', pali: 'Vīriya', thai: 'วิริยะ', className: 'EnergyMental', description: 'Energy – effort', highlights: ['Pakiṇṇaka cetasika'] },
  { id: 'rapture', pali: 'Pīti', thai: 'ปีติ', className: 'RaptureMental', description: 'Rapture – joy / zest', highlights: ['Pakiṇṇaka cetasika'] },
  { id: 'desire', pali: 'Chanda', thai: 'ฉันทะ', className: 'DesireMental', description: 'Desire – wish to act', highlights: ['Pakiṇṇaka cetasika'] },
]

/** 2. อกุศลเจตสิก (Bad Cetasika – 14) */
const BAD_MOHACATUKKA_4: CetasikaCard[] = [
  { id: 'delusion', pali: 'Moha', thai: 'โมหะ', className: 'DelusionMental', description: 'Delusion – confusion, ignorance', highlights: ['Root unwholesome'] },
  { id: 'shamelessness', pali: 'Ahirika', thai: 'อหิริกะ', className: 'ShamelessnessMental', description: 'Shamelessness – no moral shame', highlights: ['Universal unwholesome'] },
  { id: 'recklessness', pali: 'Anottappa', thai: 'อโนตตัปปะ', className: 'RecklessnessMental', description: 'Recklessness – no moral dread', highlights: ['Universal unwholesome'] },
  { id: 'restlessness', pali: 'Uddhacca', thai: 'อุทธัจจะ', className: 'RestlessnessMental', description: 'Restlessness – agitation', highlights: ['Universal unwholesome'] },
]

const BAD_LOBHACATUKKA_3: CetasikaCard[] = [
  { id: 'greed', pali: 'Lobha', thai: 'โลภะ', className: 'GreedMental', description: 'Greed – craving, attachment', highlights: ['Root unwholesome'] },
  { id: 'wrong-view', pali: 'Diṭṭhi', thai: 'ทิฏฐิ', className: 'WrongViewMental', description: 'Wrong view – distorted view', highlights: ['Greed-rooted'] },
  { id: 'conceit', pali: 'Māna', thai: 'มานะ', className: 'ConceitMental', description: 'Conceit – measuring self against others', highlights: ['Greed-rooted'] },
]

const BAD_DOSACATUKKA_4: CetasikaCard[] = [
  { id: 'hatred', pali: 'Dosa', thai: 'โทสะ', className: 'HatredMental', description: 'Hatred – aversion, anger', highlights: ['Root unwholesome'] },
  { id: 'envy', pali: 'Issā', thai: 'อิสสา', className: 'EnvyMental', description: 'Envy – jealousy', highlights: ['Hatred group'] },
  { id: 'stinginess', pali: 'Macchariya', thai: 'มัจฉริยะ', className: 'StinginessMental', description: 'Stinginess – avarice', highlights: ['Hatred group'] },
  { id: 'worry', pali: 'Kukkucca', thai: 'กุกกุจจะ', className: 'WorryMental', description: 'Worry – regret', highlights: ['Hatred group'] },
]

const BAD_THINAMIDDHA_2: CetasikaCard[] = [
  { id: 'sloth', pali: 'Thīna', thai: 'ถีนะ', className: 'SlothMental', description: 'Sloth – laziness', highlights: ['Sloth-torpor pair'] },
  { id: 'torpor', pali: 'Middha', thai: 'มิทธะ', className: 'TorporMental', description: 'Torpor – dullness', highlights: ['Sloth-torpor pair'] },
]

const BAD_VICIKICCHA_1: CetasikaCard[] = [
  { id: 'doubt', pali: 'Vicikicchā', thai: 'วิจิกิจฉา', className: 'DoubtMental', description: 'Doubt – indecision', highlights: ['Single factor'] },
]

/** 3. โสภณเจตสิก (Good Cetasika – 25) */
const GOOD_SOBHANASADHARANA_19: CetasikaCard[] = [
  { id: 'faith', pali: 'Saddhā', thai: 'สัทธา', className: 'FaithMental', description: 'Faith – confidence, trust', highlights: ['Beautiful universal'] },
  { id: 'mindfulness', pali: 'Sati', thai: 'สติ', className: 'MindfulnessMental', description: 'Mindfulness – awareness', highlights: ['Beautiful universal'] },
  { id: 'moral-shame', pali: 'Hiri', thai: 'หิริ', className: 'MoralShameMental', description: 'Moral shame – sense of shame', highlights: ['Beautiful universal'] },
  { id: 'moral-dread', pali: 'Ottappa', thai: 'โอตตัปปะ', className: 'MoralDreadMental', description: 'Moral dread – fear of blame', highlights: ['Beautiful universal'] },
  { id: 'non-greed', pali: 'Alobha', thai: 'อโลภะ', className: 'NonGreedMental', description: 'Non-greed – renunciation', highlights: ['Beautiful universal'] },
  { id: 'non-hatred', pali: 'Adosa', thai: 'อโทสะ', className: 'NonHatredMental', description: 'Non-hatred – goodwill', highlights: ['Beautiful universal'] },
  { id: 'equanimity', pali: 'Tatramajjhattatā', thai: 'ตัตตรมัชฌัตตตา', className: 'EquanimityMental', description: 'Equanimity – balance of mind', highlights: ['Beautiful universal'] },
  { id: 'tranquility-body', pali: 'Kāyapassaddhi', thai: 'กายปัสสัทธิ', className: 'TranquilityBodyMental', description: 'Tranquility of body', highlights: ['Body-mind pair'] },
  { id: 'tranquility-mind', pali: 'Cittapassaddhi', thai: 'จิตตปัสสัทธิ', className: 'TranquilityMindMental', description: 'Tranquility of mind', highlights: ['Body-mind pair'] },
  { id: 'lightness-body', pali: 'Kāyalahutā', thai: 'กายลหุตา', className: 'LightnessBodyMental', description: 'Lightness of body', highlights: ['Body-mind pair'] },
  { id: 'lightness-mind', pali: 'Cittalahutā', thai: 'จิตตลหุตา', className: 'LightnessMindMental', description: 'Lightness of mind', highlights: ['Body-mind pair'] },
  { id: 'wieldiness-body', pali: 'Kāyamudutā', thai: 'กายมุทุตา', className: 'WieldinessBodyMental', description: 'Wieldiness of body', highlights: ['Body-mind pair'] },
  { id: 'wieldiness-mind', pali: 'Cittamudutā', thai: 'จิตตมุทุตา', className: 'WieldinessMindMental', description: 'Wieldiness of mind', highlights: ['Body-mind pair'] },
  { id: 'proficiency-body', pali: 'Kāyakammaññatā', thai: 'กายกัมมัญญตา', className: 'ProficiencyBodyMental', description: 'Proficiency of body', highlights: ['Body-mind pair'] },
  { id: 'proficiency-mind', pali: 'Cittakammaññatā', thai: 'จิตตกัมมัญญตา', className: 'ProficiencyMindMental', description: 'Proficiency of mind', highlights: ['Body-mind pair'] },
  { id: 'pliancy-body', pali: 'Kāyapāguññatā', thai: 'กายปาคุญญตา', className: 'PliancyBodyMental', description: 'Pliancy of body', highlights: ['Body-mind pair'] },
  { id: 'pliancy-mind', pali: 'Cittapāguññatā', thai: 'จิตตปาคุญญตา', className: 'PliancyMindMental', description: 'Pliancy of mind', highlights: ['Body-mind pair'] },
  { id: 'rectitude-body', pali: 'Kāyujukatā', thai: 'กายุชุกตา', className: 'RectitudeBodyMental', description: 'Rectitude of body', highlights: ['Body-mind pair'] },
  { id: 'rectitude-mind', pali: 'Cittujukatā', thai: 'จิตตุชุกตา', className: 'RectitudeMindMental', description: 'Rectitude of mind', highlights: ['Body-mind pair'] },
]

const GOOD_VIRATI_3: CetasikaCard[] = [
  { id: 'right-speech', pali: 'Sammāvācā', thai: 'สัมมาวาจา', className: 'RightSpeechMental', description: 'Right speech – abstinence from wrong speech', highlights: ['Abstinence'] },
  { id: 'right-action', pali: 'Sammākammanta', thai: 'สัมมากัมมันตะ', className: 'RightActionMental', description: 'Right action – abstinence from wrong action', highlights: ['Abstinence'] },
  { id: 'right-livelihood', pali: 'Sammāājīva', thai: 'สัมมาอาชีวะ', className: 'RightLivelihoodMental', description: 'Right livelihood – abstinence from wrong livelihood', highlights: ['Abstinence'] },
]

const GOOD_APPAMANNA_2: CetasikaCard[] = [
  { id: 'compassion', pali: 'Karuṇā', thai: 'กรุณา', className: 'CompassionMental', description: 'Compassion – wish to remove others’ suffering', highlights: ['Illimitable'] },
  { id: 'appreciative-joy', pali: 'Muditā', thai: 'มุทิตา', className: 'AppreciativeJoyMental', description: 'Appreciative joy – gladness at others’ success', highlights: ['Illimitable'] },
]

const GOOD_PANNA_1: CetasikaCard[] = [
  { id: 'wisdom', pali: 'Paññā', thai: 'ปัญญา', className: 'WisdomMental', description: 'Wisdom – discernment, understanding', highlights: ['Single factor'] },
]

export const CETASIKA_CATEGORIES: CetasikaCategory[] = [
  {
    title: 'อัญญสมานเจตสิก',
    titleEn: 'Neutral Cetasika (13)',
    count: 13,
    items: [...NEUTRAL_UNIVERSAL_7, ...NEUTRAL_OCCASIONAL_6],
    subcategories: [
      { id: 'cetasikas-neutral-universal', title: 'สัพพจิตตสาธารณเจตสิก', titleEn: 'Universal (7). Occurs in every citta.', items: NEUTRAL_UNIVERSAL_7 },
      { id: 'cetasikas-neutral-pakinnaka', title: 'ปกิณณกเจตสิก', titleEn: 'Pakiṇṇaka (6)', items: NEUTRAL_OCCASIONAL_6 },
    ],
  },
  {
    title: 'อกุศลเจตสิก',
    titleEn: 'Bad Cetasika (14)',
    count: 14,
    items: [
      ...BAD_MOHACATUKKA_4,
      ...BAD_LOBHACATUKKA_3,
      ...BAD_DOSACATUKKA_4,
      ...BAD_THINAMIDDHA_2,
      ...BAD_VICIKICCHA_1,
    ],
    subcategories: [
      { id: 'cetasikas-bad-moha', title: 'โมหจตุกกะ', titleEn: 'Moha catukka (4)', items: BAD_MOHACATUKKA_4 },
      { id: 'cetasikas-bad-lobha', title: 'โลภจตุกกะ', titleEn: 'Lobha catukka (3)', items: BAD_LOBHACATUKKA_3 },
      { id: 'cetasikas-bad-dosa', title: 'โทจตุกกะ', titleEn: 'Dosa catukka (4)', items: BAD_DOSACATUKKA_4 },
      { id: 'cetasikas-bad-thinamiddha', title: 'ถีนมิทธะ', titleEn: 'Thīna-middha (2)', items: BAD_THINAMIDDHA_2 },
      { id: 'cetasikas-bad-vicikiccha', title: 'วิจิกิจฉา', titleEn: 'Vicikicchā (1)', items: BAD_VICIKICCHA_1 },
    ],
  },
  {
    title: 'โสภณเจตสิก',
    titleEn: 'Good Cetasika (25)',
    count: 25,
    items: [
      ...GOOD_SOBHANASADHARANA_19,
      ...GOOD_VIRATI_3,
      ...GOOD_APPAMANNA_2,
      ...GOOD_PANNA_1,
    ],
    subcategories: [
      { id: 'cetasikas-good-sobhana', title: 'โสภณสาธารณ', titleEn: 'Sobhana Sādhāraṇa (19)', items: GOOD_SOBHANASADHARANA_19 },
      { id: 'cetasikas-good-virati', title: 'วิรตี', titleEn: 'Virati (3)', items: GOOD_VIRATI_3 },
      { id: 'cetasikas-good-appamanna', title: 'อัปปมัญญา', titleEn: 'Appamaññā (2)', items: GOOD_APPAMANNA_2 },
      { id: 'cetasikas-good-panna', title: 'ปัญญา', titleEn: 'Paññā (1)', items: GOOD_PANNA_1 },
    ],
  },
]
