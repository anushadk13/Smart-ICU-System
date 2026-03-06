from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc
from typing import List
from app.db.session import get_db
from app.models import database, schemas

router = APIRouter()

@router.get("/{patient_id}", response_model=List[schemas.VitalReading])
async def get_vitals(patient_id: int, limit: int = 100, db: AsyncSession = Depends(get_db)):
    query = select(database.VitalReading).where(
        database.VitalReading.patient_id == patient_id
    ).order_by(desc(database.VitalReading.timestamp)).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{patient_id}/latest", response_model=schemas.VitalReading)
async def get_latest_vital(patient_id: int, db: AsyncSession = Depends(get_db)):
    query = select(database.VitalReading).where(
        database.VitalReading.patient_id == patient_id
    ).order_by(desc(database.VitalReading.timestamp)).limit(1)
    result = await db.execute(query)
    vital = result.scalar_one_or_none()
    return vital
