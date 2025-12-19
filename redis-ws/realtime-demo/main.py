import asyncio
import json
import uuid
from datetime import datetime
from typing import Dict
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import redis.asyncio as redis

from app.config import REDIS_URL, CHANNEL_MIND_UPDATES, CHANNEL_TASKS, CHANNEL_TASK_RESULTS
from app.schemas import (
    MindUpsert, GetMindRequest, GetMindResponse, 
    UpsertMindResponse, MindResponse, MentalSphereRequest, MentalSphereResponse
)
from app.mind_helpers import (
    get_mind_zodb, list_minds_zodb, 
    add_mental_spheres_to_mind, delete_mental_spheres_from_mind
)
from zodb_module.zodb_management import get_connection, init_zodb, close_zodb
from app.database import init_database


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.pending_requests: Dict[str, str] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"Client {user_id} connected. Total: {len(self.active_connections)}")
    
    def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)
        print(f"Client {user_id} disconnected. Total: {len(self.active_connections)}")
    
    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except Exception as e:
                print(f"Error sending to {user_id}: {e}")
                self.disconnect(user_id)
    
    async def broadcast(self, message: dict, exclude_user: str = None):
        disconnected = []
        for user_id, websocket in self.active_connections.items():
            if user_id != exclude_user:
                try:
                    await websocket.send_json(message)
                except Exception:
                    disconnected.append(user_id)
        for user_id in disconnected:
            self.disconnect(user_id)
    
    def register_request(self, request_id: str, user_id: str):
        self.pending_requests[request_id] = user_id
    
    def get_request_user(self, request_id: str) -> str:
        return self.pending_requests.pop(request_id, None)


manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting server...")
    init_zodb()
    
    try:
        init_database()
    except Exception as e:
        print(f"Database init warning: {e}")
    
    asyncio.create_task(redis_result_subscriber())
    
    yield
    
    print("Shutting down...")
    close_zodb()


