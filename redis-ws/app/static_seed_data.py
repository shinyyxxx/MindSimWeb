# ---------------------------------------------------------------------------
# id | name | pali | thai | slug (frontend route id) | category | description | characteristic | function | manifestation | proximate_cause
# ---------------------------------------------------------------------------

MENTALS_DATA = [
    # === Neutral — Universal (7) ===
    {'id': 1,  'name': 'Contact',               'pali': 'Phassa',          'thai': 'ผัสสะ',         'slug': 'contact',               'category': 'neutral', 'description': 'Contact - meeting of sense base and object',
     'characteristic': 'touching', 'function': 'impingement', 'manifestation': 'concurrence of consciousness, sense faculty, object', 'proximate_cause': 'objective field that has come into focus'},
    {'id': 2,  'name': 'Feeling',                'pali': 'Vedanā',         'thai': 'เวทนา',         'slug': 'feeling',               'category': 'neutral', 'description': 'Feeling - pleasant, unpleasant, or neutral',
     'characteristic': 'being felt', 'function': 'experiencing, enjoying desirable aspect of object', 'manifestation': 'relishing of associated mental states', 'proximate_cause': 'contact'},
    {'id': 3,  'name': 'Perception',             'pali': 'Saññā',          'thai': 'สัญญา',         'slug': 'perception',            'category': 'neutral', 'description': 'Perception - recognition and labeling',
     'characteristic': 'perceiving qualities of object', 'function': 'make a sign/recognizing previous perception', 'manifestation': 'interpreting the object', 'proximate_cause': 'the object as it appears'},
    {'id': 4,  'name': 'Intention',              'pali': 'Cetanā',         'thai': 'เจตนา',         'slug': 'intention',             'category': 'neutral', 'description': 'Intention - volition / will',
     'characteristic': 'state of willing', 'function': 'to accumulate kamma', 'manifestation': 'coordination', 'proximate_cause': 'associated states'},
    {'id': 5,  'name': 'Concentration',          'pali': 'Ekaggatā',       'thai': 'เอกัคคตา',       'slug': 'concentration',         'category': 'neutral', 'description': 'Concentration - one-pointedness',
     'characteristic': 'non-wandering, non-distraction', 'function': 'conglomerate associated states', 'manifestation': 'peace', 'proximate_cause': 'happiness'},
    {'id': 6,  'name': 'Life Faculty',           'pali': 'Jīvitindriya',   'thai': 'ชีวิตินทรีย์',    'slug': 'life-faculty',          'category': 'neutral', 'description': 'Life faculty - vital factor',
     'characteristic': 'maintaining associated mental states', 'function': 'making associated mental states occur', 'manifestation': 'establishing associated mental states presence', 'proximate_cause': 'mental state to be maintained'},
    {'id': 7,  'name': 'Attention',              'pali': 'Manasikāra',     'thai': 'มนสิการ',        'slug': 'attention',             'category': 'neutral', 'description': 'Attention - advertence to object',
     'characteristic': 'conduct associated mental states towards object', 'function': 'yoke associated mental states with object', 'manifestation': 'confrontation with object', 'proximate_cause': 'the object'},
    # === Neutral — Occasional / Pakiṇṇaka (6) ===
    {'id': 8,  'name': 'Initial Application',    'pali': 'Vitakka',        'thai': 'วิตก',           'slug': 'initial-application',   'category': 'neutral', 'description': 'Initial application - directing thought',
     'characteristic': 'directing mind to object', 'function': 'strike at object', 'manifestation': 'leading of mind onto object', 'proximate_cause': 'the object'},
    {'id': 9,  'name': 'Sustained Application',  'pali': 'Vicāra',         'thai': 'วิจาร',          'slug': 'sustained-application', 'category': 'neutral', 'description': 'Sustained application - sustaining thought',
     'characteristic': 'examining', 'function': 'sustained application of mental phenomena on object', 'manifestation': 'anchoring mental phenomena in the object', 'proximate_cause': 'the object'},
    {'id': 10, 'name': 'Determination',          'pali': 'Adhimokkha',     'thai': 'อธิโมกข์',       'slug': 'decision',              'category': 'neutral', 'description': 'Decision - determination',
     'characteristic': 'conviction', 'function': 'not groping', 'manifestation': 'decisiveness', 'proximate_cause': 'a thing to be convinced about'},
    {'id': 11, 'name': 'Energy',                 'pali': 'Vīriya',         'thai': 'วิริยะ',         'slug': 'energy',                'category': 'neutral', 'description': 'Energy - effort',
     'characteristic': 'supporting, exertion, marshalling', 'function': 'to support associated mental states', 'manifestation': 'non-collapse', 'proximate_cause': 'sense of urgency, ground for arousing energy'},
    {'id': 12, 'name': 'Rapture',                'pali': 'Pīti',           'thai': 'ปีติ',           'slug': 'rapture',               'category': 'neutral', 'description': 'Rapture - joy / zest',
     'characteristic': 'endearing', 'function': 'refresh mind and body', 'manifestation': 'to pervade (to thrill with rapture)', 'proximate_cause': 'elation'},
    {'id': 13, 'name': 'Desire',                 'pali': 'Chanda',         'thai': 'ฉันทะ',          'slug': 'desire',                'category': 'neutral', 'description': 'Desire - wish to act',
     'characteristic': 'desire to act', 'function': 'searching for an object', 'manifestation': 'need for an object', 'proximate_cause': 'the object'},
    # === Bad — Moha catukka (4) ===
    {'id': 14, 'name': 'Delusion',               'pali': 'Moha',           'thai': 'โมหะ',           'slug': 'delusion',              'category': 'bad',     'description': 'Delusion - confusion, ignorance',
     'characteristic': 'mental blindness, unknowing', 'function': 'non-penetration, concealment of real nature', 'manifestation': 'mental darkness, absence of right understanding', 'proximate_cause': 'unwise attention'},
    {'id': 15, 'name': 'Shamelessness',          'pali': 'Ahirika',        'thai': 'อหิริกะ',        'slug': 'shamelessness',         'category': 'bad',     'description': 'Shamelessness - no moral shame',
     'characteristic': 'absence of disgust at misconduct', 'function': 'doing evil', 'manifestation': 'not shrinking from evil', 'proximate_cause': 'lack of self-respect'},
    {'id': 16, 'name': 'Recklessness',           'pali': 'Anottappa',      'thai': 'อโนตตัปปะ',      'slug': 'recklessness',          'category': 'bad',     'description': 'Recklessness - no moral dread',
     'characteristic': 'absence of dread of misconduct', 'function': 'doing evil', 'manifestation': 'not shrinking from evil', 'proximate_cause': 'not having respect for others'},
    {'id': 17, 'name': 'Restlessness',           'pali': 'Uddhacca',       'thai': 'อุทธัจจะ',       'slug': 'restlessness',          'category': 'bad',     'description': 'Restlessness - agitation',
     'characteristic': 'disquietude', 'function': 'make mind unsteady', 'manifestation': 'turmoil', 'proximate_cause': 'unwise attention to mental disquiet'},
    # === Bad — Lobha catukka (3) ===
    {'id': 18, 'name': 'Greed',                  'pali': 'Lobha',          'thai': 'โลภะ',           'slug': 'greed',                 'category': 'bad',     'description': 'Greed - craving, attachment',
     'characteristic': 'grasping an object', 'function': 'sticking', 'manifestation': 'not giving up', 'proximate_cause': 'seeing enjoyment in things leading to bondage'},
    {'id': 19, 'name': 'Wrong View',             'pali': 'Diṭṭhi',        'thai': 'ทิฏฐิ',          'slug': 'wrong-view',            'category': 'bad',     'description': 'Wrong view - distorted view',
     'characteristic': 'unjustified interpretation of things', 'function': 'preassumption', 'manifestation': 'wrong interpretation or belief', 'proximate_cause': 'unwillingness to see Noble Ones'},
    {'id': 20, 'name': 'Conceit',                'pali': 'Māna',           'thai': 'มานะ',           'slug': 'conceit',               'category': 'bad',     'description': 'Conceit - measuring self against others',
     'characteristic': 'haughtiness', 'function': 'self-exaltation', 'manifestation': 'vainglory', 'proximate_cause': 'greed dissociated from views'},
    # === Bad — Dosa catukka (4) ===
    {'id': 21, 'name': 'Hatred',                 'pali': 'Dosa',           'thai': 'โทสะ',           'slug': 'hatred',                'category': 'bad',     'description': 'Hatred - aversion, anger',
     'characteristic': 'ferocity', 'function': 'spread or burn up own support', 'manifestation': 'persecuting', 'proximate_cause': 'ground for annoyance'},
    {'id': 22, 'name': 'Envy',                   'pali': 'Issā',           'thai': 'อิสสา',          'slug': 'envy',                  'category': 'bad',     'description': 'Envy - jealousy',
     'characteristic': "being jealous of others' success", 'function': "dissatisfaction with others' success", 'manifestation': "aversion towards others' success", 'proximate_cause': "others' success"},
    {'id': 23, 'name': 'Stinginess',             'pali': 'Macchariya',     'thai': 'มัจฉริยะ',       'slug': 'stinginess',            'category': 'bad',     'description': 'Stinginess - avarice',
     'characteristic': 'concealing own success', 'function': 'not bearing sharing own success', 'manifestation': 'shrinking away, meaning or sour feeling', 'proximate_cause': "one's own success"},
    {'id': 24, 'name': 'Worry',                  'pali': 'Kukkucca',       'thai': 'กุกกุจจะ',       'slug': 'worry',                 'category': 'bad',     'description': 'Worry - regret',
     'characteristic': 'regret at having done wrong', 'function': 'sorrow over what was or was not done', 'manifestation': 'remorse', 'proximate_cause': 'wrongs of commission and omission'},
    # === Bad — Thīna-middha (2) ===
    {'id': 25, 'name': 'Sloth',                  'pali': 'Thīna',          'thai': 'ถีนะ',           'slug': 'sloth',                 'category': 'bad',     'description': 'Sloth - laziness',
     'characteristic': 'lack of driving power', 'function': 'dispel energy', 'manifestation': 'sinking of mind', 'proximate_cause': 'unwise attention to boredom, drowsiness, etc.'},
    {'id': 26, 'name': 'Torpor',                 'pali': 'Middha',         'thai': 'มิทธะ',          'slug': 'torpor',                'category': 'bad',     'description': 'Torpor - dullness',
     'characteristic': 'unwieldiness', 'function': 'smother', 'manifestation': 'drooping, nodding, sleepiness', 'proximate_cause': 'unwise attention to boredom, drowsiness, etc.'},
    # === Bad — Vicikicchā (1) ===
    {'id': 27, 'name': 'Doubt',                  'pali': 'Vicikicchā',     'thai': 'วิจิกิจฉา',      'slug': 'doubt',                 'category': 'bad',     'description': 'Doubt - indecision',
     'characteristic': 'doubting', 'function': 'to waver', 'manifestation': 'indecisiveness, taking sides', 'proximate_cause': 'unwise attention'},
    # === Good — Sobhana Sādhāraṇa (19) ===
    {'id': 28, 'name': 'Faith',                  'pali': 'Saddhā',         'thai': 'สัทธา',          'slug': 'faith',                 'category': 'good',    'description': 'Faith - confidence, trust',
     'characteristic': 'placing of faith, trusting', 'function': 'to clarify or set forth', 'manifestation': 'non-fogginess, resolution', 'proximate_cause': 'something to place faith in'},
    {'id': 29, 'name': 'Mindfulness',            'pali': 'Sati',           'thai': 'สติ',            'slug': 'mindfulness',           'category': 'good',    'description': 'Mindfulness - awareness',
     'characteristic': 'not wobbling, not floating away', 'function': 'non-forgetfulness, absence of confusion', 'manifestation': 'guardianship, confronting an objective field', 'proximate_cause': 'strong perception, four foundations of mindfulness'},
    {'id': 30, 'name': 'Moral Shame',            'pali': 'Hiri',           'thai': 'หิริ',           'slug': 'moral-shame',           'category': 'good',    'description': 'Moral shame - sense of shame',
     'characteristic': 'disgust at misconduct', 'function': 'not doing evil', 'manifestation': 'shrinking away from evil', 'proximate_cause': 'respect for self'},
    {'id': 31, 'name': 'Moral Dread',            'pali': 'Ottappa',        'thai': 'โอตตัปปะ',       'slug': 'moral-dread',           'category': 'good',    'description': 'Moral dread - fear of blame',
     'characteristic': 'dread at misconduct', 'function': 'not doing evil', 'manifestation': 'shrinking away from evil', 'proximate_cause': 'respect for others'},
    {'id': 32, 'name': 'Non-greed',              'pali': 'Alobha',         'thai': 'อโลภะ',          'slug': 'non-greed',             'category': 'good',    'description': 'Non-greed - renunciation',
     'characteristic': 'lack of desire for an object', 'function': 'not lay hold of object', 'manifestation': 'detachment', 'proximate_cause': ''},
    {'id': 33, 'name': 'Non-hatred',             'pali': 'Adosa',          'thai': 'อโทสะ',          'slug': 'non-hatred',            'category': 'good',    'description': 'Non-hatred - goodwill',
     'characteristic': 'lack of ferocity, non-opposing', 'function': 'remove annoyance', 'manifestation': 'agreeableness', 'proximate_cause': 'seeing beings as lovable'},
    {'id': 34, 'name': 'Equanimity',             'pali': 'Tatramajjhattatā','thai': 'ตัตตรมัชฌัตตตา', 'slug': 'equanimity',            'category': 'good',    'description': 'Equanimity - balance of mind',
     'characteristic': 'conveying mind and mental states evenly', 'function': 'prevent deficiency and excess', 'manifestation': 'neutrality', 'proximate_cause': ''},
    {'id': 35, 'name': 'Tranquility (Body)',     'pali': 'Kāyapassaddhi',  'thai': 'กายปัสสัทธิ',    'slug': 'tranquility-body',      'category': 'good',    'description': 'Tranquility of body',
     'characteristic': 'quieting disturbances', 'function': 'crush disturbances', 'manifestation': 'peacefulness, coolness', 'proximate_cause': 'consciousness and mental states'},
    {'id': 36, 'name': 'Tranquility (Mind)',     'pali': 'Cittapassaddhi', 'thai': 'จิตตปัสสัทธิ',   'slug': 'tranquility-mind',      'category': 'good',    'description': 'Tranquility of mind',
     'characteristic': 'quieting disturbances', 'function': 'crush disturbances', 'manifestation': 'peacefulness, coolness', 'proximate_cause': 'consciousness and mental states'},
    {'id': 37, 'name': 'Lightness (Body)',       'pali': 'Kāyalahutā',    'thai': 'กายลหุตา',       'slug': 'lightness-body',        'category': 'good',    'description': 'Lightness of body',
     'characteristic': 'subsiding of heaviness', 'function': 'crush heaviness', 'manifestation': 'non-sluggishness', 'proximate_cause': 'consciousness and mental states'},
    {'id': 38, 'name': 'Lightness (Mind)',       'pali': 'Cittalahutā',   'thai': 'จิตตลหุตา',      'slug': 'lightness-mind',        'category': 'good',    'description': 'Lightness of mind',
     'characteristic': 'subsiding of heaviness', 'function': 'crush heaviness', 'manifestation': 'non-sluggishness', 'proximate_cause': 'consciousness and mental states'},
    {'id': 39, 'name': 'Wieldiness (Body)',      'pali': 'Kāyamudutā',    'thai': 'กายมุทุตา',      'slug': 'wieldiness-body',       'category': 'good',    'description': 'Wieldiness of body',
     'characteristic': 'subsiding of rigidity', 'function': 'crush rigidity', 'manifestation': 'non-resistance', 'proximate_cause': 'consciousness and mental states'},
    {'id': 40, 'name': 'Wieldiness (Mind)',      'pali': 'Cittamudutā',   'thai': 'จิตตมุทุตา',     'slug': 'wieldiness-mind',       'category': 'good',    'description': 'Wieldiness of mind',
     'characteristic': 'subsiding of rigidity', 'function': 'crush rigidity', 'manifestation': 'non-resistance', 'proximate_cause': 'consciousness and mental states'},
    {'id': 41, 'name': 'Proficiency (Body)',     'pali': 'Kāyakammaññatā','thai': 'กายกัมมัญญตา',   'slug': 'proficiency-body',      'category': 'good',    'description': 'Proficiency of body',
     'characteristic': 'subsiding of unwieldiness', 'function': 'crush unwieldiness', 'manifestation': 'success in making something an object', 'proximate_cause': 'consciousness and mental states'},
    {'id': 42, 'name': 'Proficiency (Mind)',     'pali': 'Cittakammaññatā','thai': 'จิตตกัมมัญญตา',  'slug': 'proficiency-mind',      'category': 'good',    'description': 'Proficiency of mind',
     'characteristic': 'subsiding of unwieldiness', 'function': 'crush unwieldiness', 'manifestation': 'success in making something an object', 'proximate_cause': 'consciousness and mental states'},
    {'id': 43, 'name': 'Pliancy (Body)',         'pali': 'Kāyapāguññatā', 'thai': 'กายปาคุญญตา',    'slug': 'pliancy-body',          'category': 'good',    'description': 'Pliancy of body',
     'characteristic': 'healthiness of consciousness and mental states', 'function': 'crush unhealthiness', 'manifestation': 'absence of disability', 'proximate_cause': 'consciousness and mental states'},
    {'id': 44, 'name': 'Pliancy (Mind)',         'pali': 'Cittapāguññatā','thai': 'จิตตปาคุญญตา',   'slug': 'pliancy-mind',          'category': 'good',    'description': 'Pliancy of mind',
     'characteristic': 'healthiness of consciousness and mental states', 'function': 'crush unhealthiness', 'manifestation': 'absence of disability', 'proximate_cause': 'consciousness and mental states'},
    {'id': 45, 'name': 'Rectitude (Body)',       'pali': 'Kāyujukatā',    'thai': 'กายุชุกตา',      'slug': 'rectitude-body',        'category': 'good',    'description': 'Rectitude of body',
     'characteristic': 'uprightness', 'function': 'crush tortuousness', 'manifestation': 'non-crookedness', 'proximate_cause': 'consciousness and mental states'},
    {'id': 46, 'name': 'Rectitude (Mind)',       'pali': 'Cittujukatā',   'thai': 'จิตตุชุกตา',     'slug': 'rectitude-mind',        'category': 'good',    'description': 'Rectitude of mind',
     'characteristic': 'uprightness', 'function': 'crush tortuousness', 'manifestation': 'non-crookedness', 'proximate_cause': 'consciousness and mental states'},
    # === Good — Virati (3) ===
    {'id': 47, 'name': 'Right Speech',           'pali': 'Sammāvācā',     'thai': 'สัมมาวาจา',      'slug': 'right-speech',          'category': 'good',    'description': 'Right speech - abstinence from wrong speech',
     'characteristic': 'non-transgression', 'function': 'shrink back from evil', 'manifestation': 'abstinence from evil', 'proximate_cause': 'faith, shame, fear of wrong-doing, etc.'},
    {'id': 48, 'name': 'Right Action',           'pali': 'Sammākammanta', 'thai': 'สัมมากัมมันตะ',   'slug': 'right-action',          'category': 'good',    'description': 'Right action - abstinence from wrong action',
     'characteristic': 'non-transgression', 'function': 'shrink back from evil', 'manifestation': 'abstinence from evil', 'proximate_cause': 'faith, shame, fear of wrong-doing, etc.'},
    {'id': 49, 'name': 'Right Livelihood',       'pali': 'Sammāājīva',    'thai': 'สัมมาอาชีวะ',    'slug': 'right-livelihood',      'category': 'good',    'description': 'Right livelihood - abstinence from wrong livelihood',
     'characteristic': 'non-transgression', 'function': 'shrink back from evil', 'manifestation': 'abstinence from evil', 'proximate_cause': 'faith, shame, fear of wrong-doing, etc.'},
    # === Good — Appamaññā (2) ===
    {'id': 50, 'name': 'Compassion',             'pali': 'Karuṇā',        'thai': 'กรุณา',          'slug': 'compassion',            'category': 'good',    'description': "Compassion - wish to remove others' suffering",
     'characteristic': 'promoting removal of suffering in others', 'function': "inability to bear others' suffering", 'manifestation': 'non-cruelty', 'proximate_cause': 'seeing helplessness in those suffering'},
    {'id': 51, 'name': 'Appreciative Joy',       'pali': 'Muditā',        'thai': 'มุทิตา',         'slug': 'appreciative-joy',      'category': 'good',    'description': "Appreciative joy - gladness at others' success",
     'characteristic': "gladness at others' success", 'function': "unenvious at others' success", 'manifestation': 'elimination of aversion', 'proximate_cause': 'seeing success of others'},
    # === Good — Paññā (1) ===
    {'id': 52, 'name': 'Wisdom',                 'pali': 'Paññā',          'thai': 'ปัญญา',          'slug': 'wisdom',                'category': 'good',    'description': 'Wisdom - discernment, understanding',
     'characteristic': 'penetrating intrinsic nature of things', 'function': 'illuminate objective field', 'manifestation': 'non-bewilderment', 'proximate_cause': 'wise attention'},
]

