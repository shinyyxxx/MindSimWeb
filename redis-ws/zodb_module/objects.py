"""
ZODB Persistent Objects
"""

import persistent
from datetime import datetime


class MentalSphereObject(persistent.Persistent):
    def __init__(self, id, name, detail, color, image, rec_status,
                 created_by, spatial_data_id, created_at):
        self.id = id
        self.name = name
        self.detail = detail
        self.color = color
        self.image = image
        self.rec_status = rec_status
        self.spatial_data_id = spatial_data_id
        self.created_by = created_by
        self.created_at = created_at
        self.updated_at = created_at

    def get_id(self): return self.id
    def get_name(self): return self.name
    def get_detail(self): return self.detail
    def get_image(self): return self.image
    def get_color(self): return self.color
    def get_rec_status(self): return self.rec_status
    def get_created_by(self): return self.created_by
    def get_created_by_id(self): return self.created_by
    def get_spatial_data_id(self): return self.spatial_data_id
    def get_created_at(self): return self.created_at
    def get_updated_at(self): return self.updated_at

    def set_name(self, name): self.name = name
    def set_detail(self, detail): self.detail = detail
    def set_image(self, image): self.image = image
    def set_color(self, color): self.color = color
    def set_rec_status(self, rec_status): self.rec_status = rec_status
    def set_created_by(self, created_by): self.created_by = created_by
    def set_spatial_data_id(self, spatial_data_id): self.spatial_data_id = spatial_data_id
    def set_created_at(self, created_at): self.created_at = created_at
    def set_updated_at(self, updated_at): self.updated_at = updated_at


class MindObject(persistent.Persistent):
    def __init__(self, id, name, detail, color, rec_status,
                 spatial_data_id, created_by, mental_sphere_ids, created_at):
        self.id = id
        self.name = name
        self.detail = detail
        self.color = color
        self.rec_status = rec_status
        self.spatial_data_id = spatial_data_id
        self.created_by = created_by
        self.mental_sphere_ids = mental_sphere_ids if mental_sphere_ids else []
        self.created_at = created_at
        self.updated_at = created_at

    def get_id(self): return self.id
    def get_name(self): return self.name
    def get_detail(self): return self.detail
    def get_color(self): return self.color
    def get_rec_status(self): return self.rec_status
    def get_created_by(self): return self.created_by
    def get_mental_sphere_ids(self): return self.mental_sphere_ids
    def get_created_at(self): return self.created_at
    def get_updated_at(self): return self.updated_at
    def get_spatial_data_id(self): return self.spatial_data_id

    def set_name(self, name): self.name = name
    def set_detail(self, detail): self.detail = detail
    def set_color(self, color): self.color = color
    def set_rec_status(self, rec_status): self.rec_status = rec_status
    def set_created_by(self, created_by): self.created_by = created_by
    def set_created_at(self, created_at): self.created_at = created_at
    def set_updated_at(self, updated_at): self.updated_at = updated_at
    def set_spatial_data_id(self, spatial_data_id): self.spatial_data_id = spatial_data_id

    def add_mental_sphere(self, sphere_id):
        if sphere_id not in self.mental_sphere_ids:
            self.mental_sphere_ids.append(sphere_id)

    def remove_mental_sphere(self, sphere_id):
        if sphere_id in self.mental_sphere_ids:
            self.mental_sphere_ids.remove(sphere_id)


class SannaObject(MentalSphereObject):
    """Perception (Sanna) — a mental that also persists experience_weight for the vithi process."""

    def __init__(self, id, name='Perception', detail='Recognizes and labels the object',
                 color='#60a5fa', image='', rec_status=True, created_by=1,
                 spatial_data_id=None, created_at=None, mind_id=None):
        super().__init__(id=id, name=name, detail=detail, color=color, image=image,
                         rec_status=rec_status, created_by=created_by,
                         spatial_data_id=spatial_data_id, created_at=created_at or datetime.now())
        self.mind_id = mind_id
        self.experience_weight = {}

    def get_mind_id(self): return self.mind_id
    def set_mind_id(self, mind_id): self.mind_id = mind_id

    def get_experience_weight(self): return dict(self.experience_weight)

    def set_experience_weight_key(self, key, value):
        self.experience_weight[key] = max(0.0, min(1.0, value))
        self._p_changed = True

    def update_from_vithi(self, sense, is_bad):
        memory_key = f"{sense}_{'BAD' if is_bad else 'GOOD'}"
        current = self.experience_weight.get(memory_key, 0.5)
        if is_bad:
            new_val = current + 0.05
        else:
            new_val = current - 0.05
        self.experience_weight[memory_key] = max(0.0, min(1.0, new_val))
        self.updated_at = datetime.now()
        self._p_changed = True

    def to_dict(self):
        base = {
            'id': self.id, 'name': self.name, 'detail': self.detail,
            'color': self.color, 'image': self.image, 'rec_status': self.rec_status,
            'created_by': self.created_by, 'spatial_data_id': self.spatial_data_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'mind_id': self.mind_id,
            'experience_weight': dict(self.experience_weight),
        }
        return base


