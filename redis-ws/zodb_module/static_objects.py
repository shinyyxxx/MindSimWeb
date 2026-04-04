"""
ZODB Persistent Objects for static Abhidhamma reference data.
Stored under separate root keys: root.static_mentals, root.static_mental_groups,
root.static_minds, root.static_mind_groups.
"""

import persistent
from persistent.list import PersistentList


class StaticMental(persistent.Persistent):
    """A cetasika (mental factor) — 52 canonical entries."""

    def __init__(self, id, name, pali, thai, slug, category,
                 description,
                 characteristic='', function='', manifestation='', proximate_cause=''):
        self.id = id
        self.name = name
        self.pali = pali
        self.thai = thai
        self.slug = slug
        self.category = category          # 'neutral' | 'bad' | 'good'
        self.description = description
        self.characteristic = characteristic
        self.function = function
        self.manifestation = manifestation
        self.proximate_cause = proximate_cause

    def to_dict(self):
        # getattr: instances loaded from older ZODB pickles may lack newer fields.
        return {
            'id': self.id,
            'name': self.name,
            'pali': self.pali,
            'thai': self.thai,
            'slug': getattr(self, 'slug', ''),
            'category': self.category,
            'description': getattr(self, 'description', ''),
            'characteristic': getattr(self, 'characteristic', ''),
            'function': getattr(self, 'function', ''),
            'manifestation': getattr(self, 'manifestation', ''),
            'proximate_cause': getattr(self, 'proximate_cause', ''),
        }


class StaticMentalGroup(persistent.Persistent):
    """A grouping of cetasikas (e.g. Universal-7, Moha catukka-4)."""

    def __init__(self, id, name, name_thai, name_en, mental_ids, description=''):
        self.id = id
        self.name = name
        self.name_thai = name_thai
        self.name_en = name_en
        self.mental_ids = PersistentList(mental_ids or [])
        self.description = description

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'name_thai': self.name_thai,
            'name_en': self.name_en,
            'description': getattr(self, 'description', ''),
            'mental_ids': list(self.mental_ids),
        }


class StaticMind(persistent.Persistent):
    """A citta (consciousness) — 89 canonical entries."""

    def __init__(self, id, name, pali, thai, category, mental_ids, description='', subgroup='', description_thai='', name_en=''):
        self.id = id
        self.name = name
        self.name_en = name_en
        self.pali = pali
        self.thai = thai
        self.category = category
        self.mental_ids = PersistentList(mental_ids or [])
        self.description = description
        self.subgroup = subgroup
        self.description_thai = description_thai

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'name_en': getattr(self, 'name_en', ''),
            'pali': self.pali,
            'thai': self.thai,
            'category': self.category,
            'subgroup': getattr(self, 'subgroup', ''),
            'description': getattr(self, 'description', ''),
            'description_thai': getattr(self, 'description_thai', ''),
            'mental_ids': list(self.mental_ids),
        }


class StaticMindGroup(persistent.Persistent):
    """A grouping of cittas (e.g. Akusala-12, Ahetuka-18)."""

    def __init__(self, id, name, name_thai, name_en, mind_ids, description=''):
        self.id = id
        self.name = name
        self.name_thai = name_thai
        self.name_en = name_en
        self.mind_ids = PersistentList(mind_ids or [])
        self.description = description

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'name_thai': self.name_thai,
            'name_en': self.name_en,
            'description': getattr(self, 'description', ''),
            'mind_ids': list(self.mind_ids),
        }
