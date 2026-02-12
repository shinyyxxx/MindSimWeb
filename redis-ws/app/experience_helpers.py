from datetime import datetime
from typing import Dict, List, Tuple
from persistent.mapping import PersistentMapping
import transaction

from zodb_module.zodb_management import get_connection
from zodb_module.objects import ExperienceObject


def process_non_kammic_stages(sense_door: str, object_experienced: str, 
                              feeling_potential: str) -> Dict:

    contact = f"{sense_door} + {object_experienced} + {_get_consciousness_type(sense_door)} consciousness"
    
    feeling = feeling_potential
    
    perception = f"recognized as {_get_perception_label(object_experienced, feeling_potential)}"
    
    return {
        "contact": contact,
        "feeling": feeling,
        "perception": perception
    }


def process_javana_stage(mental_context: Dict, feeling_potential: str, 
                        sense_door: str) -> Dict:

    training_level = mental_context.get("training_level", "worldling")
    mindfulness_present = mental_context.get("mindfulness_present", False)
    latent_tendencies = mental_context.get("latent_tendencies", [])
    
    if training_level == "arahant":
        return {
            "roots": ["kiriya"],
            "volition_type": "kiriya",
            "cetasikas_instantiated": _get_kiriya_cetasikas(),
            "kamma_produced": "no_kamma",
            "kamma_potency": None
        }
    
    if mindfulness_present and training_level == "sekha":
        return _instantiate_kusala_javana(feeling_potential, "high")
    
    elif mindfulness_present and training_level == "worldling":
        return _instantiate_kusala_javana(feeling_potential, "moderate")
    
    else:
        return _instantiate_akusala_javana(feeling_potential, latent_tendencies, sense_door)


def _instantiate_kusala_javana(feeling_potential: str, strength: str) -> Dict:
    roots = ["alobha", "adosa", "amoha"]  
    
    cetasikas = [
        "faith", "mindfulness", "moral shame", "moral dread",
        "non-greed", "non-hatred", "non-delusion",
        "tranquility", "lightness", "malleability"
    ]
    
    potency_map = {"high": 8, "moderate": 5, "low": 3}
    
    return {
        "roots": roots,
        "volition_type": "kusala",
        "cetasikas_instantiated": cetasikas,
        "kamma_produced": "kusala_kamma",
        "kamma_potency": potency_map.get(strength, 5)
    }


def _instantiate_akusala_javana(feeling_potential: str, latent_tendencies: List[str],
                                sense_door: str) -> Dict:

    roots = []
    cetasikas = []
    potency = 5
    
    if "greed" in latent_tendencies or "lobha" in latent_tendencies:
        roots.append("lobha")
        cetasikas.extend(["greed", "wrong view", "conceit", "restlessness"])
        
        if feeling_potential == "pleasant":
            potency += 2
            cetasikas.append("attachment")
    
    if "hatred" in latent_tendencies or "dosa" in latent_tendencies:
        roots.append("dosa")
        cetasikas.extend(["hatred", "aversion", "anger", "ill-will"])
        
        if feeling_potential == "unpleasant":
            potency += 2
            cetasikas.append("resentment")
    
    if "delusion" not in roots and "moha" not in roots:
        roots.append("moha")
    
    cetasikas.extend(["delusion", "shamelessness", "fearlessness of wrongdoing"])
    
    cetasikas = list(set(cetasikas))
    
    potency = min(potency, 10)
    
    return {
        "roots": roots,
        "volition_type": "akusala",
        "cetasikas_instantiated": cetasikas,
        "kamma_produced": "akusala_kamma",
        "kamma_potency": potency
    }


def _get_kiriya_cetasikas() -> List[str]:
    """Cetasikas that arise with arahant's kiriya (functional) citta"""
    return [
        "mindfulness", "wisdom", "tranquility", "equanimity",
        "lightness", "malleability", "proficiency"
    ]


def _get_consciousness_type(sense_door: str) -> str:
    """Get consciousness type for each sense door"""
    consciousness_map = {
        "eye": "visual",
        "ear": "auditory",
        "nose": "olfactory",
        "tongue": "gustatory",
        "body": "tactile",
        "mind": "mental"
    }
    return consciousness_map.get(sense_door, "mental")


