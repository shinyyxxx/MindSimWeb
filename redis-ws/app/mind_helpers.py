from datetime import datetime
from persistent.mapping import PersistentMapping
import transaction

from zodb_module.zodb_management import get_connection
from zodb_module.objects import MindObject, MentalSphereObject
from app.database import create_spatial_data, update_spatial_data, get_spatial_data


def get_mind_id(root):
    if not hasattr(root, 'minds') or not root.minds:
        return 1
    existing_ids = [int(key) for key in root.minds.keys() if str(key).isdigit()]
    return max(existing_ids) + 1 if existing_ids else 1


def create_mind_zodb(root, mind_data):
    try:
        if not hasattr(root, 'minds'):
            root.minds = PersistentMapping()
        
        mind_id = get_mind_id(root)
        current_date = datetime.now()
        
        spatial_data_id = create_spatial_data(
            position=mind_data.get('position', [0, 0, 0]),
            rotation=mind_data.get('rotation', [0, 0, 0]),
            scale=mind_data.get('scale', 1.0),
            object_type='mind'
        )
        
        root.minds[mind_id] = MindObject(
            id=mind_id,
            name=mind_data.get('name', ''),
            detail=mind_data.get('detail', ''),
            color=mind_data.get('color', '#FFFFFF'),
            spatial_data_id=spatial_data_id,
            rec_status=mind_data.get('rec_status', True),
            created_by=mind_data.get('created_by'),
            mental_sphere_ids=mind_data.get('mental_sphere_ids', []),
            created_at=current_date
        )
        
        transaction.commit()
        return mind_id
    except Exception:
        transaction.abort()
        raise


def update_mind_zodb(root, mind_id, mind_data):
    try:
        if not hasattr(root, 'minds'):
            root.minds = PersistentMapping()
        
        if mind_id not in root.minds:
            raise ValueError(f"Mind with ID {mind_id} not found")
        
        mind = root.minds[mind_id]
        
        if 'name' in mind_data:
            mind.set_name(mind_data['name'])
        if 'detail' in mind_data:
            mind.set_detail(mind_data['detail'])
        if 'color' in mind_data:
            mind.set_color(mind_data['color'])
        if 'rec_status' in mind_data:
            mind.set_rec_status(mind_data['rec_status'])
        
        if 'position' in mind_data or 'rotation' in mind_data or 'scale' in mind_data:
            update_spatial_data(
                mind.get_spatial_data_id(),
                position=mind_data.get('position'),
                rotation=mind_data.get('rotation'),
                scale=mind_data.get('scale'),
                object_type='mind'
            )
        
        mind.set_updated_at(datetime.now())
        transaction.commit()
        return mind_id
    except Exception:
        transaction.abort()
        raise


def get_mind_zodb(root, mind_id):
    if not hasattr(root, 'minds') or mind_id not in root.minds:
        return None
    
    mind = root.minds[mind_id]
    mind_spatial = get_spatial_data(mind.get_spatial_data_id(), object_type='mind')
    
    if not mind_spatial:
        mind_spatial = {'position': [0, 0, 0], 'rotation': [0, 0, 0], 'scale': 1.0}
    
    return {
        'id': mind.get_id(),
        'name': mind.get_name(),
        'detail': mind.get_detail(),
        'color': mind.get_color(),
        'rec_status': mind.get_rec_status(),
        'position': mind_spatial['position'],
        'rotation': mind_spatial['rotation'],
        'scale': mind_spatial['scale'],
        'created_by': mind.get_created_by(),
        'mental_sphere_ids': mind.get_mental_sphere_ids(),
        'created_at': mind.get_created_at().isoformat() if mind.get_created_at() else None,
        'updated_at': mind.get_updated_at().isoformat() if mind.get_updated_at() else None
    }


def list_minds_zodb(root, user_id=None):
    if not hasattr(root, 'minds') or not root.minds:
        return []
    
    minds = []
    for mind_id in root.minds.keys():
        mind = root.minds[mind_id]
        if user_id is None or mind.get_created_by() == user_id:
            mind_data = get_mind_zodb(root, mind_id)
            if mind_data:
                minds.append(mind_data)
    
    return minds


def add_mental_spheres_to_mind(root, mind_id, sphere_ids):
    try:
        if not hasattr(root, 'minds') or mind_id not in root.minds:
            raise ValueError(f"Mind with ID {mind_id} not found")
        
        mind = root.minds[mind_id]
        
        for sphere_id in sphere_ids:
            mind.add_mental_sphere(sphere_id)
        
        mind.set_updated_at(datetime.now())
        transaction.commit()
        return mind.get_mental_sphere_ids()
    except Exception:
        transaction.abort()
        raise


