"""
Helpers for the static Abhidhamma reference data stored under
root.static_mentals, root.static_mental_groups,
root.static_minds, root.static_mind_groups.
"""

import transaction
from persistent.mapping import PersistentMapping

from zodb_module.static_objects import (
    StaticMental, StaticMentalGroup, StaticMind, StaticMindGroup,
)
from app.static_seed_data import (
    MENTALS_DATA, MENTAL_GROUPS_DATA, MINDS_DATA, MIND_GROUPS_DATA,
)


# ── seeding ──────────────────────────────────────────────────────────────────

def init_static_data(root):
    """Populate the four static collections if they are missing or empty."""
    changed = False

    if not hasattr(root, 'static_mentals') or not root.static_mentals:
        root.static_mentals = PersistentMapping()
        for d in MENTALS_DATA:
            root.static_mentals[d['id']] = StaticMental(
                id=d['id'], name=d['name'], pali=d['pali'], thai=d['thai'],
                slug=d['slug'], category=d['category'],
                description=d['description'], highlights=d['highlights'],
            )
        changed = True
        print(f"[STATIC] Seeded {len(MENTALS_DATA)} mentals (cetasikas)")

    if not hasattr(root, 'static_mental_groups') or not root.static_mental_groups:
        root.static_mental_groups = PersistentMapping()
        for d in MENTAL_GROUPS_DATA:
            root.static_mental_groups[d['id']] = StaticMentalGroup(
                id=d['id'], name=d['name'],
                name_thai=d['name_thai'], name_en=d['name_en'],
                mental_ids=d['mental_ids'],
            )
        changed = True
        print(f"[STATIC] Seeded {len(MENTAL_GROUPS_DATA)} mental groups")

    if not hasattr(root, 'static_minds') or not root.static_minds:
        root.static_minds = PersistentMapping()
        for d in MINDS_DATA:
            root.static_minds[d['id']] = StaticMind(
                id=d['id'], name=d['name'], pali=d['pali'], thai=d['thai'],
                category=d['category'], mental_ids=d['mental_ids'],
                description=d.get('description', ''),
                subgroup=d.get('subgroup', ''),
            )
        changed = True
        print(f"[STATIC] Seeded {len(MINDS_DATA)} minds (cittas)")

    if not hasattr(root, 'static_mind_groups') or not root.static_mind_groups:
        root.static_mind_groups = PersistentMapping()
        for d in MIND_GROUPS_DATA:
            root.static_mind_groups[d['id']] = StaticMindGroup(
                id=d['id'], name=d['name'],
                name_thai=d['name_thai'], name_en=d['name_en'],
                mind_ids=d['mind_ids'],
            )
        changed = True
        print(f"[STATIC] Seeded {len(MIND_GROUPS_DATA)} mind groups")

    if changed:
        transaction.commit()
        print("[STATIC] Static data committed")
    else:
        print("[STATIC] Static data already present — skipping seed")


# ── read helpers ─────────────────────────────────────────────────────────────

# Mental (cetasika)

def get_static_mental(root, mental_id):
    if not hasattr(root, 'static_mentals'):
        return None
    obj = root.static_mentals.get(mental_id)
    return obj.to_dict() if obj else None


def list_static_mentals(root, category=None):
    if not hasattr(root, 'static_mentals'):
        return []
    result = []
    for obj in root.static_mentals.values():
        if category and obj.category != category:
            continue
        result.append(obj.to_dict())
    result.sort(key=lambda m: m['id'])
    return result


# Mental group

def get_static_mental_group(root, group_id):
    if not hasattr(root, 'static_mental_groups'):
        return None
    obj = root.static_mental_groups.get(group_id)
    return obj.to_dict() if obj else None


def list_static_mental_groups(root):
    if not hasattr(root, 'static_mental_groups'):
        return []
    result = [obj.to_dict() for obj in root.static_mental_groups.values()]
    result.sort(key=lambda g: g['id'])
    return result


# Mind (citta)

def get_static_mind(root, mind_id):
    if not hasattr(root, 'static_minds'):
        return None
    obj = root.static_minds.get(mind_id)
    return obj.to_dict() if obj else None


def list_static_minds(root, category=None):
    if not hasattr(root, 'static_minds'):
        return []
    result = []
    for obj in root.static_minds.values():
        if category and obj.category != category:
            continue
        result.append(obj.to_dict())
    result.sort(key=lambda m: m['id'])
    return result


# Mind group

def get_static_mind_group(root, group_id):
    if not hasattr(root, 'static_mind_groups'):
        return None
    obj = root.static_mind_groups.get(group_id)
    return obj.to_dict() if obj else None


def list_static_mind_groups(root):
    if not hasattr(root, 'static_mind_groups'):
        return []
    result = [obj.to_dict() for obj in root.static_mind_groups.values()]
    result.sort(key=lambda g: g['id'])
    return result
