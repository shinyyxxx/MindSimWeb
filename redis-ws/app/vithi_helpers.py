from dataclasses import dataclass
from typing import Optional


@dataclass
class VithiEvent:
    order: int
    stage: str
    mind_id: Optional[int] = None
    mind_id_range: Optional[list] = None
    description: str = ""
    reason: str = ""


# Sense -> citta ID mappings
_AKUSALA_VIPAKA_SENSE = {"eye": 13, "ear": 14, "nose": 15, "tongue": 16, "body": 17}
_KUSALA_VIPAKA_SENSE = {"eye": 20, "ear": 21, "nose": 22, "tongue": 23, "body": 24}


_SENSE_CONSCIOUSNESS_NAME = {
    "eye": "eye consciousness", "ear": "ear consciousness",
    "nose": "nose consciousness", "tongue": "tongue consciousness",
    "body": "body consciousness",
}


def _pancavinnana(sense: str, is_bad: bool):
    name = _SENSE_CONSCIOUSNESS_NAME.get(sense, f"{sense} consciousness")
    if is_bad:
        mid = _AKUSALA_VIPAKA_SENSE.get(sense, 13)
        desc = f"Sense consciousness for {sense}, akusala vipaka"
        reason = (
            f"The {name} arises as an akusala vipaka because the object is unpleasant. "
            f"Each sense door has its own specific resultant citta for unpleasant objects."
        )
    else:
        mid = _KUSALA_VIPAKA_SENSE.get(sense, 20)
        desc = f"Sense consciousness for {sense}, kusala vipaka"
        reason = (
            f"The {name} arises as a kusala vipaka because the object is pleasant. "
            f"Each sense door has its own specific resultant citta for pleasant objects."
        )
    return mid, desc, reason


def _sampaticchana(is_bad: bool):
    if is_bad:
        return 18, "Receiving consciousness, akusala vipaka", (
            "The akusala vipaka receiving consciousness or sampaticchana passively receives the sense data. "
            "Since the object is unpleasant, the unwholesome resultant form of this citta arises."
        )
    else:
        return 25, "Receiving consciousness, kusala vipaka", (
            "The kusala vipaka receiving consciousness or sampaticchana passively receives the sense data. "
            "Since the object is pleasant, the wholesome resultant form of this citta arises."
        )


