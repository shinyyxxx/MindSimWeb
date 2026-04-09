"""
Pancadvara Vithi (Five-door cognitive process) — stage helper functions.

The orchestration now lives in PhassaObject.run_vithi() (zodb_module/objects.py).
These module-level helpers are called by that method.
"""

from dataclasses import dataclass
from typing import Optional


@dataclass
class VithiEvent:
    order: int
    stage: str
    mind_id: Optional[int] = None
    mind_id_range: Optional[list] = None
    description: str = ""


# Sense -> citta ID mappings
_AKUSALA_VIPAKA_SENSE = {"eye": 13, "ear": 14, "nose": 15, "tongue": 16, "body": 17}
_KUSALA_VIPAKA_SENSE = {"eye": 20, "ear": 21, "nose": 22, "tongue": 23, "body": 24}


def _pancavinnana(sense: str, is_bad: bool):
    if is_bad:
        mid = _AKUSALA_VIPAKA_SENSE.get(sense, 13)
        return mid, f"Sense consciousness ({sense}) — akusala vipaka"
    else:
        mid = _KUSALA_VIPAKA_SENSE.get(sense, 20)
        return mid, f"Sense consciousness ({sense}) — kusala vipaka"


def _sampaticchana(is_bad: bool):
    if is_bad:
        return 18, "Receiving consciousness — akusala vipaka"
    else:
        return 25, "Receiving consciousness — kusala vipaka"


def _santirana(is_bad: bool, desire: str):
    if is_bad:
        return 19, "Investigating consciousness — akusala vipaka"
    else:
        if desire == "good":
            return 27, "Investigating consciousness — kusala vipaka (joyful)"
        else:
            return 26, "Investigating consciousness — kusala vipaka (equanimous)"


def _votthapana(is_bad: bool, sense: str, experience_weight: dict,
                anusaya_dosa: float, anusaya_lobha: float,
                yoniso_manasikara: bool):
    memory_key = f"{sense}_{'BAD' if is_bad else 'GOOD'}"
    past_bias = experience_weight.get(memory_key, 0.5)

    impulse_score = past_bias
    if is_bad:
        impulse_score += anusaya_dosa
    else:
        impulse_score += anusaya_lobha

    if yoniso_manasikara:
        final_is_bad = False
        desc = "Determining consciousness — wise attention overrides impulse"
    else:
        final_is_bad = impulse_score > 0.7
        if final_is_bad:
            desc = "Determining consciousness — impulse leads to unwholesome"
        else:
            desc = "Determining consciousness — impulse leads to wholesome"

    return 29, desc, final_is_bad


_PERSON_AKUSALA_RANGE = {
    "puthujjana": list(range(1, 13)),
    "sotapanna":  [3, 4, 7, 8, 9, 10, 12],
    "sakadagami": [3, 4, 7, 8, 9, 10, 12],
    "anagami":    [3, 4, 7, 8, 12],
    "arahant":    [],
}


def _javana(is_bad: bool, vividity: str, person_type: str,
            sense: str = "", desire: str = "",
            yoniso_manasikara: bool = False, desirability: str = "moderate"):
    events = []
    if vividity not in ("mahantarammana", "atimahantarammana"):
        return events

    if person_type == "arahant":
        if not is_bad:
            mid, label = 30, "hasituppada (smile-producing)"
        else:
            mid, label = 47, "arahant kiriya citta"
    elif is_bad:
        if desire == "good":
            mid, label = 3, "lobha-rooted (greed, joy, unprompted, no wrong view)"
        else:
            mid, label = 9, "dosa-rooted (hatred, aversion, unprompted)"
    else:
        # Kusala — pick based on wisdom and feeling quality
        if yoniso_manasikara:
            mid, label = 31, "kusala (joy, with wisdom, unprompted)"
        elif desirability == "excellent":
            mid, label = 33, "kusala (joy, without wisdom, unprompted)"
        elif vividity == "mahantarammana":
            mid, label = 35, "kusala (equanimity, with wisdom, unprompted)"
        else:
            mid, label = 37, "kusala (equanimity, without wisdom, unprompted)"

    for i in range(7):
        events.append(VithiEvent(
            order=0, stage="javana", mind_id=mid,
            description=f"Javana {i+1}/7 — {label}",
        ))
    return events


def _tadalammana(vividity: str, desire: str, desirability: str, final_is_bad: bool = True):
    events = []
    if vividity != "atimahantarammana":
        return events

    if desire == "bad":
        mid, label = 19, "akusala vipaka santirana (unpleasant object)"
    elif not final_is_bad:
        # Kusala javana (30-38) -> mahavipaka tadalammana (39-46) allowed
        if desirability == "excellent":
            mid, label = 39, "mahavipaka somanassa (excellent object, with wisdom, unprompted)"
        else:
            mid, label = 43, "mahavipaka upekkha (moderate object, with wisdom, unprompted)"
    else:
        # Akusala javana (lobha) -> downgrade to santirana-level vipaka
        if desirability == "excellent":
            mid, label = 27, "santirana kusala vipaka somanassa (pleasant object, akusala javana)"
        else:
            mid, label = 26, "santirana kusala vipaka upekkha (pleasant object, akusala javana)"

    for i in range(2):
        events.append(VithiEvent(
            order=0, stage="tadalammana", mind_id=mid,
            description=f"Registration {i+1}/2 — {label}",
        ))
    return events


