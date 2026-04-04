"""
Helpers for the static Abhidhamma reference data stored under
root.static_mentals, root.static_mental_groups,
root.static_minds, root.static_mind_groups.
"""

import transaction
from persistent.mapping import PersistentMapping
from persistent.list import PersistentList

from zodb_module.static_objects import (
    StaticMental, StaticMentalGroup, StaticMind, StaticMindGroup,
)
from app.static_seed_data import (
    MENTALS_DATA, MENTAL_GROUPS_DATA, MINDS_DATA, MIND_GROUPS_DATA,
)


def _mental_from_dict(d):
    return StaticMental(
        id=d['id'], name=d['name'], pali=d['pali'], thai=d['thai'],
        slug=d['slug'], category=d['category'],
        description=d['description'],
        characteristic=d.get('characteristic', ''),
        function=d.get('function', ''),
        manifestation=d.get('manifestation', ''),
        proximate_cause=d.get('proximate_cause', ''),
    )


def _sync_static_mental_obj(obj, d):
    """Update an existing ZODB StaticMental from seed dict; return True if mutated."""
    changed = False
    pairs = [
        ('name', d['name']),
        ('pali', d['pali']),
        ('thai', d['thai']),
        ('slug', d['slug']),
        ('category', d['category']),
        ('description', d['description']),
        ('characteristic', d.get('characteristic', '')),
        ('function', d.get('function', '')),
        ('manifestation', d.get('manifestation', '')),
        ('proximate_cause', d.get('proximate_cause', '')),
    ]
    for attr, val in pairs:
        if getattr(obj, attr, None) != val:
            setattr(obj, attr, val)
            changed = True
    if changed:
        obj._p_changed = True
    return changed


def _mind_from_dict(d):
    return StaticMind(
        id=d['id'], name=d['name'], pali=d['pali'], thai=d['thai'],
        category=d['category'], mental_ids=d['mental_ids'],
        description=d.get('description', ''),
        subgroup=d.get('subgroup', ''),
        description_thai=d.get('description_thai', ''),
        name_en=d.get('name_en', ''),
    )


def _sync_static_mind_obj(obj, d):
    """Update an existing ZODB StaticMind from seed dict; return True if mutated."""
    changed = False
    pairs = [
        ('name', d['name']),
        ('pali', d['pali']),
        ('thai', d['thai']),
        ('category', d['category']),
        ('description', d.get('description', '')),
        ('subgroup', d.get('subgroup', '')),
        ('description_thai', d.get('description_thai', '')),
        ('name_en', d.get('name_en', '')),
    ]
    for attr, val in pairs:
        if getattr(obj, attr, None) != val:
            setattr(obj, attr, val)
            changed = True
    target_ids = d['mental_ids']
    if list(getattr(obj, 'mental_ids', []) or []) != target_ids:
        obj.mental_ids = PersistentList(target_ids)
        changed = True
    if changed:
        obj._p_changed = True
    return changed


def _mind_group_from_dict(d):
    return StaticMindGroup(
        id=d['id'], name=d['name'],
        name_thai=d['name_thai'], name_en=d['name_en'],
        mind_ids=d['mind_ids'],
        description=d.get('description', ''),
    )


def _sync_static_mind_group_obj(obj, d):
    """Update an existing ZODB StaticMindGroup from seed dict; return True if mutated."""
    changed = False
    pairs = [
        ('name', d['name']),
        ('name_thai', d['name_thai']),
        ('name_en', d['name_en']),
        ('description', d.get('description', '')),
    ]
    for attr, val in pairs:
        if getattr(obj, attr, None) != val:
            setattr(obj, attr, val)
            changed = True
    target_ids = d['mind_ids']
    if list(getattr(obj, 'mind_ids', []) or []) != target_ids:
        obj.mind_ids = PersistentList(target_ids)
        changed = True
    if changed:
        obj._p_changed = True
    return changed


# ── seeding ──────────────────────────────────────────────────────────────────

def init_static_data(root):
    """Populate the four static collections if they are missing or empty."""
    changed = False
    mental_changed = False

    if not hasattr(root, 'static_mentals'):
        root.static_mentals = PersistentMapping()
        changed = True

    # Always align mentals with MENTALS_DATA so new seed fields (e.g. characteristic)
    # reach existing databases that were seeded before those columns existed.
    for d in MENTALS_DATA:
        mid = d['id']
        if mid not in root.static_mentals:
            root.static_mentals[mid] = _mental_from_dict(d)
            changed = True
            mental_changed = True
        elif _sync_static_mental_obj(root.static_mentals[mid], d):
            changed = True
            mental_changed = True
    if mental_changed:
        print(f"[STATIC] Mentals (cetasikas) synced: {len(MENTALS_DATA)} entries")

    if not hasattr(root, 'static_mental_groups') or not root.static_mental_groups:
        root.static_mental_groups = PersistentMapping()
        for d in MENTAL_GROUPS_DATA:
            root.static_mental_groups[d['id']] = StaticMentalGroup(
                id=d['id'], name=d['name'],
                name_thai=d['name_thai'], name_en=d['name_en'],
                mental_ids=d['mental_ids'],
                description=d.get('description', ''),
            )
        changed = True
        print(f"[STATIC] Seeded {len(MENTAL_GROUPS_DATA)} mental groups")

    minds_changed = False
    if not hasattr(root, 'static_minds'):
        root.static_minds = PersistentMapping()
        changed = True

    for d in MINDS_DATA:
        mid = d['id']
        if mid not in root.static_minds:
            root.static_minds[mid] = _mind_from_dict(d)
            changed = True
            minds_changed = True
        elif _sync_static_mind_obj(root.static_minds[mid], d):
            changed = True
            minds_changed = True
    if minds_changed:
        print(f"[STATIC] Minds (cittas) synced: {len(MINDS_DATA)} entries")

    mind_groups_changed = False
    if not hasattr(root, 'static_mind_groups'):
        root.static_mind_groups = PersistentMapping()
        changed = True

    for d in MIND_GROUPS_DATA:
        gid = d['id']
        if gid not in root.static_mind_groups:
            root.static_mind_groups[gid] = _mind_group_from_dict(d)
            changed = True
            mind_groups_changed = True
        elif _sync_static_mind_group_obj(root.static_mind_groups[gid], d):
            changed = True
            mind_groups_changed = True
    if mind_groups_changed:
        print(f"[STATIC] Mind groups synced: {len(MIND_GROUPS_DATA)} entries")

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
