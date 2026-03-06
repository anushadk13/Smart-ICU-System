from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.db.session import get_db
from app.models import database, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Patient])
async def get_patients(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(database.Patient))
    return result.scalars().all()

@router.get("/{patient_id}", response_model=schemas.Patient)
async def get_patient(patient_id: int, db: AsyncSession = Depends(get_db)):
    patient = await db.get(database.Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.post("/", response_model=schemas.Patient)
async def create_patient(patient: schemas.PatientCreate, db: AsyncSession = Depends(get_db)):
    db_patient = database.Patient(**patient.model_dump())
    db.add(db_patient)
    await db.commit()
    await db.refresh(db_patient)
    return db_patient
