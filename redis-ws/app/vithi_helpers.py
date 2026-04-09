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


def _javana(is_bad: bool, vividity: str, person_type: str):
    events = []
    if vividity not in ("mahantarammana", "atimahantarammana"):
        return events

    for i in range(7):
        if person_type == "arahant":
            if not is_bad:
                events.append(VithiEvent(
                    order=0, stage="javana", mind_id=30,
                    description=f"Javana {i+1}/7 — arahant functional (hasituppada)",
                ))
            else:
                events.append(VithiEvent(
                    order=0, stage="javana", mind_id=None,
                    mind_id_range=list(range(47, 55)),
                    description=f"Javana {i+1}/7 — arahant kiriya citta",
                ))
        else:
            if is_bad:
                akusala_range = _PERSON_AKUSALA_RANGE.get(person_type, list(range(1, 13)))
                events.append(VithiEvent(
                    order=0, stage="javana", mind_id=None,
                    mind_id_range=akusala_range,
                    description=f"Javana {i+1}/7 — akusala citta ({person_type})",
                ))
            else:
                events.append(VithiEvent(
                    order=0, stage="javana", mind_id=None,
                    mind_id_range=list(range(31, 39)),
                    description=f"Javana {i+1}/7 — kusala citta",
                ))
    return events


def _tadalammana(vividity: str, desire: str, desirability: str):
    events = []
    if vividity != "atimahantarammana":
        return events

    if desire == "bad":
        for i in range(2):
            events.append(VithiEvent(
                order=0, stage="tadalammana", mind_id=19,
                description=f"Registration {i+1}/2 — akusala vipaka santirana (unpleasant object)",
            ))
    elif desirability == "excellent":
        for i in range(2):
            events.append(VithiEvent(
                order=0, stage="tadalammana", mind_id=None,
                mind_id_range=[27, 39, 40, 41, 42],
                description=f"Registration {i+1}/2 — somanassa tadalammana (excellent object)",
            ))
    else:
        for i in range(2):
            events.append(VithiEvent(
                order=0, stage="tadalammana", mind_id=None,
                mind_id_range=[26, 43, 44, 45, 46],
                description=f"Registration {i+1}/2 — upekkha tadalammana (moderately good object)",
            ))
    return events


