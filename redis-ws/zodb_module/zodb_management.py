"""
ZODB Connection Management
"""

import os
import ZODB
import ZODB.FileStorage
from ZODB.blob import BlobStorage

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZODB_DIR = os.path.join(BASE_DIR, 'zodb_data')
BLOB_DIR = os.path.join(ZODB_DIR, 'blobs')

os.makedirs(ZODB_DIR, exist_ok=True)
os.makedirs(BLOB_DIR, exist_ok=True)

ZODB_FILE = os.path.join(ZODB_DIR, 'zodb.fs')

file_storage = None
storage = None
db = None


def init_zodb():
    global file_storage, storage, db
    
    if db is None:
        file_storage = ZODB.FileStorage.FileStorage(ZODB_FILE)
        storage = BlobStorage(BLOB_DIR, file_storage)
        db = ZODB.DB(storage)
    
    return db


def get_connection():
    global db
    
    if db is None:
        init_zodb()
    
    connection = db.open()
    root = connection.root()
    return connection, root


def close_zodb():
    global file_storage, storage, db
    
    if db is not None:
        db.close()
    if storage is not None:
        storage.close()
    if file_storage is not None:
        file_storage.close()
    
    db = None
    storage = None
    file_storage = None
