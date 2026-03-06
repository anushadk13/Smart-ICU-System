import json
import os
import paho.mqtt.client as mqtt
import redis
from app.db.session import AsyncSessionLocal
from app.models import database
from app.services.alert_engine import analyze_vitals
import asyncio
from typing import Dict

MQTT_HOST = os.getenv("MQTT_HOST", "mqtt-broker")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

redis_client = redis.from_url(REDIS_URL)
main_loop = None

async def process_message(message_data):
    # Save to database
    try:
        async with AsyncSessionLocal() as db:
            vital = database.VitalReading(**message_data)
            db.add(vital)
            await db.commit()
        
        # Analyze with ML and potentially alert
        await analyze_vitals(message_data)
        
        # Publish to Redis for WebSockets
        patient_id = message_data.get("patient_id")
        redis_client.publish(f"vitals:{patient_id}", json.dumps(message_data))
    except Exception as e:
        print(f"Error in process_message: {e}")

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT broker with result code {rc}")
    client.subscribe("icu/vitals/#")

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        if main_loop:
            asyncio.run_coroutine_threadsafe(process_message(data), main_loop)
    except Exception as e:
        print(f"Error processing MQTT message: {e}")

def start_mqtt(loop):
    global main_loop
    main_loop = loop
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_HOST, 1883, 60)
    client.loop_start()
