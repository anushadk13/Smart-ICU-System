from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.session import get_db
from app.models import database, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Alert])
async def get_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(database.Alert).order_by(database.Alert.timestamp.desc()))
    return result.scalars().all()

@router.patch("/{alert_id}/acknowledge", response_model=schemas.Alert)
async def acknowledge_alert(alert_id: int, db: AsyncSession = Depends(get_db)):
    alert = await db.get(database.Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged = True
    await db.commit()
    await db.refresh(alert)
    return alert
