from fastapi import APIRouter, Request, Depends
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
import json
import asyncio
from app.db.session import get_db
from app.models import database

router = APIRouter()

@router.get("/stream/vitals/{patient_id}")
async def stream_vitals(
    request: Request, 
    patient_id: int,
    db: AsyncSession = Depends(get_db)
):
    async def event_generator():
        last_id = None
        max_duration = 50  # Vercel timeout protection (reconnect before 60s)
        start_time = asyncio.get_event_loop().time()
        
        try:
            while True:
                # Check connection
                if await request.is_disconnected():
                    break
                
                # Vercel timeout protection
                if asyncio.get_event_loop().time() - start_time > max_duration:
                    break
                
                # Fetch latest vital
                query = select(database.VitalReading).where(
                    database.VitalReading.patient_id == patient_id
                ).order_by(desc(database.VitalReading.timestamp)).limit(1)
                
                result = await db.execute(query)
                vital = result.scalar_one_or_none()
                
                if vital and vital.id != last_id:
                    # New data available
                    last_id = vital.id
                    
                    vital_data = {
                        "id": vital.id,
                        "patient_id": vital.patient_id,
                        "heart_rate": vital.heart_rate,
                        "bp_sys": vital.bp_sys,
                        "bp_dia": vital.bp_dia,
                        "resp_rate": vital.resp_rate,
                        "temperature": float(vital.temperature) if vital.temperature else None,
                        "spo2": vital.spo2,
                        "ecg_value": vital.ecg_value,
                        "timestamp": vital.timestamp.isoformat()
                    }
                    
                    yield {
                        "event": "message",
                        "data": json.dumps(vital_data),
                        "retry": 3000  # Client should retry after 3s if disconnected
                    }
                
                # Poll every 1 second for new data
                await asyncio.sleep(1)
                
        except Exception as e:
            # Send error event
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }
    
    return EventSourceResponse(event_generator())