# ---------------------------------------------------------------------------
# MENTAL GROUPS  (cetasika subcategories — matching cetasikaGrid.ts)
# ---------------------------------------------------------------------------

MENTAL_GROUPS_DATA = [
    {'id': 1,  'name': 'Universal',        'name_thai': 'สัพพจิตตสาธารณเจตสิก',  'name_en': 'Universal (7)',        'mental_ids': [1, 2, 3, 4, 5, 6, 7], 'description':'Factors common to every state of consciousness'},
    {'id': 2,  'name': 'Pakinnaka',        'name_thai': 'ปกิณณกเจตสิก',  'name_en': 'Occasionals (6)',       'mental_ids': [8, 9, 10, 11, 12, 13], 'description':'Factors that arise only in particular types of consciousness'},
    {'id': 3,  'name': 'Moha catukka',     'name_thai': 'โมหจตุกกะ',  'name_en': 'Core Delusion (4)',     'mental_ids': [14, 15, 16, 17], 'description':'Basic factors found in every unwholesome state'},
    {'id': 4,  'name': 'Lobha catukka',    'name_thai': 'โลภจตุกกะ',  'name_en': 'Greed (3)',    'mental_ids': [18, 19, 20], 'description':'Factors related to attachment and ego'},
    {'id': 5,  'name': 'Dosa catukka',     'name_thai': 'โทจตุกกะ',  'name_en': 'Hatred (4)',     'mental_ids': [21, 22, 23, 24], 'description':'Factors related to aversion and resentment'},
    {'id': 6,  'name': 'Thina-middha',     'name_thai': 'ถีนมิทธะ',  'name_en': 'Sloth & Torpor (2)',     'mental_ids': [25, 26], 'description':'Factors of mental dullness and lack of energy'},
    {'id': 7,  'name': 'Vicikiccha',       'name_thai': 'วิจิกิจฉา',  'name_en': 'Doubt (1)',       'mental_ids': [27], 'description':'Skeptical doubt or indecisiveness'},
    {'id': 8,  'name': 'Sobhana Sadharana','name_thai': 'โสภณสาธารณ',  'name_en': 'Universal Beautiful (19)', 'mental_ids': list(range(28, 47)), 'description':'Positive qualities present in all beautiful consciousness'},
    {'id': 9,  'name': 'Virati',           'name_thai': 'วิรตี',  'name_en': 'Abstinences (3)',           'mental_ids': [47, 48, 49], 'description':'Factors of moral restraint from wrong speech, action, and livelihood'},
    {'id': 10, 'name': 'Appamanna',        'name_thai': 'อัปปมัญญา',  'name_en': 'Illimitables (2)',        'mental_ids': [50, 51], 'description':'Factors of Compassion and Sympathetic Joy directed toward all beings'},
    {'id': 11, 'name': 'Panna',            'name_thai': 'ปัญญา',  'name_en': 'Wisdom (1)',            'mental_ids': [52], 'description':'The faculty of understanding reality as it truly is'},
]

