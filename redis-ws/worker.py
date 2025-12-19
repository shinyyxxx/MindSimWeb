import asyncio
import json
import httpx
import redis.asyncio as redis

import os
from app.config import REDIS_URL, CHANNEL_TASKS, CHANNEL_TASK_RESULTS

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")


async def process_task(task: dict, http_client: httpx.AsyncClient) -> dict:
    action = task.get("action")
    data = task.get("data", {})
    request_id = task.get("request_id")
    
    print(f"Processing: {action} (request_id: {request_id})")
    
    try:
        if action == "upsert_mind":
            response = await http_client.post(
                f"{BACKEND_URL}/api/upsert_mind",
                json=data,
                timeout=30.0
            )
            result = response.json()
            
            if response.status_code == 200:
                print(f"  {result.get('message')} (id: {result['mind']['id']})")
                return {
                    "status": "success",
                    "action": action,
                    "request_id": request_id,
                    "data": result
                }
            else:
                return {
                    "status": "error",
                    "action": action,
                    "request_id": request_id,
                    "error": result.get("detail", "Unknown error")
                }
        
        elif action == "get_mind":
            response = await http_client.post(
                f"{BACKEND_URL}/api/get_mind",
                json={"mind_id_list": data.get("mind_id_list", [])},
                timeout=30.0
            )
            result = response.json()
            
            if response.status_code == 200:
                print(f"  Found {result['count']} minds")
                return {
                    "status": "success",
                    "action": action,
                    "request_id": request_id,
                    "data": result
                }
            else:
                return {
                    "status": "error",
                    "action": action,
                    "request_id": request_id,
                    "error": result.get("detail", "Unknown error")
                }
        
        elif action == "list_minds":
            response = await http_client.get(
                f"{BACKEND_URL}/api/minds",
                timeout=30.0
            )
            result = response.json()
            
            if response.status_code == 200:
                print(f"  Listed {result['count']} minds")
                return {
                    "status": "success",
                    "action": action,
                    "request_id": request_id,
                    "data": result
                }
            else:
                return {
                    "status": "error",
                    "action": action,
                    "request_id": request_id,
                    "error": result.get("detail", "Unknown error")
                }
        
        elif action == "append_mental":
            response = await http_client.post(
                f"{BACKEND_URL}/api/append_mental",
                json={
                    "mind_id": data.get("mind_id"),
                    "sphere_id": data.get("sphere_id", [])
                },
                timeout=30.0
            )
            result = response.json()
            
            if response.status_code == 200:
                print(f"  Added spheres to mind {result['mind_id']}")
                return {
                    "status": "success",
                    "action": action,
                    "request_id": request_id,
                    "data": result
                }
            else:
                return {
                    "status": "error",
                    "action": action,
                    "request_id": request_id,
                    "error": result.get("detail", "Unknown error")
                }
        
        elif action == "remove_mental":
            response = await http_client.post(
                f"{BACKEND_URL}/api/remove_mental",
                json={
                    "mind_id": data.get("mind_id"),
                    "sphere_id": data.get("sphere_id", [])
                },
                timeout=30.0
            )
            result = response.json()
            
            if response.status_code == 200:
                print(f"  Removed spheres from mind {result['mind_id']}")
                return {
                    "status": "success",
                    "action": action,
                    "request_id": request_id,
                    "data": result
                }
            else:
                return {
                    "status": "error",
                    "action": action,
                    "request_id": request_id,
                    "error": result.get("detail", "Unknown error")
                }
        
        else:
            return {
                "status": "error",
                "action": action,
                "request_id": request_id,
                "error": f"Unknown action: {action}"
            }
            
    except Exception as e:
        print(f"  Error: {e}")
        return {
            "status": "error",
            "action": action,
            "request_id": request_id,
            "error": str(e)
        }


async def worker_main():
    print("MindSim Background Worker")
    print("=" * 40)
    
    try:
        redis_client = redis.from_url(REDIS_URL)
        pubsub = redis_client.pubsub()
        
        await pubsub.subscribe(CHANNEL_TASKS)
        print(f"Subscribed to: {CHANNEL_TASKS}")
        print("Waiting for tasks...\n")
        
        async with httpx.AsyncClient() as http_client:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    try:
                        task = json.loads(message["data"])
                        result = await process_task(task, http_client)
                        
                        await redis_client.publish(CHANNEL_TASK_RESULTS, json.dumps(result))
                        print(f"Result published for: {result.get('request_id')}\n")
                        
                    except json.JSONDecodeError:
                        print(f"Invalid JSON: {message['data']}")
                    except Exception as e:
                        print(f"Error: {e}")
                    
    except redis.ConnectionError:
        print("Could not connect to Redis. Is it running?")
    except KeyboardInterrupt:
        print("\nWorker shutting down...")
    finally:
        await pubsub.unsubscribe(CHANNEL_TASKS)
        await redis_client.close()


if __name__ == "__main__":
    asyncio.run(worker_main())
