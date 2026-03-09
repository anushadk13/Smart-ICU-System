import json
import os
import paho.mqtt.client as mqtt
try:
    import redis
except ImportError:
    redis = None
from app.db.session import AsyncSessionLocal
from app.models import database
from app.services.alert_engine import analyze_vitals
import asyncio
from typing import Dict

MQTT_HOST = os.getenv("MQTT_HOST", "mqtt-broker")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

if redis:
    redis_client = redis.from_url(REDIS_URL)
else:
    redis_client = None
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
        
        # Publish to Redis for WebSockets (if available)
        if redis_client:
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
    
    # Handle Paho MQTT 2.0+ Callback API Version
    try:
        # Version 2.0+ requirement
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
    except AttributeError:
        # Fallback for version 1.x
        client = mqtt.Client()

    client.on_connect = on_connect
    client.on_message = on_message
    
    try:
        print(f"Connecting to MQTT broker at {MQTT_HOST}...")
        client.connect(MQTT_HOST, 1883, 60)
        client.loop_start()
    except Exception as e:
        print(f"Failed to connect to MQTT broker: {e}")
        # In serverless environments, we don't want to crash the whole app
        print("Continuing without MQTT listener...")