def _santirana(is_bad: bool, desire: str):
    if is_bad:
        return 19, "Investigating consciousness, akusala vipaka", (
            "The akusala vipaka santirana or investigating consciousness examines the unpleasant object with neutral feeling. "
            "This is a result of past unwholesome kamma meeting an unpleasant object."
        )
    else:
        if desire == "good":
            return 27, "Investigating consciousness, kusala vipaka with joy", (
                "The kusala vipaka santirana with somanassa examines the pleasant object with joyful feeling. "
                "The object is desirable, so joy accompanies the investigation."
            )
        else:
            return 26, "Investigating consciousness, kusala vipaka with equanimity", (
                "The kusala vipaka santirana with upekkha examines the object with equanimous feeling. "
                "The object is not strongly desirable, so equanimity accompanies the investigation."
            )


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
        desc = "Determining consciousness, wise attention overrides impulse"
        reason = (
            "Wise attention or yoniso manasikara is present, overriding the impulse. "
            "The javana will be wholesome regardless of underlying tendencies."
        )
    else:
        final_is_bad = impulse_score > 0.7
        if final_is_bad:
            desc = "Determining consciousness, impulse leads to unwholesome"
            if is_bad:
                reason = (
                    "The person's underlying aversion tendency or anusaya dosa combined with past experience "
                    "is strong enough to drive the reaction toward unwholesome. "
                    "The javana that follows will be akusala."
                )
            else:
                reason = (
                    "The person's underlying attachment tendency or anusaya lobha combined with past experience "
                    "is strong enough to overpower the pleasant object. "
                    "Despite the object being desirable, greed takes over and the javana will be akusala."
                )
        else:
            desc = "Determining consciousness, impulse leads to wholesome"
            if is_bad:
                reason = (
                    "The person's aversion tendency is not strong enough to dominate. "
                    "The reaction remains wholesome and the javana that follows will be kusala."
                )
            else:
                reason = (
                    "The person's attachment tendency is not strong enough to overpower. "
                    "The reaction stays wholesome and the javana that follows will be kusala."
                )

    return 29, desc, final_is_bad, reason


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
            mid, label = 30, "hasituppada, smile producing"
            reason = (
                "The arahant has no unwholesome roots. A pleasant object triggers "
                "hasituppada, the smile producing functional consciousness unique to arahants."
            )
        else:
            mid, label = 47, "arahant kiriya citta"
            reason = (
                "The arahant responds to an unpleasant object with the first maha kiriya citta "
                "or great functional consciousness. "
                "No kamma is produced because arahants act without wholesome or unwholesome volition."
            )
    elif is_bad:
        if desire == "good":
            mid, label = 3, "lobha rooted with greed, joy, unprompted, no wrong view"
            reason = (
                "The object is pleasant but greed overpowers. Lobha or attachment is the dominant root. "
                "A greed rooted citta with wrong view, equanimous feeling and unprompted arises. "
                "This is simple sensory craving toward the pleasant object."
            )
        else:
            mid, label = 9, "dosa rooted with hatred, aversion, unprompted"
            reason = (
                "The object is unpleasant and triggers an aversive reaction. "
                "Dosa or hatred is the dominant unwholesome root. "
                "A spontaneous hatred rooted citta with displeasure arises. "
                "This is the natural unwholesome response to something unpleasant."
            )
    else:
        if yoniso_manasikara:
            mid, label = 31, "kusala with joy, wisdom, unprompted"
            reason = (
                "Wise attention or yoniso manasikara leads to the highest kusala citta. "
                "A wholesome citta with joy, accompanied by wisdom and unprompted arises. "
                "This is the most complete wholesome mind with all beautiful cetasikas."
            )
        elif desirability == "excellent":
            mid, label = 33, "kusala with joy, without wisdom, unprompted"
            reason = (
                "The excellent object produces a joyful wholesome response but without wisdom. "
                "A wholesome citta with joy, unprompted but without knowledge arises. "
                "This is a spontaneous happy reaction without deep understanding."
            )
        elif vividity == "mahantarammana":
            mid, label = 35, "kusala with equanimity, wisdom, unprompted"
            reason = (
                "The moderate object produces a calm wholesome response with wisdom. "
                "A wholesome citta with equanimity, accompanied by wisdom and unprompted arises. "
                "This is a balanced and insightful reaction."
            )
        else:
            mid, label = 37, "kusala with equanimity, without wisdom, unprompted"
            reason = (
                "A calm wholesome response arises without deep insight. "
                "A wholesome citta with equanimity, without knowledge and unprompted arises."
            )

    for i in range(7):
        events.append(VithiEvent(
            order=0, stage="javana", mind_id=mid,
            description=f"Javana {i+1}/7, {label}",
            reason=reason,
        ))
    return events


def _tadalammana(vividity: str, desire: str, desirability: str, final_is_bad: bool = True):
    events = []
    if vividity != "atimahantarammana":
        return events

    if desire == "bad":
        mid, label = 19, "akusala vipaka santirana for unpleasant object"
        reason = (
            "The object is unpleasant so the akusala vipaka santirana or investigating consciousness "
            "registers the sense data before the mind returns to the bhavanga stream."
        )
    elif not final_is_bad:
        if desirability == "excellent":
            mid, label = 39, "mahavipaka somanassa for excellent object, with wisdom, unprompted"
            reason = (
                "The preceding javana was wholesome or kusala which allows a mahavipaka or great resultant registration. "
                "A joyful great resultant citta with wisdom arises, registering the excellent object."
            )
        else:
            mid, label = 43, "mahavipaka upekkha for moderate object, with wisdom, unprompted"
            reason = (
                "The preceding javana was wholesome or kusala which allows a mahavipaka or great resultant registration. "
                "A calm equanimous great resultant citta with wisdom arises, registering the moderate object."
            )
    else:
        if desirability == "excellent":
            mid, label = 27, "santirana kusala vipaka somanassa for pleasant object after akusala javana"
            reason = (
                "Although the object is pleasant, the preceding javana was unwholesome. "
                "This prevents a great resultant registration. Instead the santirana with somanassa "
                "or investigating consciousness with pleasure registers the object at a simpler level."
            )
        else:
            mid, label = 26, "santirana kusala vipaka upekkha for pleasant object after akusala javana"
            reason = (
                "Although the object is pleasant, the preceding javana was unwholesome. "
                "This prevents a great resultant registration. Instead the santirana with upekkha "
                "or investigating consciousness with equanimity registers the object at a simpler level."
            )

    for i in range(2):
        events.append(VithiEvent(
            order=0, stage="tadalammana", mind_id=mid,
            description=f"Registration {i+1}/2, {label}",
            reason=reason,
        ))
    return events


