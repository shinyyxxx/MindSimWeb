import re
from datetime import datetime
from typing import Tuple, List, Dict, Any

from app.mind_helpers import (
    create_mind_zodb, get_mind_zodb,
    create_mental_sphere_zodb, get_mental_sphere_zodb,
    add_mental_spheres_to_mind
)


FORBIDDEN_TOKENS = [
    "import ", "from ", "__builtins__", "__import__",
    "exec(", "eval(", "compile(", "open(",
    "os.", "sys.", "subprocess", "shutil",
    "globals(", "locals(", "getattr(", "setattr(",
    "delattr(", "breakpoint(", "__class__",
]

MAX_CODE_LENGTH = 10_000
MAX_OBJECTS = 100


def _validate_code(code: str) -> None:
    if not code or not code.strip():
        raise ValueError("Code cannot be empty")
    if len(code) > MAX_CODE_LENGTH:
        raise ValueError(f"Code exceeds maximum length of {MAX_CODE_LENGTH} characters")
    for token in FORBIDDEN_TOKENS:
        if token in code:
            raise ValueError(f"Forbidden token detected: '{token.strip()}'")


def _create_sandbox() -> Tuple:
    minds: List[Any] = []
    mentals: List[Any] = []

    class Mental:
        def __init__(self):
            object.__setattr__(self, '_props', {})
            object.__setattr__(self, '_db_id', None)
            if len(mentals) >= MAX_OBJECTS:
                raise RuntimeError(f"Cannot create more than {MAX_OBJECTS} Mental objects")
            mentals.append(self)

        def __setattr__(self, name, value):
            self._props[name] = value

        def __getattr__(self, name):
            try:
                return object.__getattribute__(self, '_props')[name]
            except KeyError:
                raise AttributeError(f"'Mental' object has no attribute '{name}'")

        def __repr__(self):
            return f"Mental({self._props})"

    class Mind:
        def __init__(self):
            object.__setattr__(self, '_props', {})
            object.__setattr__(self, '_mentals', [])
            object.__setattr__(self, '_db_id', None)
            if len(minds) >= MAX_OBJECTS:
                raise RuntimeError(f"Cannot create more than {MAX_OBJECTS} Mind objects")
            minds.append(self)

        def __setattr__(self, name, value):
            self._props[name] = value

        def __getattr__(self, name):
            try:
                return object.__getattribute__(self, '_props')[name]
            except KeyError:
                raise AttributeError(f"'Mind' object has no attribute '{name}'")

        def append(self, obj):
            if not isinstance(obj, Mental):
                raise TypeError("Can only append Mental objects to Mind")
            self._mentals.append(obj)

        def __repr__(self):
            return f"Mind({self._props}, mentals={len(self._mentals)})"

    return Mind, Mental, minds, mentals


SAFE_BUILTINS = {
    'True': True, 'False': False, 'None': None,
    'int': int, 'float': float, 'str': str, 'bool': bool,
    'list': list, 'dict': dict, 'tuple': tuple,
    'len': len, 'range': range, 'print': lambda *a, **kw: None,
    'abs': abs, 'min': min, 'max': max, 'round': round,
    'enumerate': enumerate, 'zip': zip, 'map': map, 'filter': filter,
    'isinstance': isinstance, 'type': type,
}


def execute_code(code: str) -> Tuple[List, List]:
    _validate_code(code)

    Mind, Mental, minds, mentals = _create_sandbox()

    namespace = {
        '__builtins__': SAFE_BUILTINS,
        'Mind': Mind,
        'Mental': Mental,
    }

    exec(code, namespace)
    return minds, mentals


def persist_and_collect(root, code: str) -> Dict[str, Any]:
    minds, mentals = execute_code(code)

    log: List[str] = []
    created_minds = []
    created_mentals = []

    for m in mentals:
        props = m._props
        mental_data = {
            'name': props.get('name', ''),
            'detail': props.get('detail', ''),
            'color': props.get('color', '#FFFFFF'),
            'image': props.get('image', ''),
            'rec_status': props.get('rec_status', True),
            'position': props.get('position', [0, 0, 0]),
            'rotation': props.get('rotation', [0, 0, 0]),
            'scale': props.get('scale', 1.0),
            'created_by': 1,
        }
        sphere_id = create_mental_sphere_zodb(root, mental_data)
        object.__setattr__(m, '_db_id', sphere_id)

        sphere_data = get_mental_sphere_zodb(root, sphere_id)
        created_mentals.append(sphere_data)
        label = props.get('name') or f'id={sphere_id}'
        log.append(f"Created Mental '{label}' (id: {sphere_id})")

    for mind_proxy in minds:
        props = mind_proxy._props
        mind_data = {
            'name': props.get('name', ''),
            'detail': props.get('detail', ''),
            'color': props.get('color', '#FFFFFF'),
            'rec_status': props.get('rec_status', True),
            'position': props.get('position', [0, 0, 0]),
            'rotation': props.get('rotation', [0, 0, 0]),
            'scale': props.get('scale', 1.0),
            'created_by': 1,
        }
        mind_id = create_mind_zodb(root, mind_data)
        object.__setattr__(mind_proxy, '_db_id', mind_id)

        appended = mind_proxy._mentals
        if appended:
            sphere_ids = [obj._db_id for obj in appended if obj._db_id is not None]
            if sphere_ids:
                add_mental_spheres_to_mind(root, mind_id, sphere_ids)
                log.append(
                    f"Linked Mental(s) {sphere_ids} to Mind '{props.get('name', '')}' (id: {mind_id})"
                )

        mind_obj = get_mind_zodb(root, mind_id)
        created_minds.append(mind_obj)
        label = props.get('name') or f'id={mind_id}'
        log.append(f"Created Mind '{label}' (id: {mind_id})")

    return {
        "created_minds": created_minds,
        "created_mentals": created_mentals,
        "execution_log": log,
        "summary": {
            "minds_created": len(created_minds),
            "mentals_created": len(created_mentals),
        }
    }
