from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse
import redis
import os
import json
import asyncio

router = APIRouter()

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_client = redis.from_url(REDIS_URL)

@router.get("/stream/vitals/{patient_id}")
async def stream_vitals(request: Request, patient_id: int):
    async def event_generator():
        pubsub = redis_client.pubsub()
        pubsub.subscribe(f"vitals:{patient_id}")
        
        try:
            while True:
                # If client closes connection, stop the generator
                if await request.is_disconnected():
                    break
                
                # Check for messages in Redis pub/sub
                message = pubsub.get_message(ignore_subscribe_messages=True)
                if message:
                    yield {
                        "event": "message",
                        "data": message['data'].decode()
                    }
                
                await asyncio.sleep(0.1) # Prevent CPU hogging
        finally:
            pubsub.unsubscribe(f"vitals:{patient_id}")
            pubsub.close()

    return EventSourceResponse(event_generator())
