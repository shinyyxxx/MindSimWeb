# MindSim Real-time Demo

Real-time Mind API using FastAPI + Redis + WebSocket + ZODB + PostGIS

## Architecture

```
Browser ←WebSocket→ FastAPI ←Pub/Sub→ Redis ←Subscribe→ Worker
                       ↓                          ↓
                   PostGIS                      ZODB
                 (Spatial)                   (Objects)
```

## Quick Start

```bash
docker-compose up --build
open http://localhost:8000
```

## Manual Setup

```bash
# Start PostgreSQL + PostGIS
docker run -d --name postgres -e POSTGRES_DB=mindsim_realtime \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgis/postgis:16-3.4

# Start Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Install dependencies
pip install -r requirements.txt

# Run backend
python main.py

# Run worker (separate terminal)
python worker.py
```

## API

### WebSocket: `/ws/{user_id}`

```json
{
  "action": "upsert_mind",
  "data": {
    "name": "My Mind",
    "detail": "Description",
    "color": "#00ff88",
    "position": [1.0, 2.0, 3.0],
    "rotation": [0, 0, 0],
    "scale": 1.5
  }
}
```

### REST

- `GET /api/minds` - List all minds
- `POST /api/get_mind` - Get minds by ID list
- `POST /api/upsert_mind` - Create/update mind

## Structure

```
realtime-demo/
├── main.py              # FastAPI + WebSocket
├── worker.py            # Background worker
├── docker-compose.yml
├── app/
│   ├── config.py
│   ├── database.py      # PostGIS operations
│   ├── mind_helpers.py  # ZODB operations
│   └── schemas.py
└── zodb_module/
    ├── zodb_management.py
    └── objects.py
```
