"""
Pancadvara Vithi (Five-door cognitive process) simulation.

Ports the user's Python pseudocode into pure logic functions.
Each displayMental(id) call becomes a VithiEvent in an ordered list.
Mind IDs reference static MINDS_DATA (1-89 cittas).
"""

from dataclasses import dataclass, field
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


def run_pancadvara_vithi(
    sense: str,
    desire: str,
    vividity: str,
    person_type: str,
    yoniso_manasikara: bool = False,
    anusaya_dosa: float = 0.3,
    anusaya_lobha: float = 0.2,
    experience_weight: Optional[dict] = None,
) -> dict:
    """Run the full five-door cognitive process and return all events."""
    if experience_weight is None:
        experience_weight = {}

    events: list[VithiEvent] = []
    order = 0

    is_bad_initial = (desire == "bad")

    # Bhavanga calana + upaccheda (adverting)
    order += 1
    events.append(VithiEvent(
        order=order, stage="bhavanga_calana", mind_id=28,
        description="Bhavanga vibration — life-continuum disturbed",
    ))
    order += 1
    events.append(VithiEvent(
        order=order, stage="bhavanga_upaccheda", mind_id=28,
        description="Bhavanga arrest — life-continuum cut off",
    ))

    # Pancadvaravajjana (five-door adverting)
    order += 1
    events.append(VithiEvent(
        order=order, stage="pancadvaravajjana", mind_id=28,
        description="Five-door adverting — attention turns to object",
    ))

    if vividity == "atiparittarammana":
        order += 1
        events.append(VithiEvent(
            order=order, stage="vithi_blocked", mind_id=None,
            description="Object too faint — vithi does not proceed",
        ))
        return {
            "events": events,
            "updated_experience_weight": experience_weight,
            "result_type": "blocked",
        }

    # Pancavinnana (sense consciousness)
    pv_id, pv_desc = _pancavinnana(sense, is_bad_initial)
    order += 1
    events.append(VithiEvent(
        order=order, stage="pancavinnana", mind_id=pv_id,
        description=pv_desc,
    ))

    # Sampaticchana (receiving)
    sp_id, sp_desc = _sampaticchana(is_bad_initial)
    order += 1
    events.append(VithiEvent(
        order=order, stage="sampaticchana", mind_id=sp_id,
        description=sp_desc,
    ))

    # Santirana (investigating)
    st_id, st_desc = _santirana(is_bad_initial, desire)
    order += 1
    events.append(VithiEvent(
        order=order, stage="santirana", mind_id=st_id,
        description=st_desc,
    ))

    # Votthapana (determining)
    vt_id, vt_desc, final_is_bad = _votthapana(
        is_bad_initial, sense, experience_weight,
        anusaya_dosa, anusaya_lobha, yoniso_manasikara,
    )
    order += 1
    events.append(VithiEvent(
        order=order, stage="votthapana", mind_id=vt_id,
        description=vt_desc,
    ))

    # Javana (impulsion) x7
    javana_events = _javana(final_is_bad, vividity, person_type)
    for jev in javana_events:
        order += 1
        jev.order = order
        events.append(jev)

    # Tadalammana (registration) x2
    tada_events = _tadalammana(vividity, final_is_bad)
    for tev in tada_events:
        order += 1
        tev.order = order
        events.append(tev)

    # Update memory
    updated_weight = _update_memory(experience_weight, sense, final_is_bad)

    result_type = "akusala" if final_is_bad else "kusala"
    if person_type == "arahant":
        result_type = "kiriya"

    return {
        "events": events,
        "updated_experience_weight": updated_weight,
        "result_type": result_type,
    }


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
                    mind_id_range=[47, 54],
                    description=f"Javana {i+1}/7 — arahant kiriya citta",
                ))
        else:
            if is_bad:
                events.append(VithiEvent(
                    order=0, stage="javana", mind_id=None,
                    mind_id_range=[1, 12],
                    description=f"Javana {i+1}/7 — akusala citta",
                ))
            else:
                events.append(VithiEvent(
                    order=0, stage="javana", mind_id=None,
                    mind_id_range=[31, 38],
                    description=f"Javana {i+1}/7 — kusala citta",
                ))
    return events


def _tadalammana(vividity: str, is_bad: bool):
    events = []
    if vividity != "atimahantarammana":
        return events

    events.append(VithiEvent(
        order=0, stage="tadalammana", mind_id=29,
        description="Registration 1/2 — object registers in mind",
    ))
    events.append(VithiEvent(
        order=0, stage="tadalammana", mind_id=30,
        description="Registration 2/2 — object fully registered",
    ))
    return events


def _update_memory(experience_weight: dict, sense: str, is_bad: bool) -> dict:
    updated = dict(experience_weight)
    memory_key = f"{sense}_{'BAD' if is_bad else 'GOOD'}"
    current_weight = updated.get(memory_key, 0.5)
    if is_bad:
        new_weight = current_weight + 0.05
    else:
        new_weight = current_weight - 0.05
    updated[memory_key] = max(0.0, min(1.0, new_weight))
    return updated
