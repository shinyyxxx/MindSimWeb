import persistent
from persistent.list import PersistentList


_MENTAL_OPTIONAL_TEXT = frozenset({
    'characteristic', 'function', 'manifestation', 'proximate_cause',
})


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

    def __getattr__(self, name):
        # Older ZODB pickles may omit these keys; normal `self.function` then works.
        if name in _MENTAL_OPTIONAL_TEXT:
            return ''
        raise AttributeError(f"{type(self).__name__!r} object has no attribute {name!r}")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'pali': self.pali,
            'thai': self.thai,
            'slug': self.slug,
            'category': self.category,
            'description': self.description,
            'characteristic': self.characteristic,
            'function': self.function,
            'manifestation': self.manifestation,
            'proximate_cause': self.proximate_cause,
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
            'name_thai': getattr(self, 'name_thai', ''),
            'name_en': getattr(self, 'name_en', ''),
            'description': getattr(self, 'description', ''),
            'mental_ids': list(getattr(self, 'mental_ids', []) or []),
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
            'mental_ids': list(getattr(self, 'mental_ids', []) or []),
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
            'name_thai': getattr(self, 'name_thai', ''),
            'name_en': getattr(self, 'name_en', ''),
            'description': getattr(self, 'description', ''),
            'mind_ids': list(getattr(self, 'mind_ids', []) or []),
        }


class StaticRupa(persistent.Persistent):
    """A rūpa (material phenomenon) — 28 canonical entries."""

    def __init__(self, id, name, name_en, pali, description='', group='', subgroup=''):
        self.id = id
        self.name = name
        self.name_en = name_en
        self.pali = pali
        self.description = description
        self.group = group
        self.subgroup = subgroup

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'name_en': self.name_en,
            'pali': self.pali,
            'description': getattr(self, 'description', ''),
            'group': getattr(self, 'group', ''),
            'subgroup': getattr(self, 'subgroup', ''),
        }
