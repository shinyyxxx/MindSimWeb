from datetime import datetime
import transaction

from zodb_module.objects import LifeObject, PhassaObject, SannaObject


def get_or_create_life(root):
    if hasattr(root, 'life') and root.life is not None:
        return root.life
    life = LifeObject(id=1, mind_id=None, created_at=datetime.now())
    root.life = life
    transaction.commit()
    return life


def set_life_mind(root, mind_id):
    life = get_or_create_life(root)
    life.set_mind_id(mind_id)
    transaction.commit()
    return life


def get_or_create_sanna(root, mind_id):
    if hasattr(root, 'sanna') and root.sanna is not None:
        root.sanna.mind_id = mind_id
        transaction.commit()
        return root.sanna
    sanna = SannaObject(id=1, mind_id=mind_id, created_at=datetime.now(),
                        name='Perception', detail='Recognizes and labels the object',
                        color='#60a5fa')
    root.sanna = sanna
    transaction.commit()
    return sanna


def get_or_create_phassa(root, mind_id, sanna_id):
    if hasattr(root, 'phassa') and root.phassa is not None:
        root.phassa.set_mind_id(mind_id)
        root.phassa.set_sanna_id(sanna_id)
        transaction.commit()
        return root.phassa
    phassa = PhassaObject(id=1, mind_id=mind_id, sanna_id=sanna_id, created_at=datetime.now(),
                          name='Contact', detail='Brings together sense organ, object, and consciousness',
                          color='#ff6b6b')
    root.phassa = phassa
    transaction.commit()
    return phassa