class PhassaObject(MentalSphereObject):
    """Contact (Phassa) — a mental that also owns the five-door cognitive process (vithi)."""

    def __init__(self, id, name='Contact', detail='Brings together sense organ, object, and consciousness',
                 color='#ff6b6b', image='', rec_status=True, created_by=1,
                 spatial_data_id=None, created_at=None, mind_id=None, sanna_id=None):
        super().__init__(id=id, name=name, detail=detail, color=color, image=image,
                         rec_status=rec_status, created_by=created_by,
                         spatial_data_id=spatial_data_id, created_at=created_at or datetime.now())
        self.mind_id = mind_id
        self.sanna_id = sanna_id

    def get_mind_id(self): return self.mind_id
    def get_sanna_id(self): return self.sanna_id

    def set_mind_id(self, mind_id): self.mind_id = mind_id
    def set_sanna_id(self, sanna_id): self.sanna_id = sanna_id

    def run_vithi(self, sanna, sense, desire, vividity, person_type,
                  yoniso_manasikara=False, anusaya_dosa=0.3, anusaya_lobha=0.2,
                  desirability="excellent"):
        from app.vithi_helpers import (
            VithiEvent, _pancavinnana, _sampaticchana, _santirana,
            _votthapana, _javana, _tadalammana,
        )
        experience_weight = sanna.get_experience_weight()

        events = []
        order = 0
        is_bad_initial = (desire == "bad")

        order += 1
        events.append(VithiEvent(order=order, stage="atita_bhavanga", mind_id=28,
                                 description="Past bhavanga — last moment of life-continuum"))
        order += 1
        events.append(VithiEvent(order=order, stage="bhavanga_calana", mind_id=28,
                                 description="Bhavanga vibration — life-continuum disturbed"))
        order += 1
        events.append(VithiEvent(order=order, stage="bhavanga_upaccheda", mind_id=28,
                                 description="Bhavanga arrest — life-continuum cut off"))

        if vividity in ("atiparittarammana", "parittarammana"):
            return {
                "events": events,
                "updated_experience_weight": experience_weight,
                "result_type": "blocked",
            }

        order += 1
        events.append(VithiEvent(order=order, stage="pancadvaravajjana", mind_id=28,
                                 description="Five-door adverting — attention turns to object"))

        pv_id, pv_desc = _pancavinnana(sense, is_bad_initial)
        order += 1
        events.append(VithiEvent(order=order, stage="pancavinnana", mind_id=pv_id, description=pv_desc))

        sp_id, sp_desc = _sampaticchana(is_bad_initial)
        order += 1
        events.append(VithiEvent(order=order, stage="sampaticchana", mind_id=sp_id, description=sp_desc))

        st_id, st_desc = _santirana(is_bad_initial, desire)
        order += 1
        events.append(VithiEvent(order=order, stage="santirana", mind_id=st_id, description=st_desc))

        vt_id, vt_desc, final_is_bad = _votthapana(
            is_bad_initial, sense, experience_weight,
            anusaya_dosa, anusaya_lobha, yoniso_manasikara,
        )
        order += 1
        events.append(VithiEvent(order=order, stage="votthapana", mind_id=vt_id, description=vt_desc))

        for jev in _javana(final_is_bad, vividity, person_type,
                          sense=sense, desire=desire,
                          yoniso_manasikara=yoniso_manasikara,
                          desirability=desirability):
            order += 1
            jev.order = order
            events.append(jev)

        for tev in _tadalammana(vividity, desire, desirability, final_is_bad):
            order += 1
            tev.order = order
            events.append(tev)

        sanna.update_from_vithi(sense, final_is_bad)
        updated_weight = sanna.get_experience_weight()

        result_type = "akusala" if final_is_bad else "kusala"
        if person_type == "arahant":
            result_type = "kiriya"

        return {
            "events": events,
            "updated_experience_weight": updated_weight,
            "result_type": result_type,
        }

    def to_dict(self):
        base = {
            'id': self.id, 'name': self.name, 'detail': self.detail,
            'color': self.color, 'image': self.image, 'rec_status': self.rec_status,
            'created_by': self.created_by, 'spatial_data_id': self.spatial_data_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'mind_id': self.mind_id,
            'sanna_id': self.sanna_id,
        }
        return base


class LifeObject(persistent.Persistent):
    """Singleton container for the mind currently active in the simulation."""

    def __init__(self, id, mind_id, created_at):
        self.id = id
        self.mind_id = mind_id
        self.created_at = created_at
        self.updated_at = created_at

    def get_id(self): return self.id
    def get_mind_id(self): return self.mind_id
    def get_created_at(self): return self.created_at
    def get_updated_at(self): return self.updated_at

    def set_mind_id(self, mind_id):
        self.mind_id = mind_id
        from datetime import datetime as _dt
        self.updated_at = _dt.now()

    def to_dict(self):
        return {
            'id': self.id,
            'mind_id': self.mind_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class ExperienceObject(persistent.Persistent):
    """Represents a cognitive experience processed through Abhidhamma stages"""
    def __init__(self, id, mind_id, sense_door, object_experienced, feeling_potential,
                 mental_context, non_kammic_stage, javana_result, created_at):
        self.id = id
        self.mind_id = mind_id
        self.sense_door = sense_door
        self.object_experienced = object_experienced
        self.feeling_potential = feeling_potential
        self.mental_context = mental_context  # dict
        self.non_kammic_stage = non_kammic_stage  # dict
        self.javana_result = javana_result  # dict
        self.created_at = created_at
    
    def get_id(self): return self.id
    def get_mind_id(self): return self.mind_id
    def get_sense_door(self): return self.sense_door
    def get_object_experienced(self): return self.object_experienced
    def get_feeling_potential(self): return self.feeling_potential
    def get_mental_context(self): return self.mental_context
    def get_non_kammic_stage(self): return self.non_kammic_stage
    def get_javana_result(self): return self.javana_result
    def get_created_at(self): return self.created_at
    
    def get_kamma_produced(self):
        """Quick accessor for kamma result"""
        return self.javana_result.get('kamma_produced')
