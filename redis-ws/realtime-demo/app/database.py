"""
PostgreSQL + PostGIS spatial data operations
"""

import psycopg
from psycopg.rows import dict_row
from contextlib import contextmanager
from app.config import DATABASE_URL, SRID_3D


@contextmanager
def get_db_connection():
    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    try:
        yield conn
    finally:
        conn.close()


def init_database():
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
            
            cur.execute("""
                CREATE TABLE IF NOT EXISTS mentalsphere_spatial_data (
                    id SERIAL PRIMARY KEY,
                    position geometry(PointZ, 4979),
                    rotation geometry(PointZ, 4979),
                    scale FLOAT DEFAULT 1.0,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """)
            
            cur.execute("""
                CREATE TABLE IF NOT EXISTS mind_spatial_data (
                    id SERIAL PRIMARY KEY,
                    position geometry(PointZ, 4979),
                    rotation geometry(PointZ, 4979),
                    scale FLOAT DEFAULT 1.0,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                );
            """)
            
            conn.commit()
            print("Database tables initialized")


def create_spatial_data(position=None, rotation=None, scale=None, object_type='mentalsphere'):
    if position is None:
        position = [0, 0, 0]
    if rotation is None:
        rotation = [0, 0, 0]
    if scale is None:
        scale = 1.0
    
    table_name = f"{object_type}_spatial_data"
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(f"""
                INSERT INTO {table_name} (position, rotation, scale, created_at, updated_at)
                VALUES (
                    ST_GeomFromEWKT(%s),
                    ST_GeomFromEWKT(%s),
                    %s,
                    NOW(),
                    NOW()
                )
                RETURNING id
            """, [
                f'SRID={SRID_3D};POINT Z({position[0]} {position[1]} {position[2]})',
                f'SRID={SRID_3D};POINT Z({rotation[0]} {rotation[1]} {rotation[2]})',
                scale
            ])
            spatial_id = cur.fetchone()['id']
            conn.commit()
    
    return spatial_id


def update_spatial_data(spatial_id, position=None, rotation=None, scale=None, object_type='mentalsphere'):
    table_name = f"{object_type}_spatial_data"
    
    pos_wkt = (
        f"SRID={SRID_3D};POINT Z({position[0]} {position[1]} {position[2]})"
        if position is not None
        else None
    )
    rot_wkt = (
        f"SRID={SRID_3D};POINT Z({rotation[0]} {rotation[1]} {rotation[2]})"
        if rotation is not None
        else None
    )
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(f"""
                UPDATE {table_name}
                SET
                    position = COALESCE(ST_GeomFromEWKT(%s), position),
                    rotation = COALESCE(ST_GeomFromEWKT(%s), rotation),
                    scale = COALESCE(%s, scale),
                    updated_at = NOW()
                WHERE id = %s
            """, [pos_wkt, rot_wkt, scale, spatial_id])
            conn.commit()


def get_spatial_data(spatial_id, object_type='mentalsphere'):
    table_name = f"{object_type}_spatial_data"
    
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT ST_AsEWKT(position) as position, ST_AsEWKT(rotation) as rotation, scale
                FROM {table_name}
                WHERE id = %s
            """, [spatial_id])
            result = cur.fetchone()
            
            if not result:
                return None
            
            position_ewkt = result['position']
            rotation_ewkt = result['rotation']
            scale = result['scale']
            
            position_coords = [float(c) for c in position_ewkt.split('(')[1].rstrip(')').split()]
            rotation_coords = [float(c) for c in rotation_ewkt.split('(')[1].rstrip(')').split()]
            
            return {
                'position': position_coords,
                'rotation': rotation_coords,
                'scale': float(scale)
            }