# ---------------------------------------------------------------------------
# Cetasika shorthand lists used to compose each citta's mental_ids
# ---------------------------------------------------------------------------

_UNIVERSAL_7 = [1, 2, 3, 4, 5, 6, 7]
_PAKINNAKA_ALL = [8, 9, 10, 11, 12, 13]
_MOHA_4 = [14, 15, 16, 17]
_LOBHA = [18]
_WRONG_VIEW = [19]
_CONCEIT = [20]
_DOSA = [21]
_ENVY = [22]
_STINGINESS = [23]
_WORRY = [24]
_SLOTH_TORPOR = [25, 26]
_DOUBT = [27]
_SOBHANA_19 = list(range(28, 47))
_VIRATI_3 = [47, 48, 49]
_APPAMANNA_2 = [50, 51]
_WISDOM = [52]

# Common cetasika combos
_AKUSALA_COMMON = _UNIVERSAL_7 + [8, 9, 10, 11, 13]   # 7 universal + vitakka, vicara, adhimokkha, viriya, chanda
_LOBHA_COMMON = _AKUSALA_COMMON + _MOHA_4 + _LOBHA     # 16 cetasikas
_DOSA_COMMON = _AKUSALA_COMMON + _MOHA_4 + _DOSA        # 16 cetasikas
_MOHA_COMMON = _UNIVERSAL_7 + [10, 11, 13] + _MOHA_4    # without vitakka/vicara for some

_AHETUKA_COMMON = _UNIVERSAL_7                           # only 7 universal for ahetuka
_KUSALA_COMMON = _UNIVERSAL_7 + [8, 9, 10, 11, 12, 13] + _SOBHANA_19  # 7+6+19 = 32
_KUSALA_COMMON_NO12 = _UNIVERSAL_7 + [8, 9, 10, 11, 13] + _SOBHANA_19
_KUSALA_COMMON_NO8 = _UNIVERSAL_7 + [9, 10, 11, 12, 13] + _SOBHANA_19
_KUSALA_COMMON_NO8_NO9 = _UNIVERSAL_7 + [10, 11, 12, 13] + _SOBHANA_19
_KUSALA_COMMON_NO8_NO9_NO12 = _UNIVERSAL_7 + [10, 11, 13] + _SOBHANA_19

# ---------------------------------------------------------------------------
# 89 CITTAS  (Mind)
# ---------------------------------------------------------------------------