def delete_mental_spheres_from_mind(root, mind_id, sphere_ids):
    try:
        if not hasattr(root, 'minds') or mind_id not in root.minds:
            raise ValueError(f"Mind with ID {mind_id} not found")
        
        mind = root.minds[mind_id]
        
        for sphere_id in sphere_ids:
            mind.remove_mental_sphere(sphere_id)
        
        mind.set_updated_at(datetime.now())
        transaction.commit()
        return mind.get_mental_sphere_ids()
    except Exception:
        transaction.abort()
        raise


def get_mental_sphere_id(root):
    if not hasattr(root, 'mental_spheres') or not root.mental_spheres:
        return 1
    existing_ids = [int(key) for key in root.mental_spheres.keys() if str(key).isdigit()]
    return max(existing_ids) + 1 if existing_ids else 1


def create_mental_sphere_zodb(root, mental_data):
    try:
        if not hasattr(root, 'mental_spheres'):
            root.mental_spheres = PersistentMapping()
        
        sphere_id = get_mental_sphere_id(root)
        current_date = datetime.now()
        
        spatial_data_id = create_spatial_data(
            position=mental_data.get('position', [0, 0, 0]),
            rotation=mental_data.get('rotation', [0, 0, 0]),
            scale=mental_data.get('scale', 1.0),
            object_type='mentalsphere'
        )
        
        root.mental_spheres[sphere_id] = MentalSphereObject(
            id=sphere_id,
            name=mental_data.get('name', ''),
            detail=mental_data.get('detail', ''),
            color=mental_data.get('color', '#FFFFFF'),
            image=mental_data.get('image', ''),
            rec_status=mental_data.get('rec_status', True),
            spatial_data_id=spatial_data_id,
            created_by=mental_data.get('created_by'),
            created_at=current_date
        )
        
        transaction.commit()
        return sphere_id
    except Exception:
        transaction.abort()
        raise


def update_mental_sphere_zodb(root, sphere_id, mental_data):
    try:
        if not hasattr(root, 'mental_spheres'):
            root.mental_spheres = PersistentMapping()
        
        if sphere_id not in root.mental_spheres:
            raise ValueError(f"Mental sphere with ID {sphere_id} not found")
        
        sphere = root.mental_spheres[sphere_id]
        
        if 'name' in mental_data:
            sphere.set_name(mental_data['name'])
        if 'detail' in mental_data:
            sphere.set_detail(mental_data['detail'])
        if 'color' in mental_data:
            sphere.set_color(mental_data['color'])
        if 'image' in mental_data:
            sphere.set_image(mental_data['image'])
        if 'rec_status' in mental_data:
            sphere.set_rec_status(mental_data['rec_status'])
        
        if 'position' in mental_data or 'rotation' in mental_data or 'scale' in mental_data:
            update_spatial_data(
                sphere.get_spatial_data_id(),
                position=mental_data.get('position'),
                rotation=mental_data.get('rotation'),
                scale=mental_data.get('scale'),
                object_type='mentalsphere'
            )
        
        sphere.set_updated_at(datetime.now())
        transaction.commit()
        return sphere_id
    except Exception:
        transaction.abort()
        raise


def get_mental_sphere_zodb(root, sphere_id):
    if not hasattr(root, 'mental_spheres') or sphere_id not in root.mental_spheres:
        return None
    
    sphere = root.mental_spheres[sphere_id]
    sphere_spatial = get_spatial_data(sphere.get_spatial_data_id(), object_type='mentalsphere')
    
    if not sphere_spatial:
        sphere_spatial = {'position': [0, 0, 0], 'rotation': [0, 0, 0], 'scale': 1.0}
    
    return {
        'id': sphere.get_id(),
        'name': sphere.get_name(),
        'detail': sphere.get_detail(),
        'color': sphere.get_color(),
        'image': sphere.get_image(),
        'rec_status': sphere.get_rec_status(),
        'position': sphere_spatial['position'],
        'rotation': sphere_spatial['rotation'],
        'scale': sphere_spatial['scale'],
        'created_by': sphere.get_created_by(),
        'created_at': sphere.get_created_at().isoformat() if sphere.get_created_at() else None,
        'updated_at': sphere.get_updated_at().isoformat() if sphere.get_updated_at() else None
    }
