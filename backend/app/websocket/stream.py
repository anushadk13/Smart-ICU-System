from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import redis
import os
import json
import asyncio

router = APIRouter()
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_client = redis.from_url(REDIS_URL)

@router.websocket("/ws/vitals/{patient_id}")
async def websocket_endpoint(websocket: WebSocket, patient_id: int):
    await websocket.accept()
    pubsub = redis_client.pubsub()
    pubsub.subscribe(f"vitals:{patient_id}")
    
    try:
        while True:
            # Check for messages in Redis pub/sub
            message = pubsub.get_message(ignore_subscribe_messages=True)
            if message:
                await websocket.send_text(message['data'].decode())
            await asyncio.sleep(0.1) # Small sleep to prevent CPU hogging
    except WebSocketDisconnect:
        pubsub.unsubscribe(f"vitals:{patient_id}")
        await websocket.close()
