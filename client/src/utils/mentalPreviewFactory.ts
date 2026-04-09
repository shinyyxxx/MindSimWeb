import type Mental from '../mindwebsite/classes/Mental';
import type { MentalBaseOptions } from '../mindwebsite/classes/AbstractMental';
import ContactMental from '../mindwebsite/classes/neutral/ContactMental';
import FeelingMental from '../mindwebsite/classes/neutral/FeelingMental';
import PerceptionMental from '../mindwebsite/classes/neutral/PerceptionMental';
import IntentionMental from '../mindwebsite/classes/neutral/IntentionMental';
import ConcentrationMental from '../mindwebsite/classes/neutral/ConcentrationMental';
import LifeFacultyMental from '../mindwebsite/classes/neutral/LifeFacultyMental';
import AttentionMental from '../mindwebsite/classes/neutral/AttentionMental';
import InitialApplicationMental from '../mindwebsite/classes/neutral/InitialApplicationMental';
import SustainedApplicationMental from '../mindwebsite/classes/neutral/SustainedApplicationMental';
import DeterminationMental from '../mindwebsite/classes/neutral/DeterminationMental';
import EnergyMental from '../mindwebsite/classes/neutral/EnergyMental';
import RaptureMental from '../mindwebsite/classes/neutral/RaptureMental';
import DesireMental from '../mindwebsite/classes/neutral/DesireMental';
import GreedMental from '../mindwebsite/classes/bad/GreedMental';
import HatredMental from '../mindwebsite/classes/bad/HatredMental';
import DelusionMental from '../mindwebsite/classes/bad/DelusionMental';
import WrongViewMental from '../mindwebsite/classes/bad/WrongViewMental';
import ConceitMental from '../mindwebsite/classes/bad/ConceitMental';
import DoubtMental from '../mindwebsite/classes/bad/DoubtMental';
import RestlessnessMental from '../mindwebsite/classes/bad/RestlessnessMental';
import ShamelessnessMental from '../mindwebsite/classes/bad/ShamelessnessMental';
import RecklessnessMental from '../mindwebsite/classes/bad/RecklessnessMental';
import SlothMental from '../mindwebsite/classes/bad/SlothMental';
import TorporMental from '../mindwebsite/classes/bad/TorporMental';
import EnvyMental from '../mindwebsite/classes/bad/EnvyMental';
import StinginessMental from '../mindwebsite/classes/bad/StinginessMental';
import WorryMental from '../mindwebsite/classes/bad/WorryMental';
import FaithMental from '../mindwebsite/classes/good/FaithMental';
import MindfulnessMental from '../mindwebsite/classes/good/MindfulnessMental';
import MoralShameMental from '../mindwebsite/classes/good/MoralShameMental';
import MoralDreadMental from '../mindwebsite/classes/good/MoralDreadMental';
import NonGreedMental from '../mindwebsite/classes/good/NonGreedMental';
import NonHatredMental from '../mindwebsite/classes/good/NonHatredMental';
import EquanimityMental from '../mindwebsite/classes/good/EquanimityMental';
import TranquilityBodyMental from '../mindwebsite/classes/good/TranquilityBodyMental';
import TranquilityMindMental from '../mindwebsite/classes/good/TranquilityMindMental';
import LightnessBodyMental from '../mindwebsite/classes/good/LightnessBodyMental';
import LightnessMindMental from '../mindwebsite/classes/good/LightnessMindMental';
import PliancyBodyMental from '../mindwebsite/classes/good/PliancyBodyMental';
import PliancyMindMental from '../mindwebsite/classes/good/PliancyMindMental';
import WieldinessBodyMental from '../mindwebsite/classes/good/WieldinessBodyMental';
import WieldinessMindMental from '../mindwebsite/classes/good/WieldinessMindMental';
import ProficiencyBodyMental from '../mindwebsite/classes/good/ProficiencyBodyMental';
import ProficiencyMindMental from '../mindwebsite/classes/good/ProficiencyMindMental';
import RectitudeBodyMental from '../mindwebsite/classes/good/RectitudeBodyMental';
import RectitudeMindMental from '../mindwebsite/classes/good/RectitudeMindMental';
import RightSpeechMental from '../mindwebsite/classes/good/RightSpeechMental';
import RightActionMental from '../mindwebsite/classes/good/RightActionMental';
import RightLivelihoodMental from '../mindwebsite/classes/good/RightLivelihoodMental';
import CompassionMental from '../mindwebsite/classes/good/CompassionMental';
import AppreciativeJoyMental from '../mindwebsite/classes/good/AppreciativeJoyMental';
import WisdomMental from '../mindwebsite/classes/good/WisdomMental';
import type { CetasikaCard } from '../data/cetasikaGrid';
const defaultOpts = (card: CetasikaCard, hexColor: string): MentalBaseOptions => ({
    name: card.pali,
    detail: card.description,
    color: hexColor,
    scale: 0.45,
    position: [0, 0, 0],
    labelEnabled: false,
    motionSpeed: 0,
    opacity: 0.65,
});
export function createMentalForPreview(card: CetasikaCard, hexColor: string): Mental {
    const opts = defaultOpts(card, hexColor);
    const id = card.id;
    switch (id) {
        case 'contact': return new ContactMental(opts);
        case 'feeling': return new FeelingMental(opts);
        case 'perception': return new PerceptionMental(opts);
        case 'intention': return new IntentionMental(opts);
        case 'concentration': return new ConcentrationMental(opts);
        case 'life-faculty': return new LifeFacultyMental(opts);
        case 'attention': return new AttentionMental(opts);
        case 'initial-application': return new InitialApplicationMental(opts);
        case 'sustained-application': return new SustainedApplicationMental(opts);
        case 'decision': return new DeterminationMental(opts);
        case 'energy': return new EnergyMental(opts);
        case 'rapture': return new RaptureMental(opts);
        case 'desire': return new DesireMental(opts);
        case 'delusion': return new DelusionMental(opts);
        case 'shamelessness': return new ShamelessnessMental(opts);
        case 'recklessness': return new RecklessnessMental(opts);
        case 'restlessness': return new RestlessnessMental(opts);
        case 'greed': return new GreedMental(opts);
        case 'wrong-view': return new WrongViewMental(opts);
        case 'conceit': return new ConceitMental(opts);
        case 'hatred': return new HatredMental(opts);
        case 'envy': return new EnvyMental(opts);
        case 'stinginess': return new StinginessMental(opts);
        case 'worry': return new WorryMental(opts);
        case 'sloth': return new SlothMental(opts);
        case 'torpor': return new TorporMental(opts);
        case 'doubt': return new DoubtMental(opts);
        case 'faith': return new FaithMental(opts);
        case 'mindfulness': return new MindfulnessMental(opts);
        case 'moral-shame': return new MoralShameMental(opts);
        case 'moral-dread': return new MoralDreadMental(opts);
        case 'non-greed': return new NonGreedMental(opts);
        case 'non-hatred': return new NonHatredMental(opts);
        case 'equanimity': return new EquanimityMental(opts);
        case 'tranquility-body': return new TranquilityBodyMental(opts);
        case 'tranquility-mind': return new TranquilityMindMental(opts);
        case 'lightness-body': return new LightnessBodyMental(opts);
        case 'lightness-mind': return new LightnessMindMental(opts);
        case 'wieldiness-body': return new WieldinessBodyMental(opts);
        case 'wieldiness-mind': return new WieldinessMindMental(opts);
        case 'proficiency-body': return new ProficiencyBodyMental(opts);
        case 'proficiency-mind': return new ProficiencyMindMental(opts);
        case 'pliancy-body': return new PliancyBodyMental(opts);
        case 'pliancy-mind': return new PliancyMindMental(opts);
        case 'rectitude-body': return new RectitudeBodyMental(opts);
        case 'rectitude-mind': return new RectitudeMindMental(opts);
        case 'right-speech': return new RightSpeechMental(opts);
        case 'right-action': return new RightActionMental(opts);
        case 'right-livelihood': return new RightLivelihoodMental(opts);
        case 'compassion': return new CompassionMental(opts);
        case 'appreciative-joy': return new AppreciativeJoyMental(opts);
        case 'wisdom': return new WisdomMental(opts);
        default: return new ContactMental(opts);
    }
}