def _get_perception_label(object_experienced: str, feeling_potential: str) -> str:
    """Generate perception label based on object and feeling"""
    if feeling_potential == "pleasant":
        return f"desirable {object_experienced}"
    elif feeling_potential == "unpleasant":
        return f"undesirable {object_experienced}"
    else:
        return f"neutral {object_experienced}"


def get_experience_id(root):
    """Get next available experience ID"""
    if not hasattr(root, 'experiences') or not root.experiences:
        return 1
    existing_ids = [int(key) for key in root.experiences.keys() if str(key).isdigit()]
    return max(existing_ids) + 1 if existing_ids else 1


def create_experience_zodb(root, experience_data: Dict) -> int:
    try:
        if not hasattr(root, 'experiences'):
            root.experiences = PersistentMapping()
        
        experience_id = get_experience_id(root)
        current_date = datetime.now()
        
        root.experiences[experience_id] = ExperienceObject(
            id=experience_id,
            mind_id=experience_data['mind_id'],
            sense_door=experience_data['sense_door'],
            object_experienced=experience_data['object_experienced'],
            feeling_potential=experience_data['feeling_potential'],
            mental_context=experience_data['mental_context'],
            non_kammic_stage=experience_data['non_kammic_stage'],
            javana_result=experience_data['javana_result'],
            created_at=current_date
        )
        
        transaction.commit()
        return experience_id
    except Exception:
        transaction.abort()
        raise


def get_experience_zodb(root, experience_id: int) -> Dict:
    """Get experience by ID"""
    if not hasattr(root, 'experiences') or experience_id not in root.experiences:
        return None
    
    exp = root.experiences[experience_id]
    
    return {
        'experience_id': exp.get_id(),
        'mind_id': exp.get_mind_id(),
        'sense_door': exp.get_sense_door(),
        'object': exp.get_object_experienced(),
        'feeling_potential': exp.get_feeling_potential(),
        'non_kammic_stage': exp.get_non_kammic_stage(),
        'javana_result': exp.get_javana_result(),
        'created_at': exp.get_created_at().isoformat() if exp.get_created_at() else None
    }


def list_experiences_by_mind(root, mind_id: int) -> List[Dict]:
    if not hasattr(root, 'experiences') or not root.experiences:
        return []
    
    experiences = []
    for exp_id in root.experiences.keys():
        exp = root.experiences[exp_id]
        if exp.get_mind_id() == mind_id:
            exp_data = get_experience_zodb(root, exp_id)
            if exp_data:
                experiences.append(exp_data)
    
    experiences.sort(key=lambda x: x['created_at'], reverse=True)
    return experiences


def get_kamma_statistics(root, mind_id: int) -> Dict:
    experiences = list_experiences_by_mind(root, mind_id)
    
    stats = {
        "total_experiences": len(experiences),
        "kusala_kamma_count": 0,
        "akusala_kamma_count": 0,
        "no_kamma_count": 0,
        "average_kusala_potency": 0,
        "average_akusala_potency": 0
    }
    
    kusala_potencies = []
    akusala_potencies = []
    
    for exp in experiences:
        kamma_type = exp['javana_result']['kamma_produced']
        
        if kamma_type == "kusala_kamma":
            stats["kusala_kamma_count"] += 1
            if exp['javana_result'].get('kamma_potency'):
                kusala_potencies.append(exp['javana_result']['kamma_potency'])
        
        elif kamma_type == "akusala_kamma":
            stats["akusala_kamma_count"] += 1
            if exp['javana_result'].get('kamma_potency'):
                akusala_potencies.append(exp['javana_result']['kamma_potency'])
        
        else:
            stats["no_kamma_count"] += 1
    
    if kusala_potencies:
        stats["average_kusala_potency"] = sum(kusala_potencies) / len(kusala_potencies)
    
    if akusala_potencies:
        stats["average_akusala_potency"] = sum(akusala_potencies) / len(akusala_potencies)
    
    return stats
