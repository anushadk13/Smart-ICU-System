from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class VitalReadingBase(BaseModel):
    patient_id: int
    heart_rate: float
    bp_sys: float
    bp_dia: float
    spo2: float
    temperature: float
    resp_rate: float
    ecg_value: float

class VitalReadingCreate(VitalReadingBase):
    pass

class VitalReading(VitalReadingBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    name: str
    age: int
    gender: str
    bed_number: str
    status: str = "Stable"

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    patient_id: int
    type: str
    severity: str
    message: str

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: int
    timestamp: datetime
    acknowledged: bool = False

    class Config:
        from_attributes = True
