import httpx
import os
from app.db.session import AsyncSessionLocal
from app.models import database, schemas
from typing import Dict

ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://ml-service:8001")

async def analyze_vitals(vitals_data: Dict):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{ML_SERVICE_URL}/predict", json=vitals_data)
            if response.status_code == 200:
                ml_result = response.json()
                
                # If high risk or anomaly, generate an alert
                if ml_result['risk_level'] == "High" or ml_result['is_anomaly']:
                    await generate_alert(
                        vitals_data['patient_id'],
                        "Anomaly Detected",
                        ml_result['risk_level'],
                        f"Machine learning detected {ml_result['risk_level']} risk condition."
                    )
                return ml_result
        except Exception as e:
            print(f"Error calling ML service: {e}")
            return None

async def generate_alert(patient_id: int, alert_type: str, severity: str, message: str):
    async with AsyncSessionLocal() as db:
        alert = database.Alert(
            patient_id=patient_id,
            type=alert_type,
            severity=severity,
            message=message
        )
        db.add(alert)
        await db.commit()
