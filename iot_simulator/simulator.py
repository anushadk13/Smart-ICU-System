import json
import time
import random
import paho.mqtt.client as mqtt
import os

MQTT_HOST = os.getenv("MQTT_HOST", "mqtt-broker")
PATIENTS = [1, 2, 3, 4, 5]

def generate_vitals(patient_id):
    # Base values
    hr = random.normalvariate(75, 5)
    bp_sys = random.normalvariate(120, 10)
    bp_dia = random.normalvariate(80, 5)
    spo2 = random.normalvariate(98, 1)
    temp = random.normalvariate(37, 0.2)
    resp = random.normalvariate(16, 2)
    ecg = random.uniform(-1, 1)

    # Occasional anomalies for demo
    if random.random() < 0.05:
        if random.choice([True, False]):
            spo2 -= 5 # Drop in oxygen
        else:
            hr += 30 # Spike in heart rate

    return {
        "patient_id": patient_id,
        "heart_rate": round(hr, 1),
        "bp_sys": round(bp_sys, 1),
        "bp_dia": round(bp_dia, 1),
        "spo2": round(max(0, min(100, spo2)), 1),
        "temperature": round(temp, 1),
        "resp_rate": round(resp, 1),
        "ecg_value": round(ecg, 3)
    }

def main():
    client = mqtt.Client()
    client.connect(MQTT_HOST, 1883, 60)
    
    print(f"Simulator started, publishing to {MQTT_HOST}...")
    
    while True:
        for pid in PATIENTS:
            vitals = generate_vitals(pid)
            client.publish(f"icu/vitals/{pid}", json.dumps(vitals))
            print(f"Published vitals for Patient {pid}")
        time.sleep(2)

if __name__ == "__main__":
    main()