MINDS_DATA = [
    # ===== AKUSALA CITTA (12) — IDs 1-12 =====
    # Lobha-rooted (8)
    {'id': 1,  'name': 'Lobha-diṭṭhi-somanassa-asaṅkhārika', 'name_en': 'Greed, wrong view, pleasure, unprompted',   'pali': 'Lobhamūlacitta 1',  'thai': 'โลภมูลจิต ดวงที่ 1',  'category': 'akusala', 'subgroup': 'lobhamula',
     'description': 'Greed-rooted with wrong view, pleasant feeling, unprompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความดีใจ ประกอบด้วยความเห็นผิด',
     'mental_ids': _LOBHA_COMMON + _WRONG_VIEW + [12]},
    {'id': 2,  'name': 'Lobha-diṭṭhi-somanassa-sasaṅkhārika', 'name_en': 'Greed, wrong view, pleasure, prompted',   'pali': 'Lobhamūlacitta 2',  'thai': 'โลภมูลจิต ดวงที่ 2',  'category': 'akusala', 'subgroup': 'lobhamula',
     'description': 'Greed-rooted with wrong view, pleasant feeling, prompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความดีใจ ประกอบด้วยความเห็นผิด',
     'mental_ids': _LOBHA_COMMON + _WRONG_VIEW + [12] + _SLOTH_TORPOR },
    {'id': 3,  'name': 'Lobha-diṭṭhi-upekkhā-asaṅkhārika', 'name_en': 'Greed, wrong view, equanimity, unprompted',      'pali': 'Lobhamūlacitta 3',  'thai': 'โลภมูลจิต ดวงที่ 3',  'category': 'akusala', 'subgroup': 'lobhamula',
     'description': 'Greed-rooted with wrong view, neutral feeling, unprompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความเฉยๆ ประกอบด้วยความเห็นผิด',
     'mental_ids': _LOBHA_COMMON + _CONCEIT + [12] },
    {'id': 4,  'name': 'Lobha-diṭṭhi-upekkhā-sasaṅkhārika', 'name_en': 'Greed, wrong view, equanimity, prompted',      'pali': 'Lobhamūlacitta 4',  'thai': 'โลภมูลจิต ดวงที่ 4',  'category': 'akusala', 'subgroup': 'lobhamula',
     'description': 'Greed-rooted with wrong view, neutral feeling, prompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความเฉยๆ ประกอบด้วยความเห็นผิด',
     'mental_ids': _LOBHA_COMMON + _CONCEIT + [12] + _SLOTH_TORPOR},
    {'id': 5,  'name': 'Lobha-māna-somanassa-asaṅkhārika', 'name_en': 'Greed, conceit, pleasure, unprompted',       'pali': 'Lobhamūlacitta 5',  'thai': 'โลภมูลจิต ดวงที่ 5',  'category': 'akusala', 'subgroup': 'lobhamula',
     'description': 'Greed-rooted with conceit, pleasant feeling, unprompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความดีใจ ไม่ประกอบด้วยความเห็นผิด',
     'mental_ids': _LOBHA_COMMON + _WRONG_VIEW},
    {'id': 6,  'name': 'Lobha-māna-somanassa-sasaṅkhārika', 'name_en': 'Greed, conceit, pleasure, prompted',       'pali': 'Lobhamūlacitta 6',  'thai': 'โลภมูลจิต ดวงที่ 6',  'category': 'akusala', 'subgroup': 'lobhamula',
     'description': 'Greed-rooted with conceit, pleasant feeling, prompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความดีใจ ไม่ประกอบด้วยความเห็นผิด',
     'mental_ids': _LOBHA_COMMON + _WRONG_VIEW  + _SLOTH_TORPOR},
    {'id': 7,  'name': 'Lobha-māna-upekkhā-asaṅkhārika', 'name_en': 'Greed, conceit, equanimity, unprompted',          'pali': 'Lobhamūlacitta 7',  'thai': 'โลภมูลจิต ดวงที่ 7',  'category': 'akusala', 'subgroup': 'lobhamula',
     'description': 'Greed-rooted with conceit, neutral feeling, unprompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความเฉยๆ ไม่ประกอบด้วยความเห็นผิด',
     'mental_ids': _LOBHA_COMMON + _CONCEIT},
    {'id': 8,  'name': 'Lobha-māna-upekkhā-sasaṅkhārika', 'name_en': 'Greed, conceit, equanimity, prompted',          'pali': 'Lobhamūlacitta 8',  'thai': 'โลภมูลจิต ดวงที่ 8',  'category': 'akusala', 'subgroup': 'lobhamula',
     'description': 'Greed-rooted with conceit, neutral feeling, prompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความเฉยๆ ไม่ประกอบด้วยความเห็นผิด',
     'mental_ids': _LOBHA_COMMON + _CONCEIT + _SLOTH_TORPOR},
    # Dosa-rooted (2)
    {'id': 9,  'name': 'Dosa-paṭigha-domanassa-asaṅkhārika', 'name_en': 'Hatred, aversion, displeasure, unprompted',     'pali': 'Dosamūlacitta 1',   'thai': 'โทสมูลจิต ดวงที่ 1',  'category': 'akusala', 'subgroup': 'dosamula',
     'description': 'Hatred-rooted with aversion, displeasure, unprompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความเสียใจ ประกอบด้วยความโกรธ',
     'mental_ids': _DOSA_COMMON + _ENVY + _STINGINESS + _WORRY},
    {'id': 10, 'name': 'Dosa-paṭigha-domanassa-sasaṅkhārika', 'name_en': 'Hatred, aversion, displeasure, prompted',     'pali': 'Dosamūlacitta 2',   'thai': 'โทสมูลจิต ดวงที่ 2',  'category': 'akusala', 'subgroup': 'dosamula',
     'description': 'Hatred-rooted with aversion, displeasure, prompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความเสียใจ ประกอบด้วยความโกรธ',
     'mental_ids': _DOSA_COMMON + _ENVY + _STINGINESS + _WORRY + _SLOTH_TORPOR},
    # Moha-rooted (2)
    {'id': 11, 'name': 'Moha-vicikicchā-upekkhā', 'name_en': 'Delusion with doubt, equanimity',                 'pali': 'Mohamūlacitta 1',   'thai': 'โมหมูลจิต ดวงที่ 1',  'category': 'akusala', 'subgroup': 'mohamula',
     'description': 'Delusion-rooted with doubt, neutral feeling',
     'description_thai': 'จิตที่เกิดขึ้นพร้อมด้วยความเฉยๆ ประกอบด้วยความสงสัย',
     'mental_ids': _UNIVERSAL_7 + [8, 9, 11] + _MOHA_4 + [23]},
    {'id': 12, 'name': 'Moha-uddhacca-upekkhā', 'name_en': 'Delusion with restlessness, equanimity',                   'pali': 'Mohamūlacitta 2',   'thai': 'โมหมูลจิต ดวงที่ 2',  'category': 'akusala', 'subgroup': 'mohamula',
     'description': 'Delusion-rooted with restlessness, neutral feeling',
     'description_thai': 'จิตที่เกิดขึ้นพร้อมด้วยความเฉยๆ ประกอบด้วยความฟุ้งซ่าน',
     'mental_ids': _UNIVERSAL_7 + [8, 9, 10, 11] + _MOHA_4},

    # ===== AHETUKA CITTA (18) — IDs 13-30 ===== #pao
    # Akusala vipaka (7)
    {'id': 13, 'name': 'Cakkhu-viññāṇa (akusala vipāka)', 'name_en': 'Eye-consciousness ',  'pali': 'Akusalavipākacitta 1',  'thai': 'จักขุวิญญาณ (อกุศลวิบาก)',   'category': 'ahetuka', 'subgroup': 'akusala_vipaka',
     'description': 'Eye-consciousness — bare seeing of undesirable object, result of unwholesome kamma',
     'description_thai': 'จิตที่อาศัยจักขุวัตถุ เห็นรูปารมณ์ที่ไม่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7},
    {'id': 14, 'name': 'Sota-viññāṇa (akusala vipāka)', 'name_en': 'Ear-consciousness ',    'pali': 'Akusalavipākacitta 2',  'thai': 'โสตวิญญาณ (อกุศลวิบาก)',     'category': 'ahetuka', 'subgroup': 'akusala_vipaka',
     'description': 'Ear-consciousness — bare hearing of undesirable sound, result of unwholesome kamma',
     'description_thai': 'จิตที่อาศัยโสตวัตถุ ได้ยินเสียงที่ไม่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7},
    {'id': 15, 'name': 'Ghāna-viññāṇa (akusala vipāka)', 'name_en': 'Nose-consciousness ',   'pali': 'Akusalavipākacitta 3',  'thai': 'ฆานวิญญาณ (อกุศลวิบาก)',     'category': 'ahetuka', 'subgroup': 'akusala_vipaka',
     'description': 'Nose-consciousness — bare smelling of undesirable odour, result of unwholesome kamma',
     'description_thai': 'จิตที่อาศัยฆานวัตถุ รู้กลิ่นที่ไม่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7},
    {'id': 16, 'name': 'Jivhā-viññāṇa (akusala vipāka)', 'name_en': 'Tongue-consciousness ',   'pali': 'Akusalavipākacitta 4',  'thai': 'ชิวหาวิญญาณ (อกุศลวิบาก)',   'category': 'ahetuka', 'subgroup': 'akusala_vipaka',
     'description': 'Tongue-consciousness — bare tasting of undesirable flavour, result of unwholesome kamma',
     'description_thai': 'จิตที่อาศัยชิวหาวัตถุ รู้รสที่ไม่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7},
    {'id': 17, 'name': 'Kāya-viññāṇa (akusala vipāka)', 'name_en': 'Body-consciousness ',    'pali': 'Akusalavipākacitta 5',  'thai': 'กายวิญญาณ (อกุศลวิบาก)',     'category': 'ahetuka', 'subgroup': 'akusala_vipaka',
     'description': 'Body-consciousness — bare touching of undesirable tangible (painful), result of unwholesome kamma',
     'description_thai': 'จิตที่อาศัยกายวัตถุ รู้สึกโผฏฐัพพารมณ์ที่ไม่ดี เกิดขึ้นพร้อมด้วยความทุกข์กาย',
     'mental_ids': _UNIVERSAL_7},
    {'id': 18, 'name': 'Sampaṭicchana (akusala vipāka)', 'name_en': 'Receiving consciousness ',    'pali': 'Akusalavipākacitta 6',  'thai': 'สัมปฏิจฉนะ (อกุศลวิบาก)',    'category': 'ahetuka', 'subgroup': 'akusala_vipaka',
     'description': 'Receiving consciousness — receives the sense object after sense-door cognition, result of unwholesome kamma',
     'description_thai': 'จิตที่รับปัญจารมณ์ที่ไม่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7 + [8, 9, 10]},
    {'id': 19, 'name': 'Santīraṇa (akusala vipāka)', 'name_en': 'Investigating consciousness ',       'pali': 'Akusalavipākacitta 7',  'thai': 'สันตีรณะ (อกุศลวิบาก)',      'category': 'ahetuka', 'subgroup': 'akusala_vipaka',
     'description': 'Investigating consciousness — examines the object with neutral feeling, result of unwholesome kamma',
     'description_thai': 'จิตที่ไต่สวนปัญจารมณ์ที่ไม่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7 + [8, 9, 10]},
    # Kusala vipaka ahetuka (8) #pao
    {'id': 20, 'name': 'Cakkhu-viññāṇa (kusala vipāka)', 'name_en': 'Eye-consciousness ',   'pali': 'Kusalavipākacitta 1',   'thai': 'จักขุวิญญาณ (กุศลวิบาก)',    'category': 'ahetuka', 'subgroup': 'ahetuka_kusala_vipaka',
     'description': 'Eye-consciousness — bare seeing of desirable object, result of wholesome kamma',
     'description_thai': 'จิตที่อาศัยจักขุวัตถุ เห็นรูปารมณ์ที่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7},
    {'id': 21, 'name': 'Sota-viññāṇa (kusala vipāka)', 'name_en': 'Ear-consciousness ',     'pali': 'Kusalavipākacitta 2',   'thai': 'โสตวิญญาณ (กุศลวิบาก)',      'category': 'ahetuka', 'subgroup': 'ahetuka_kusala_vipaka',
     'description': 'Ear-consciousness — bare hearing of desirable sound, result of wholesome kamma',
     'description_thai': 'จิตที่อาศัยโสตวัตถุ ได้ยินเสียงที่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7},
    {'id': 22, 'name': 'Ghāna-viññāṇa (kusala vipāka)', 'name_en': 'Nose-consciousness ',    'pali': 'Kusalavipākacitta 3',   'thai': 'ฆานวิญญาณ (กุศลวิบาก)',      'category': 'ahetuka', 'subgroup': 'ahetuka_kusala_vipaka',
     'description': 'Nose-consciousness — bare smelling of desirable odour, result of wholesome kamma',
     'description_thai': 'จิตที่อาศัยฆานวัตถุ รู้กลิ่นที่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7},
    {'id': 23, 'name': 'Jivhā-viññāṇa (kusala vipāka)', 'name_en': 'Tongue-consciousness ',    'pali': 'Kusalavipākacitta 4',   'thai': 'ชิวหาวิญญาณ (กุศลวิบาก)',    'category': 'ahetuka', 'subgroup': 'ahetuka_kusala_vipaka',
     'description': 'Tongue-consciousness — bare tasting of desirable flavour, result of wholesome kamma',
     'description_thai': 'จิตที่อาศัยชิวหาวัตถุ รู้รสที่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7},
    {'id': 24, 'name': 'Kāya-viññāṇa (kusala vipāka)', 'name_en': 'Body-consciousness ',     'pali': 'Kusalavipākacitta 5',   'thai': 'กายวิญญาณ (กุศลวิบาก)',      'category': 'ahetuka', 'subgroup': 'ahetuka_kusala_vipaka',
     'description': 'Body-consciousness — bare touching of desirable tangible (pleasant), result of wholesome kamma',
     'description_thai': 'จิตที่อาศัยกายวัตถุ รู้สึกโผฏฐัพพารมณ์ที่ดี เกิดขึ้นพร้อมด้วยความสุขกาย',
     'mental_ids': _UNIVERSAL_7},
    {'id': 25, 'name': 'Sampaṭicchana (kusala vipāka)', 'name_en': 'Receiving consciousness ',     'pali': 'Kusalavipākacitta 6',   'thai': 'สัมปฏิจฉนะ (กุศลวิบาก)',     'category': 'ahetuka', 'subgroup': 'ahetuka_kusala_vipaka',
     'description': 'Receiving consciousness — receives the sense object after sense-door cognition, result of wholesome kamma',
     'description_thai': 'จิตที่รับปัญจารมณ์ที่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7 + [8, 9, 10]},
    {'id': 26, 'name': 'Santīraṇa-upekkhā (kusala vipāka)', 'name_en': 'Investigating consciousness, equanimity ','pali': 'Kusalavipākacitta 7',   'thai': 'สันตีรณะ อุเบกขา (กุศลวิบาก)','category': 'ahetuka', 'subgroup': 'ahetuka_kusala_vipaka',
     'description': 'Investigating consciousness with neutral feeling, result of wholesome kamma',
     'description_thai': 'จิตที่ไต่สวนปัญจารมณ์ที่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7 + [8, 9, 10]},
    {'id': 27, 'name': 'Santīraṇa-somanassa (kusala vipāka)', 'name_en': 'Investigating consciousness, pleasure ','pali': 'Kusalavipākacitta 8', 'thai': 'สันตีรณะ โสมนัส (กุศลวิบาก)', 'category': 'ahetuka', 'subgroup': 'ahetuka_kusala_vipaka',
     'description': 'Investigating consciousness with pleasant feeling, result of wholesome kamma — for strong pleasant objects',
     'description_thai': 'จิตที่ไต่สวนปัญจารมณ์ที่ดี เกิดขึ้นพร้อมด้วยความดีใจ',
     'mental_ids': _UNIVERSAL_7 + [8, 9, 10, 12]},
    # Ahetuka kiriya (3) #pao
    {'id': 28, 'name': 'Pañcadvārāvajjana', 'name_en': 'Five-door adverting consciousness',                'pali': 'Ahetukakiriyacitta 1',  'thai': 'ปัญจทวาราวัชชนะ',            'category': 'ahetuka', 'subgroup': 'ahetuka_kiriya',
     'description': 'Five-door adverting — turns attention to an object arriving at any of the five sense doors',
     'description_thai': 'จิตที่พิจารณาอารมณ์ทางปัญจทวาร ที่ดีและไม่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7 + [8, 9, 10]},
    {'id': 29, 'name': 'Manodvārāvajjana', 'name_en': 'Mind-door adverting consciousness',                 'pali': 'Ahetukakiriyacitta 2',  'thai': 'มโนทวาราวัชชนะ',             'category': 'ahetuka', 'subgroup': 'ahetuka_kiriya',
     'description': 'Mind-door adverting — turns attention to an object at the mind door; also serves as votthapana (determining)',
     'description_thai': 'จิตที่พิจารณาอารมณ์ทางมโนทวาร ที่ดีและไม่ดี เกิดขึ้นพร้อมด้วยความเฉยๆ',
     'mental_ids': _UNIVERSAL_7 + [8, 9, 10, 11]},
    {'id': 30, 'name': 'Hasituppāda', 'name_en': 'Smile-producing consciousness',                      'pali': 'Ahetukakiriyacitta 3',  'thai': 'หสิตุปปาทะ',                'category': 'ahetuka', 'subgroup': 'ahetuka_kiriya',
     'description': 'Smile-producing consciousness — exclusive to arahants, produces a gentle smile with pleasant feeling',
     'description_thai': 'จิตที่ทำให้เกิดการยิ้มของพระอรหันต์ เกิดขึ้นพร้อมด้วยความดีใจ',
     'mental_ids': _UNIVERSAL_7 + [8, 9, 10, 11, 12]},

    # ===== KĀMĀVACARA KUSALA (8) — IDs 31-38 ===== pao
    {'id': 31, 'name': 'Kusala somanassa ñāṇa asaṅkhārika', 'name_en': 'Sense-sphere wholesome, pleasure, with knowledge, unprompted',   'pali': 'Kāmāvacarakusalacitta 1', 'thai': 'กามาวจรกุศลจิต ดวงที่ 1', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kusala',
     'description': 'Wholesome with pleasant feeling, associated with knowledge, unprompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความดีใจ ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON + _VIRATI_3 + _APPAMANNA_2 + _WISDOM},
    {'id': 32, 'name': 'Kusala somanassa ñāṇa sasaṅkhārika', 'name_en': 'Sense-sphere wholesome, pleasure, with knowledge, prompted',   'pali': 'Kāmāvacarakusalacitta 2', 'thai': 'กามาวจรกุศลจิต ดวงที่ 2', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kusala',
     'description': 'Wholesome with pleasant feeling, associated with knowledge, prompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความดีใจ ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON + _VIRATI_3 + _APPAMANNA_2 + _WISDOM},
    {'id': 33, 'name': 'Kusala somanassa aññāṇa asaṅkhārika', 'name_en': 'Sense-sphere wholesome, pleasure, without knowledge, unprompted',  'pali': 'Kāmāvacarakusalacitta 3', 'thai': 'กามาวจรกุศลจิต ดวงที่ 3', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kusala',
     'description': 'Wholesome with pleasant feeling, without knowledge, unprompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความดีใจ ไม่ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON + _VIRATI_3 + _APPAMANNA_2},
    {'id': 34, 'name': 'Kusala somanassa aññāṇa sasaṅkhārika', 'name_en': 'Sense-sphere wholesome, pleasure, without knowledge, prompted',  'pali': 'Kāmāvacarakusalacitta 4', 'thai': 'กามาวจรกุศลจิต ดวงที่ 4', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kusala',
     'description': 'Wholesome with pleasant feeling, without knowledge, prompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความดีใจ ไม่ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON + _VIRATI_3 + _APPAMANNA_2},
    {'id': 35, 'name': 'Kusala upekkhā ñāṇa asaṅkhārika', 'name_en': 'Sense-sphere wholesome, equanimity, with knowledge, unprompted',      'pali': 'Kāmāvacarakusalacitta 5', 'thai': 'กามาวจรกุศลจิต ดวงที่ 5', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kusala',
     'description': 'Wholesome with neutral feeling, associated with knowledge, unprompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความเฉยๆ ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON_NO12 + _VIRATI_3 + _APPAMANNA_2 + _WISDOM},
    {'id': 36, 'name': 'Kusala upekkhā ñāṇa sasaṅkhārika', 'name_en': 'Sense-sphere wholesome, equanimity, with knowledge, prompted',      'pali': 'Kāmāvacarakusalacitta 6', 'thai': 'กามาวจรกุศลจิต ดวงที่ 6', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kusala',
     'description': 'Wholesome with neutral feeling, associated with knowledge, prompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความเฉยๆ ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON_NO12 + _VIRATI_3 + _APPAMANNA_2 + _WISDOM},
    {'id': 37, 'name': 'Kusala upekkhā aññāṇa asaṅkhārika', 'name_en': 'Sense-sphere wholesome, equanimity, without knowledge, unprompted',     'pali': 'Kāmāvacarakusalacitta 7', 'thai': 'กามาวจรกุศลจิต ดวงที่ 7', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kusala',
     'description': 'Wholesome with neutral feeling, without knowledge, unprompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความเฉยๆ ไม่ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON_NO12 + _VIRATI_3 + _APPAMANNA_2},
    {'id': 38, 'name': 'Kusala upekkhā aññāṇa sasaṅkhārika', 'name_en': 'Sense-sphere wholesome, equanimity, without knowledge, prompted',     'pali': 'Kāmāvacarakusalacitta 8', 'thai': 'กามาวจรกุศลจิต ดวงที่ 8', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kusala',
     'description': 'Wholesome with neutral feeling, without knowledge, prompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความเฉยๆ ไม่ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON_NO12 + _VIRATI_3 + _APPAMANNA_2},

    # ===== KĀMĀVACARA VIPĀKA (sahetuka) (8) — IDs 39-46 ===== 39/  40/  41/  42/ 43/ 44/ 45/ 46
    {'id': 39, 'name': 'Vipāka somanassa ñāṇa asaṅkhārika', 'name_en': 'Sense-sphere resultant, pleasure, with knowledge, unprompted',   'pali': 'Kāmāvacaravipākacitta 1', 'thai': 'กามาวจรวิบากจิต ดวงที่ 1', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_vipaka',
     'description': 'Resultant with pleasant feeling, associated with knowledge, unprompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความดีใจ ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON + _WISDOM},
    {'id': 40, 'name': 'Vipāka somanassa ñāṇa sasaṅkhārika', 'name_en': 'Sense-sphere resultant, pleasure, with knowledge, prompted',   'pali': 'Kāmāvacaravipākacitta 2', 'thai': 'กามาวจรวิบากจิต ดวงที่ 2', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_vipaka',
     'description': 'Resultant with pleasant feeling, associated with knowledge, prompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความดีใจ ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON + _WISDOM},
    {'id': 41, 'name': 'Vipāka somanassa aññāṇa asaṅkhārika', 'name_en': 'Sense-sphere resultant, pleasure, without knowledge, unprompted',  'pali': 'Kāmāvacaravipākacitta 3', 'thai': 'กามาวจรวิบากจิต ดวงที่ 3', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_vipaka',
     'description': 'Resultant with pleasant feeling, without knowledge, unprompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความดีใจ ไม่ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON},
    {'id': 42, 'name': 'Vipāka somanassa aññāṇa sasaṅkhārika', 'name_en': 'Sense-sphere resultant, pleasure, without knowledge, prompted',  'pali': 'Kāmāvacaravipākacitta 4', 'thai': 'กามาวจรวิบากจิต ดวงที่ 4', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_vipaka',
     'description': 'Resultant with pleasant feeling, without knowledge, prompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความดีใจ ไม่ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON},
    {'id': 43, 'name': 'Vipāka upekkhā ñāṇa asaṅkhārika', 'name_en': 'Sense-sphere resultant, equanimity, with knowledge, unprompted',      'pali': 'Kāmāvacaravipākacitta 5', 'thai': 'กามาวจรวิบากจิต ดวงที่ 5', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_vipaka',
     'description': 'Resultant with neutral feeling, associated with knowledge, unprompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความเฉยๆ ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON_NO12 + _WISDOM},
    {'id': 44, 'name': 'Vipāka upekkhā ñāṇa sasaṅkhārika', 'name_en': 'Sense-sphere resultant, equanimity, with knowledge, prompted',      'pali': 'Kāmāvacaravipākacitta 6', 'thai': 'กามาวจรวิบากจิต ดวงที่ 6', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_vipaka',
     'description': 'Resultant with neutral feeling, associated with knowledge, prompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความเฉยๆ ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON_NO12 + _WISDOM},
    {'id': 45, 'name': 'Vipāka upekkhā aññāṇa asaṅkhārika', 'name_en': 'Sense-sphere resultant, equanimity, without knowledge, unprompted',     'pali': 'Kāmāvacaravipākacitta 7', 'thai': 'กามาวจรวิบากจิต ดวงที่ 7', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_vipaka',
     'description': 'Resultant with neutral feeling, without knowledge, unprompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความเฉยๆ ไม่ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON_NO12},
    {'id': 46, 'name': 'Vipāka upekkhā aññāṇa sasaṅkhārika', 'name_en': 'Sense-sphere resultant, equanimity, without knowledge, prompted',     'pali': 'Kāmāvacaravipākacitta 8', 'thai': 'กามาวจรวิบากจิต ดวงที่ 8', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_vipaka',
     'description': 'Resultant with neutral feeling, without knowledge, prompted',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความเฉยๆ ไม่ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON_NO12},

    # ===== KĀMĀVACARA KIRIYĀ (8) — IDs 47-54 =====  checked !!
    {'id': 47, 'name': 'Kiriyā somanassa ñāṇa asaṅkhārika', 'name_en': 'Sense-sphere functional, pleasure, with knowledge, unprompted',   'pali': 'Kāmāvacarakiriyācitta 1', 'thai': 'กามาวจรกิริยาจิต ดวงที่ 1', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kiriya',
     'description': 'Functional with pleasant feeling, associated with knowledge, unprompted — arahant only',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความดีใจ ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON + _APPAMANNA_2 + _WISDOM},
    {'id': 48, 'name': 'Kiriyā somanassa ñāṇa sasaṅkhārika', 'name_en': 'Sense-sphere functional, pleasure, with knowledge, prompted',   'pali': 'Kāmāvacarakiriyācitta 2', 'thai': 'กามาวจรกิริยาจิต ดวงที่ 2', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kiriya',
     'description': 'Functional with pleasant feeling, associated with knowledge, prompted — arahant only',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความดีใจ ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON + _APPAMANNA_2 + _WISDOM},
    {'id': 49, 'name': 'Kiriyā somanassa aññāṇa asaṅkhārika', 'name_en': 'Sense-sphere functional, pleasure, without knowledge, unprompted',  'pali': 'Kāmāvacarakiriyācitta 3', 'thai': 'กามาวจรกิริยาจิต ดวงที่ 3', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kiriya',
     'description': 'Functional with pleasant feeling, without knowledge, unprompted — arahant only',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความดีใจ ไม่ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON + _APPAMANNA_2},
    {'id': 50, 'name': 'Kiriyā somanassa aññāṇa sasaṅkhārika', 'name_en': 'Sense-sphere functional, pleasure, without knowledge, prompted',  'pali': 'Kāmāvacarakiriyācitta 4', 'thai': 'กามาวจรกิริยาจิต ดวงที่ 4', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kiriya',
     'description': 'Functional with pleasant feeling, without knowledge, prompted — arahant only',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความดีใจ ไม่ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON + _APPAMANNA_2},
    {'id': 51, 'name': 'Kiriyā upekkhā ñāṇa asaṅkhārika', 'name_en': 'Sense-sphere functional, equanimity, with knowledge, unprompted',      'pali': 'Kāmāvacarakiriyācitta 5', 'thai': 'กามาวจรกิริยาจิต ดวงที่ 5', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kiriya',
     'description': 'Functional with neutral feeling, associated with knowledge, unprompted — arahant only',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความเฉยๆ ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON_NO12 + _APPAMANNA_2 + _WISDOM},
    {'id': 52, 'name': 'Kiriyā upekkhā ñāṇa sasaṅkhārika', 'name_en': 'Sense-sphere functional, equanimity, with knowledge, prompted',      'pali': 'Kāmāvacarakiriyācitta 6', 'thai': 'กามาวจรกิริยาจิต ดวงที่ 6', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kiriya',
     'description': 'Functional with neutral feeling, associated with knowledge, prompted — arahant only',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความเฉยๆ ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON_NO12 + _APPAMANNA_2 + _WISDOM},
    {'id': 53, 'name': 'Kiriyā upekkhā aññāṇa asaṅkhārika', 'name_en': 'Sense-sphere functional, equanimity, without knowledge, unprompted',     'pali': 'Kāmāvacarakiriyācitta 7', 'thai': 'กามาวจรกิริยาจิต ดวงที่ 7', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kiriya',
     'description': 'Functional with neutral feeling, without knowledge, unprompted — arahant only',
     'description_thai': 'จิตที่เกิดขึ้นโดยไม่มีการชักชวน พร้อมด้วยความเฉยๆ ไม่ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON_NO12 + _APPAMANNA_2} ,
    {'id': 54, 'name': 'Kiriyā upekkhā aññāṇa sasaṅkhārika', 'name_en': 'Sense-sphere functional, equanimity, without knowledge, prompted',     'pali': 'Kāmāvacarakiriyācitta 8', 'thai': 'กามาวจรกิริยาจิต ดวงที่ 8', 'category': 'kamavacara_sobhana', 'subgroup': 'maha_kiriya',
     'description': 'Functional with neutral feeling, without knowledge, prompted — arahant only',
     'description_thai': 'จิตที่เกิดขึ้นโดยมีการชักชวน พร้อมด้วยความเฉยๆ ไม่ประกอบด้วยปัญญา',
     'mental_ids': _KUSALA_COMMON_NO12 + _APPAMANNA_2},

    # ===== RŪPĀVACARA (15) — IDs 55-69 ===== checked
    # Kusala (5)  checked
    {'id': 55, 'name': 'Rūpāvacara kusala 1st jhāna', 'name_en': 'Fine-material 1st jhana wholesome',  'pali': 'Rūpāvacarakusalacitta 1', 'thai': 'รูปาวจรกุศลจิต ปฐมฌาน',   'category': 'rupavacara', 'subgroup': 'rupavacara_kusala',
     'description': 'First jhana wholesome — with vitakka, vicara, piti, sukha, ekaggata',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๕ คือ วิตก วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON + _APPAMANNA_2 + _WISDOM},
    {'id': 56, 'name': 'Rūpāvacara kusala 2nd jhāna', 'name_en': 'Fine-material 2nd jhana wholesome',  'pali': 'Rūpāvacarakusalacitta 2', 'thai': 'รูปาวจรกุศลจิต ทุติยฌาน',  'category': 'rupavacara', 'subgroup': 'rupavacara_kusala',
     'description': 'Second jhana wholesome — with vicara, piti, sukha, ekaggata (no vitakka)',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๔ คือ วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8 + _APPAMANNA_2 + _WISDOM},
    {'id': 57, 'name': 'Rūpāvacara kusala 3rd jhāna', 'name_en': 'Fine-material 3rd jhana wholesome',  'pali': 'Rūpāvacarakusalacitta 3', 'thai': 'รูปาวจรกุศลจิต ตติยฌาน',   'category': 'rupavacara', 'subgroup': 'rupavacara_kusala',
     'description': 'Third jhana wholesome — with piti, sukha, ekaggata',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๓ คือ ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9 + _APPAMANNA_2 + _WISDOM},
    {'id': 58, 'name': 'Rūpāvacara kusala 4th jhāna', 'name_en': 'Fine-material 4th jhana wholesome',  'pali': 'Rūpāvacarakusalacitta 4', 'thai': 'รูปาวจรกุศลจิต จตุตถฌาน',  'category': 'rupavacara', 'subgroup': 'rupavacara_kusala',
     'description': 'Fourth jhana wholesome — with sukha, ekaggata',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _APPAMANNA_2 + _WISDOM},
    {'id': 59, 'name': 'Rūpāvacara kusala 5th jhāna', 'name_en': 'Fine-material 5th jhana wholesome',  'pali': 'Rūpāvacarakusalacitta 5', 'thai': 'รูปาวจรกุศลจิต ปัญจมฌาน',  'category': 'rupavacara', 'subgroup': 'rupavacara_kusala',
     'description': 'Fifth jhana wholesome — with upekkha, ekaggata',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},
    # Vipaka (5) checked
    {'id': 60, 'name': 'Rūpāvacara vipāka 1st jhāna', 'name_en': 'Fine-material 1st jhana resultant',  'pali': 'Rūpāvacaravipākacitta 1', 'thai': 'รูปาวจรวิบากจิต ปฐมฌาน',   'category': 'rupavacara', 'subgroup': 'rupavacara_vipaka',
     'description': 'First jhana resultant — rebirth consciousness in fine-material realm',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๕ คือ วิตก วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON + _APPAMANNA_2 + _WISDOM},
    {'id': 61, 'name': 'Rūpāvacara vipāka 2nd jhāna', 'name_en': 'Fine-material 2nd jhana resultant',  'pali': 'Rūpāvacaravipākacitta 2', 'thai': 'รูปาวจรวิบากจิต ทุติยฌาน',  'category': 'rupavacara', 'subgroup': 'rupavacara_vipaka',
     'description': 'Second jhana resultant — rebirth consciousness in fine-material realm',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๔ คือ วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8 + _APPAMANNA_2 + _WISDOM},
    {'id': 62, 'name': 'Rūpāvacara vipāka 3rd jhāna', 'name_en': 'Fine-material 3rd jhana resultant',  'pali': 'Rūpāvacaravipākacitta 3', 'thai': 'รูปาวจรวิบากจิต ตติยฌาน',   'category': 'rupavacara', 'subgroup': 'rupavacara_vipaka',
     'description': 'Third jhana resultant — rebirth consciousness in fine-material realm',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๓ คือ ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9 + _APPAMANNA_2 + _WISDOM},
    {'id': 63, 'name': 'Rūpāvacara vipāka 4th jhāna', 'name_en': 'Fine-material 4th jhana resultant',  'pali': 'Rūpāvacaravipākacitta 4', 'thai': 'รูปาวจรวิบากจิต จตุตถฌาน',  'category': 'rupavacara', 'subgroup': 'rupavacara_vipaka',
     'description': 'Fourth jhana resultant — rebirth consciousness in fine-material realm',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _APPAMANNA_2 + _WISDOM},
    {'id': 64, 'name': 'Rūpāvacara vipāka 5th jhāna', 'name_en': 'Fine-material 5th jhana resultant',  'pali': 'Rūpāvacaravipākacitta 5', 'thai': 'รูปาวจรวิบากจิต ปัญจมฌาน',  'category': 'rupavacara', 'subgroup': 'rupavacara_vipaka',
     'description': 'Fifth jhana resultant — rebirth consciousness in fine-material realm',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},
    # Kiriya (5) checked
    {'id': 65, 'name': 'Rūpāvacara kiriyā 1st jhāna', 'name_en': 'Fine-material 1st jhana functional',  'pali': 'Rūpāvacarakiriyācitta 1', 'thai': 'รูปาวจรกิริยาจิต ปฐมฌาน',   'category': 'rupavacara', 'subgroup': 'rupavacara_kiriya',
     'description': 'First jhana functional — arahant in first jhana absorption',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๕ คือ วิตก วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON + _APPAMANNA_2 + _WISDOM},
    {'id': 66, 'name': 'Rūpāvacara kiriyā 2nd jhāna', 'name_en': 'Fine-material 2nd jhana functional',  'pali': 'Rūpāvacarakiriyācitta 2', 'thai': 'รูปาวจรกิริยาจิต ทุติยฌาน',  'category': 'rupavacara', 'subgroup': 'rupavacara_kiriya',
     'description': 'Second jhana functional — arahant in second jhana absorption',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๔ คือ วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8 + _APPAMANNA_2 + _WISDOM},
    {'id': 67, 'name': 'Rūpāvacara kiriyā 3rd jhāna', 'name_en': 'Fine-material 3rd jhana functional',  'pali': 'Rūpāvacarakiriyācitta 3', 'thai': 'รูปาวจรกิริยาจิต ตติยฌาน',   'category': 'rupavacara', 'subgroup': 'rupavacara_kiriya',
     'description': 'Third jhana functional — arahant in third jhana absorption',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๓ คือ ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9 + _APPAMANNA_2 + _WISDOM},
    {'id': 68, 'name': 'Rūpāvacara kiriyā 4th jhāna', 'name_en': 'Fine-material 4th jhana functional',  'pali': 'Rūpāvacarakiriyācitta 4', 'thai': 'รูปาวจรกิริยาจิต จตุตถฌาน',  'category': 'rupavacara', 'subgroup': 'rupavacara_kiriya',
     'description': 'Fourth jhana functional — arahant in fourth jhana absorption',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _APPAMANNA_2 + _WISDOM},
    {'id': 69, 'name': 'Rūpāvacara kiriyā 5th jhāna', 'name_en': 'Fine-material 5th jhana functional',  'pali': 'Rūpāvacarakiriyācitta 5', 'thai': 'รูปาวจรกิริยาจิต ปัญจมฌาน',  'category': 'rupavacara', 'subgroup': 'rupavacara_kiriya',
     'description': 'Fifth jhana functional — arahant in fifth jhana absorption',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},

    # ===== ARŪPĀVACARA (12) — IDs 70-81 =====
    # Kusala (4)
    {'id': 70, 'name': 'Ākāsānañcāyatana kusala', 'name_en': 'Infinity of space wholesome',       'pali': 'Arūpāvacarakusalacitta 1', 'thai': 'อากาสานัญจายตนกุศลจิต',    'category': 'arupavacara', 'subgroup': 'arupavacara_kusala',
     'description': 'Infinity of space wholesome — mind transcends form and focuses on boundless space',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},
    {'id': 71, 'name': 'Viññāṇañcāyatana kusala', 'name_en': 'Infinity of consciousness wholesome',        'pali': 'Arūpāvacarakusalacitta 2', 'thai': 'วิญญาณัญจายตนกุศลจิต',     'category': 'arupavacara', 'subgroup': 'arupavacara_kusala',
     'description': 'Infinity of consciousness wholesome — focuses on the boundless consciousness of the previous attainment',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},
    {'id': 72, 'name': 'Ākiñcaññāyatana kusala', 'name_en': 'Nothingness wholesome',         'pali': 'Arūpāvacarakusalacitta 3', 'thai': 'อากิญจัญญายตนกุศลจิต',     'category': 'arupavacara', 'subgroup': 'arupavacara_kusala',
     'description': 'Nothingness wholesome — focuses on the absence of the preceding consciousness',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},
    {'id': 73, 'name': 'Nevasaññānāsaññāyatana kusala', 'name_en': 'Neither-perception-nor-non-perception wholesome',  'pali': 'Arūpāvacarakusalacitta 4', 'thai': 'เนวสัญญานาสัญญายตนกุศลจิต','category': 'arupavacara', 'subgroup': 'arupavacara_kusala',
     'description': 'Neither-perception-nor-non-perception wholesome — most refined formless attainment',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},
    # Vipaka (4)
    {'id': 74, 'name': 'Ākāsānañcāyatana vipāka', 'name_en': 'Infinity of space resultant',       'pali': 'Arūpāvacaravipākacitta 1', 'thai': 'อากาสานัญจายตนวิบากจิต',    'category': 'arupavacara', 'subgroup': 'arupavacara_vipaka',
     'description': 'Infinity of space resultant — rebirth consciousness in the formless realm of infinite space',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},
    {'id': 75, 'name': 'Viññāṇañcāyatana vipāka', 'name_en': 'Infinity of consciousness resultant',        'pali': 'Arūpāvacaravipākacitta 2', 'thai': 'วิญญาณัญจายตนวิบากจิต',     'category': 'arupavacara', 'subgroup': 'arupavacara_vipaka',
     'description': 'Infinity of consciousness resultant — rebirth consciousness in the formless realm of infinite consciousness',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},
    {'id': 76, 'name': 'Ākiñcaññāyatana vipāka', 'name_en': 'Nothingness resultant',         'pali': 'Arūpāvacaravipākacitta 3', 'thai': 'อากิญจัญญายตนวิบากจิต',     'category': 'arupavacara', 'subgroup': 'arupavacara_vipaka',
     'description': 'Nothingness resultant — rebirth consciousness in the formless realm of nothingness',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},
    {'id': 77, 'name': 'Nevasaññānāsaññāyatana vipāka', 'name_en': 'Neither-perception-nor-non-perception resultant',  'pali': 'Arūpāvacaravipākacitta 4', 'thai': 'เนวสัญญานาสัญญายตนวิบากจิต','category': 'arupavacara', 'subgroup': 'arupavacara_vipaka',
     'description': 'Neither-perception-nor-non-perception resultant — rebirth in the highest formless realm',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},
    # Kiriya (4)
    {'id': 78, 'name': 'Ākāsānañcāyatana kiriyā', 'name_en': 'Infinity of space functional',       'pali': 'Arūpāvacarakiriyācitta 1', 'thai': 'อากาสานัญจายตนกิริยาจิต',    'category': 'arupavacara', 'subgroup': 'arupavacara_kiriya',
     'description': 'Infinity of space functional — arahant in formless absorption of infinite space',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},
    {'id': 79, 'name': 'Viññāṇañcāyatana kiriyā', 'name_en': 'Infinity of consciousness functional',        'pali': 'Arūpāvacarakiriyācitta 2', 'thai': 'วิญญาณัญจายตนกิริยาจิต',     'category': 'arupavacara', 'subgroup': 'arupavacara_kiriya',
     'description': 'Infinity of consciousness functional — arahant in formless absorption of infinite consciousness',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},
    {'id': 80, 'name': 'Ākiñcaññāyatana kiriyā', 'name_en': 'Nothingness functional',         'pali': 'Arūpāvacarakiriyācitta 3', 'thai': 'อากิญจัญญายตนกิริยาจิต',     'category': 'arupavacara', 'subgroup': 'arupavacara_kiriya',
     'description': 'Nothingness functional — arahant in formless absorption of nothingness',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},
    {'id': 81, 'name': 'Nevasaññānāsaññāyatana kiriyā', 'name_en': 'Neither-perception-nor-non-perception functional',  'pali': 'Arūpāvacarakiriyācitta 4', 'thai': 'เนวสัญญานาสัญญายตนกิริยาจิต','category': 'arupavacara', 'subgroup': 'arupavacara_kiriya',
     'description': 'Neither-perception-nor-non-perception functional — arahant in the highest formless absorption',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๒ คือ อุเบกขา เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _WISDOM},

    # ===== LOKUTTARA (8) — IDs 82-89 =====
    {'id': 82, 'name': 'Sotāpatti-magga', 'name_en': 'Stream-entry path',    'pali': 'Lokuttaracitta 1', 'thai': 'โสดาปัตติมรรค',    'category': 'lokuttara', 'subgroup': 'magga',
     'description': 'Stream-entry path — eradicates wrong view and doubt, first glimpse of Nibbana',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๕ คือ วิตก วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON + _VIRATI_3 + _WISDOM},
    {'id': 83, 'name': 'Sotāpatti-phala', 'name_en': 'Stream-entry fruition',    'pali': 'Lokuttaracitta 2', 'thai': 'โสดาปัตติผล',      'category': 'lokuttara', 'subgroup': 'phala',
     'description': 'Stream-entry fruition — result of stream-entry path, experiences Nibbana',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๕ คือ วิตก วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8 + _VIRATI_3 + _WISDOM},
    {'id': 84, 'name': 'Sakadāgāmī-magga', 'name_en': 'Once-returner path',  'pali': 'Lokuttaracitta 3', 'thai': 'สกทาคามีมรรค',    'category': 'lokuttara', 'subgroup': 'magga',
     'description': 'Once-returner path — weakens sensual desire and ill-will',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๕ คือ วิตก วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9 + _VIRATI_3 + _WISDOM},
    {'id': 85, 'name': 'Sakadāgāmī-phala', 'name_en': 'Once-returner fruition',  'pali': 'Lokuttaracitta 4', 'thai': 'สกทาคามีผล',      'category': 'lokuttara', 'subgroup': 'phala',
     'description': 'Once-returner fruition — result of once-returner path',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๕ คือ วิตก วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _VIRATI_3 + _WISDOM},
    {'id': 86, 'name': 'Anāgāmī-magga', 'name_en': 'Non-returner path',     'pali': 'Lokuttaracitta 5', 'thai': 'อนาคามีมรรค',     'category': 'lokuttara', 'subgroup': 'magga',
     'description': 'Non-returner path — eradicates sensual desire and ill-will completely',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๕ คือ วิตก วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9_NO12 + _VIRATI_3 + _WISDOM},
    {'id': 87, 'name': 'Anāgāmī-phala', 'name_en': 'Non-returner fruition',     'pali': 'Lokuttaracitta 6', 'thai': 'อนาคามีผล',       'category': 'lokuttara', 'subgroup': 'phala',
     'description': 'Non-returner fruition — result of non-returner path',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๕ คือ วิตก วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON + _VIRATI_3 + _WISDOM},
    {'id': 88, 'name': 'Arahatta-magga', 'name_en': 'Arahant path',     'pali': 'Lokuttaracitta 7', 'thai': 'อรหัตตมรรค',      'category': 'lokuttara', 'subgroup': 'magga',
     'description': 'Arahant path — eradicates all remaining defilements (conceit, restlessness, ignorance)',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๕ คือ วิตก วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8 + _VIRATI_3 + _WISDOM},
    {'id': 89, 'name': 'Arahatta-phala', 'name_en': 'Arahant fruition',     'pali': 'Lokuttaracitta 8', 'thai': 'อรหัตตผล',        'category': 'lokuttara', 'subgroup': 'phala',
     'description': 'Arahant fruition — result of arahant path, full liberation',
     'description_thai': 'ที่เกิดพร้อมด้วยองค์ฌาน ๕ คือ วิตก วิจาร ปีติ สุข เอกัคคตา',
     'mental_ids': _KUSALA_COMMON_NO8_NO9 + _VIRATI_3 + _WISDOM},
]

# ---------------------------------------------------------------------------
# MIND GROUPS  (citta groupings)
# ---------------------------------------------------------------------------

MIND_GROUPS_DATA = [
    {'id': 1, 'name': 'Akusala',             'name_thai': 'อกุศลจิต',  'name_en': 'Unwholesome (12)',          'mind_ids': list(range(1, 13)), 'description': 'Consciousness rooted in greed, hatred, or delusion, which leads to suffering and unskilful actions'},
    {'id': 2, 'name': 'Ahetuka',             'name_thai': 'อเหตุกจิต',  'name_en': 'Rootless (18)',             'mind_ids': list(range(13, 31)), 'description': 'Consciousness that is not accompanied by any of the six wholesome or unwholesome roots; it primarily performs basic sensory and functional tasks'},
    {'id': 3, 'name': 'Kamavacara Sobhana',  'name_thai': 'กามาวจรโสภณจิต',  'name_en': 'Beautiful sense (24)',      'mind_ids': list(range(31, 55)), 'description': 'Wholesome and ethically sound consciousness'},
    {'id': 4, 'name': 'Rupavacara',          'name_thai': 'รูปาวจรจิต',  'name_en': 'Fine Material (15)',        'mind_ids': list(range(55, 70)), 'description': 'High-level meditative consciousness attained through deep concentration on a physical or conceptual object'},
    {'id': 5, 'name': 'Arupavacara',         'name_thai': 'อรูปาวจรจิต',  'name_en': 'Immaterial (12)',           'mind_ids': list(range(70, 82)), 'description': 'Extremely refined meditative consciousness that transcends all physical forms, focusing on purely abstract or formless objects'},
    {'id': 6, 'name': 'Lokuttara',           'name_thai': 'โลกุตตรจิต',  'name_en': 'Supramundane (8)',          'mind_ids': list(range(82, 90)), 'description': 'The highest form of consciousness that transcends the mundane world and is directed toward the realization of Nibbana'}
]

# ---------------------------------------------------------------------------
# RUPAS  (28 material phenomena / รูป ๒๘)
# id | name (thai) | name_en | pali | description | group | subgroup
# group: nipphanna (concretely produced 1-18) / anipphanna (non-concretely produced 19-28)
# ---------------------------------------------------------------------------

RUPAS_DATA = [
    # === Mahabhuta Rupa — Great Elements (4) ===
    {'id': 1,  'name': 'ดิน',       'name_en': 'Earth Element',          'pali': 'Pathavi',        'description': 'Element of hardness and softness; the principle of extension',                         'group': 'nipphanna', 'subgroup': 'mahabhuta'},
    {'id': 2,  'name': 'น้ำ',       'name_en': 'Water Element',          'pali': 'Apo',            'description': 'Element of fluidity and cohesion; the principle that binds material phenomena',        'group': 'nipphanna', 'subgroup': 'mahabhuta'},
    {'id': 3,  'name': 'ไฟ',       'name_en': 'Fire Element',           'pali': 'Tejo',           'description': 'Element of heat and cold; the principle of maturation and temperature',                'group': 'nipphanna', 'subgroup': 'mahabhuta'},
    {'id': 4,  'name': 'ลม',       'name_en': 'Wind Element',           'pali': 'Vayo',           'description': 'Element of motion and pressure; the principle of distension and support',              'group': 'nipphanna', 'subgroup': 'mahabhuta'},

    # === Pasada Rupa — Sensitivity (5) ===
    {'id': 5,  'name': 'ตา',       'name_en': 'Eye Sensitivity',        'pali': 'Cakkhu-pasada',  'description': 'Sensitive matter in the eye capable of receiving visible objects',                     'group': 'nipphanna', 'subgroup': 'pasada'},
    {'id': 6,  'name': 'หู',       'name_en': 'Ear Sensitivity',        'pali': 'Sota-pasada',    'description': 'Sensitive matter in the ear capable of receiving sound',                               'group': 'nipphanna', 'subgroup': 'pasada'},
    {'id': 7,  'name': 'จมูก',     'name_en': 'Nose Sensitivity',       'pali': 'Ghana-pasada',   'description': 'Sensitive matter in the nose capable of receiving odour',                              'group': 'nipphanna', 'subgroup': 'pasada'},
    {'id': 8,  'name': 'ลิ้น',     'name_en': 'Tongue Sensitivity',     'pali': 'Jivha-pasada',   'description': 'Sensitive matter in the tongue capable of receiving taste',                            'group': 'nipphanna', 'subgroup': 'pasada'},
    {'id': 9,  'name': 'กาย',      'name_en': 'Body Sensitivity',       'pali': 'Kaya-pasada',    'description': 'Sensitive matter throughout the body capable of receiving tangible objects',            'group': 'nipphanna', 'subgroup': 'pasada'},

    # === Visaya / Gocara Rupa — Sense-field (4) ===
    {'id': 10, 'name': 'สี',       'name_en': 'Colour',                 'pali': 'Vanna',          'description': 'Visible form; colour and shape that is the object of eye-consciousness',               'group': 'nipphanna', 'subgroup': 'visaya'},
    {'id': 11, 'name': 'เสียง',    'name_en': 'Sound',                  'pali': 'Sadda',          'description': 'Audible object arising from the collision of material phenomena',                      'group': 'nipphanna', 'subgroup': 'visaya'},
    {'id': 12, 'name': 'กลิ่น',    'name_en': 'Odour',                  'pali': 'Gandha',         'description': 'Olfactory object; smell arising from material phenomena',                              'group': 'nipphanna', 'subgroup': 'visaya'},
    {'id': 13, 'name': 'รส',       'name_en': 'Taste',                  'pali': 'Rasa',           'description': 'Gustatory object present in earth, water, and fire elements',                          'group': 'nipphanna', 'subgroup': 'visaya'},

    # === Bhava Rupa — Sex / Gender (2) ===
    {'id': 14, 'name': 'อิตถี',    'name_en': 'Femininity',             'pali': 'Itthibhava',     'description': 'Female sex; the material quality that manifests feminine characteristics',              'group': 'nipphanna', 'subgroup': 'bhava'},
    {'id': 15, 'name': 'ปุริส',    'name_en': 'Masculinity',            'pali': 'Purisabhava',    'description': 'Male sex; the material quality that manifests masculine characteristics',               'group': 'nipphanna', 'subgroup': 'bhava'},

    # === Hadaya Rupa — Heart-base (1) ===
    {'id': 16, 'name': 'หทัย',     'name_en': 'Heart-base',             'pali': 'Hadaya-vatthu',  'description': 'The material support for mind-element and mind-consciousness element',                  'group': 'nipphanna', 'subgroup': 'hadaya'},

    # === Jivita Rupa — Life Faculty (1) ===
    {'id': 17, 'name': 'ชีวิต',    'name_en': 'Life Faculty',           'pali': 'Jivitindriya',   'description': 'The material quality that maintains and protects co-nascent material phenomena',        'group': 'nipphanna', 'subgroup': 'jivita'},

    # === Ahara Rupa — Nutriment (1) ===
    {'id': 18, 'name': 'อาหาร',    'name_en': 'Nutritive Essence',      'pali': 'Oja',            'description': 'Nutritive essence present in all material groups; sustains material phenomena',         'group': 'nipphanna', 'subgroup': 'ahara'},

    # === Pariccheda Rupa — Delimiting (1) ===
    {'id': 19, 'name': 'อากาส',    'name_en': 'Space Element',          'pali': 'Akasa-dhatu',    'description': 'The element of space that delimits and separates material groups from one another',     'group': 'anipphanna', 'subgroup': 'pariccheda'},

    # === Vinatti Rupa — Intimation (2) ===
    {'id': 20, 'name': 'กายวิญญัติ', 'name_en': 'Bodily Intimation',   'pali': 'Kaya-vinnati',   'description': 'Bodily movement that communicates intention to others',                                'group': 'anipphanna', 'subgroup': 'vinatti'},
    {'id': 21, 'name': 'วจีวิญญัติ', 'name_en': 'Verbal Intimation',   'pali': 'Vaci-vinnati',   'description': 'Speech that communicates intention to others through vocal expression',                 'group': 'anipphanna', 'subgroup': 'vinatti'},

    # === Vikara Rupa — Mutability (3) ===
    {'id': 22, 'name': 'ลหุตา',    'name_en': 'Lightness',              'pali': 'Lahuta',         'description': 'Lightness of matter; the absence of heaviness or sluggishness in material phenomena',   'group': 'anipphanna', 'subgroup': 'vikara'},
    {'id': 23, 'name': 'มุทุตา',   'name_en': 'Softness',               'pali': 'Muduta',         'description': 'Malleability of matter; the absence of rigidity or stiffness in material phenomena',    'group': 'anipphanna', 'subgroup': 'vikara'},
    {'id': 24, 'name': 'กัมมัญญตา', 'name_en': 'Wieldiness',            'pali': 'Kammannata',     'description': 'Adaptability of matter; fitness of material phenomena for work or action',              'group': 'anipphanna', 'subgroup': 'vikara'},

    # === Lakkhana Rupa — Characteristics (4) ===
    {'id': 25, 'name': 'อุปจย',    'name_en': 'Growth',                 'pali': 'Upacaya',        'description': 'Initial arising and gradual growth of material phenomena',                              'group': 'anipphanna', 'subgroup': 'lakkhana'},
    {'id': 26, 'name': 'สันตติ',   'name_en': 'Continuity',             'pali': 'Santati',        'description': 'Continuous succession of material phenomena maintaining the flow of matter',             'group': 'anipphanna', 'subgroup': 'lakkhana'},
    {'id': 27, 'name': 'ชรตา',     'name_en': 'Decay',                  'pali': 'Jarata',         'description': 'Aging and maturing of material phenomena; the stage of decline',                        'group': 'anipphanna', 'subgroup': 'lakkhana'},
    {'id': 28, 'name': 'อนิจจตา',  'name_en': 'Impermanence',           'pali': 'Aniccata',       'description': 'Breaking up and dissolution of material phenomena; the final moment of matter',          'group': 'anipphanna', 'subgroup': 'lakkhana'},
]