app = FastAPI(
    title="MindSim Real-time API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def redis_result_subscriber():
    try:
        redis_client = redis.from_url(REDIS_URL)
        pubsub = redis_client.pubsub()
        await pubsub.subscribe(CHANNEL_TASK_RESULTS, CHANNEL_MIND_UPDATES)
        
        print(f"Subscribed to: {CHANNEL_TASK_RESULTS}, {CHANNEL_MIND_UPDATES}")
        
        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    channel = message["channel"].decode() if isinstance(message["channel"], bytes) else message["channel"]
                    
                    if channel == CHANNEL_TASK_RESULTS:
                        request_id = data.get("request_id")
                        user_id = manager.get_request_user(request_id)
                        
                        if user_id:
                            await manager.send_to_user(user_id, {
                                "type": "response",
                                "request_id": request_id,
                                "action": data.get("action"),
                                "status": data.get("status"),
                                "data": data.get("data"),
                                "error": data.get("error")
                            })
                        
                        if data.get("action") in ["upsert_mind", "append_mental", "remove_mental"] and data.get("status") == "success":
                            await manager.broadcast({
                                "type": "update",
                                "action": data.get("action"),
                                "data": data.get("data")
                            }, exclude_user=user_id)
                    
                    elif channel == CHANNEL_MIND_UPDATES:
                        await manager.broadcast({
                            "type": "update",
                            "action": "mind_updated",
                            "data": data
                        })
                        
                except json.JSONDecodeError:
                    print(f"Invalid JSON: {message['data']}")
                except Exception as e:
                    print(f"Error processing message: {e}")
                    
    except Exception as e:
        print(f"Redis subscriber error: {e}")


@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    
    try:
        redis_client = redis.from_url(REDIS_URL)
        
        while True:
            raw_data = await websocket.receive_text()
            message = json.loads(raw_data)
            
            action = message.get("action")
            data = message.get("data", {})
            request_id = message.get("request_id") or str(uuid.uuid4())
            
            manager.register_request(request_id, user_id)
            
            if action == "upsert_mind":
                preview_mind = {
                    "id": data.get("id") or "pending",
                    "name": data.get("name", ""),
                    "detail": data.get("detail", ""),
                    "color": data.get("color", "#FFFFFF"),
                    "rec_status": data.get("rec_status", True),
                    "position": data.get("position", [0, 0, 0]),
                    "rotation": data.get("rotation", [0, 0, 0]),
                    "scale": data.get("scale", 1.0),
                    "created_by": None,
                    "mental_sphere_ids": [],
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "_status": "saving"
                }
                await websocket.send_json({
                    "type": "preview",
                    "request_id": request_id,
                    "action": action,
                    "status": "saving",
                    "data": {"mind": preview_mind}
                })
            else:
                await websocket.send_json({
                    "type": "ack",
                    "request_id": request_id,
                    "action": action,
                    "status": "processing"
                })
            
            task = {
                "action": action,
                "data": data,
                "request_id": request_id,
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }
            
            await redis_client.publish(CHANNEL_TASKS, json.dumps(task))
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(user_id)


@app.post("/api/get_mind", response_model=GetMindResponse)
async def get_mind_endpoint(request: GetMindRequest):
    try:
        _, root = get_connection()
        minds = []
        
        for mind_id in request.mind_id_list:
            mind_data = get_mind_zodb(root, int(mind_id))
            if mind_data:
                minds.append(mind_data)
        
        return GetMindResponse(minds=minds, count=len(minds))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upsert_mind", response_model=UpsertMindResponse)
async def upsert_mind_endpoint(request: MindUpsert):
    from app.mind_helpers import create_mind_zodb, update_mind_zodb
    
    try:
        _, root = get_connection()
        
        mind_data = {
            'name': request.name,
            'detail': request.detail,
            'color': request.color,
            'rec_status': request.rec_status,
            'position': request.position,
            'rotation': request.rotation,
            'scale': request.scale,
            'created_by': 1
        }
        
        if request.id:
            mind_id = update_mind_zodb(root, request.id, mind_data)
        else:
            mind_id = create_mind_zodb(root, mind_data)
        
        mind = get_mind_zodb(root, mind_id)
        
        redis_client = redis.from_url(REDIS_URL)
        await redis_client.publish(CHANNEL_MIND_UPDATES, json.dumps(mind))
        await redis_client.close()
        
        return UpsertMindResponse(
            message="Mind saved successfully",
            mind=MindResponse(**mind)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/minds")
async def list_minds_endpoint():
    try:
        _, root = get_connection()
        minds = list_minds_zodb(root)
        return {"minds": minds, "count": len(minds)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/append_mental", response_model=MentalSphereResponse)
async def append_mental_endpoint(request: MentalSphereRequest):
    try:
        _, root = get_connection()
        
        mental_sphere_ids = add_mental_spheres_to_mind(
            root, request.mind_id, request.sphere_id
        )
        
        return MentalSphereResponse(
            message="Mental spheres added successfully",
            mind_id=request.mind_id,
            mental_sphere_ids=list(mental_sphere_ids)
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/remove_mental", response_model=MentalSphereResponse)
async def remove_mental_endpoint(request: MentalSphereRequest):
    try:
        _, root = get_connection()
        
        mental_sphere_ids = delete_mental_spheres_from_mind(
            root, request.mind_id, request.sphere_id
        )
        
        return MentalSphereResponse(
            message="Mental spheres removed successfully",
            mind_id=request.mind_id,
            mental_sphere_ids=list(mental_sphere_ids)
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/", response_class=HTMLResponse)
async def get_homepage():
    return """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MindSim Real-time</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Outfit:wght@400;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'IBM Plex Mono', monospace;
            background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0f1419 100%);
            min-height: 100vh;
            color: #e8e8e8;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 {
            font-family: 'Outfit', sans-serif;
            text-align: center;
            background: linear-gradient(90deg, #00d4ff, #00ff88);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .panel {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 20px;
        }
        .panel h2 {
            font-family: 'Outfit', sans-serif;
            color: #00d4ff;
            margin-bottom: 15px;
            font-size: 1.2rem;
        }
        .status {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 15px;
            padding: 10px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
        }
        .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #ff4444;
            animation: pulse 2s infinite;
        }
        .status-dot.connected { background: #00ff88; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .form-group { margin-bottom: 15px; }
        label { display: block; color: #888; margin-bottom: 5px; font-size: 0.85rem; }
        input, select {
            width: 100%;
            padding: 10px 15px;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #e8e8e8;
            font-family: inherit;
        }
        input:focus, select:focus { outline: none; border-color: #00d4ff; }
        .coords { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #00d4ff, #00ff88);
            border: none;
            border-radius: 8px;
            color: #0a0a0f;
            font-family: inherit;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0, 212, 255, 0.3); }
        .log-box {
            height: 300px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 8px;
            padding: 15px;
            font-size: 0.85rem;
        }
        .log-entry {
            margin-bottom: 10px;
            padding: 8px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 4px;
            border-left: 3px solid #00d4ff;
        }
        .log-entry.received { border-left-color: #00ff88; }
        .log-entry.error { border-left-color: #ff4444; }
        .log-time { color: #666; font-size: 0.75rem; }
        .minds-list { max-height: 400px; overflow-y: auto; }
        .mind-card {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            border-left: 4px solid;
        }
        .mind-card h3 { margin-bottom: 5px; }
        .mind-card .detail { color: #888; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>MindSim Real-time</h1>
        
        <div class="status">
            <div class="status-dot" id="statusDot"></div>
            <span id="statusText">Connecting...</span>
        </div>
        
        <div class="grid">
            <div class="panel">
                <h2>Create/Update Mind</h2>
                <form id="mindForm">
                    <div class="form-group">
                        <label>ID (leave empty for new)</label>
                        <input type="number" id="mindId" placeholder="Leave empty to create new">
                    </div>
                    <div class="form-group">
                        <label>Name *</label>
                        <input type="text" id="mindName" placeholder="Mind name" required>
                    </div>
                    <div class="form-group">
                        <label>Detail</label>
                        <input type="text" id="mindDetail" placeholder="Description">
                    </div>
                    <div class="form-group">
                        <label>Color</label>
                        <input type="color" id="mindColor" value="#00d4ff">
                    </div>
                    <div class="form-group">
                        <label>Position (X, Y, Z)</label>
                        <div class="coords">
                            <input type="number" id="posX" value="0" step="0.1">
                            <input type="number" id="posY" value="0" step="0.1">
                            <input type="number" id="posZ" value="0" step="0.1">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Rotation (X, Y, Z)</label>
                        <div class="coords">
                            <input type="number" id="rotX" value="0" step="0.1">
                            <input type="number" id="rotY" value="0" step="0.1">
                            <input type="number" id="rotZ" value="0" step="0.1">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Scale</label>
                        <input type="number" id="mindScale" value="1.0" step="0.1">
                    </div>
                    <button type="submit">Save Mind</button>
                </form>
            </div>
            
            <div class="panel">
                <h2>Minds List</h2>
                <button onclick="loadMinds()" style="margin-bottom: 15px;">Refresh List</button>
                <div class="minds-list" id="mindsList">
                    <p style="color: #666;">Click refresh to load minds</p>
                </div>
            </div>
        </div>
        
        <div class="panel" style="margin-top: 20px;">
            <h2>WebSocket Log</h2>
            <div class="log-box" id="logBox"></div>
        </div>
    </div>
    
    <script>
        const userId = 'user_' + Math.floor(Math.random() * 10000);
        let ws;
        
        function connect() {
            ws = new WebSocket(`ws://${window.location.host}/ws/${userId}`);
            
            ws.onopen = () => {
                document.getElementById('statusDot').classList.add('connected');
                document.getElementById('statusText').textContent = `Connected as ${userId}`;
                addLog('Connected to server', 'sent');
                loadMinds();
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                addLog(JSON.stringify(data, null, 2), 'received');
                
                // Handle preview (optimistic update - shows data BEFORE saved to DB)
                if (data.type === 'preview' && data.data?.mind) {
                    const mind = data.data.mind;
                    const listDiv = document.getElementById('mindsList');
                    
                    // Remove "no minds" message if present
                    const noMindsMsg = listDiv.querySelector('p');
                    if (noMindsMsg) noMindsMsg.remove();
                    
                    // Create preview card with "saving" indicator
                    const previewCard = document.createElement('div');
                    previewCard.className = 'mind-card';
                    previewCard.id = 'preview-' + data.request_id;
                    previewCard.style.borderLeftColor = mind.color;
                    previewCard.style.opacity = '0.6';
                    previewCard.innerHTML = 
                        '<h3>' + mind.name + ' <span style="color: #ffc800; font-size: 0.8rem;">(saving...)</span></h3>' +
                        '<div class="detail">ID: pending | ' + (mind.detail || 'No description') + '</div>' +
                        '<div class="detail">Position: [' + mind.position.map(p => p.toFixed(1)).join(', ') + ']</div>' +
                        '<div class="detail">Scale: ' + mind.scale + '</div>';
                    listDiv.insertBefore(previewCard, listDiv.firstChild);
                }
                
                // Handle confirmed response (replace preview with real data)
                if (data.type === 'response' && data.status === 'success') {
                    const previewCard = document.getElementById('preview-' + data.request_id);
                    if (previewCard) previewCard.remove();
                    loadMinds();
                }
                
                if (data.type === 'update') {
                    loadMinds();
                }
            };
            
            ws.onclose = () => {
                document.getElementById('statusDot').classList.remove('connected');
                document.getElementById('statusText').textContent = 'Disconnected - Reconnecting...';
                addLog('Disconnected', 'error');
                setTimeout(connect, 2000);
            };
        }
        
        function addLog(message, type = 'sent') {
            const logBox = document.getElementById('logBox');
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.innerHTML = `<div class="log-time">${new Date().toLocaleTimeString()}</div><pre style="margin: 5px 0; white-space: pre-wrap;">${message}</pre>`;
            logBox.insertBefore(entry, logBox.firstChild);
        }
        
        document.getElementById('mindForm').onsubmit = (e) => {
            e.preventDefault();
            const mindId = document.getElementById('mindId').value;
            const data = {
                name: document.getElementById('mindName').value,
                detail: document.getElementById('mindDetail').value,
                color: document.getElementById('mindColor').value,
                position: [
                    parseFloat(document.getElementById('posX').value),
                    parseFloat(document.getElementById('posY').value),
                    parseFloat(document.getElementById('posZ').value)
                ],
                rotation: [
                    parseFloat(document.getElementById('rotX').value),
                    parseFloat(document.getElementById('rotY').value),
                    parseFloat(document.getElementById('rotZ').value)
                ],
                scale: parseFloat(document.getElementById('mindScale').value),
                rec_status: true
            };
            if (mindId) data.id = parseInt(mindId);
            ws.send(JSON.stringify({ action: 'upsert_mind', data: data, request_id: 'req_' + Date.now() }));
            addLog('Sent: upsert_mind', 'sent');
        };
        
        async function loadMinds() {
            try {
                const response = await fetch('/api/minds');
                const data = await response.json();
                const listDiv = document.getElementById('mindsList');
                if (data.minds.length === 0) {
                    listDiv.innerHTML = '<p style="color: #666;">No minds yet. Create one!</p>';
                    return;
                }
                listDiv.innerHTML = data.minds.map(mind => `
                    <div class="mind-card" style="border-left-color: ${mind.color}">
                        <h3>${mind.name}</h3>
                        <div class="detail">ID: ${mind.id} | ${mind.detail || 'No description'}</div>
                        <div class="detail">Position: [${mind.position.map(p => p.toFixed(1)).join(', ')}]</div>
                        <div class="detail">Scale: ${mind.scale}</div>
                    </div>
                `).join('');
            } catch (e) {
                console.error('Error loading minds:', e);
            }
        }
        
        connect();
    </script>
</body>
</html>
"""


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
