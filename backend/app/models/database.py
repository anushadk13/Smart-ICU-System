from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    age = Column(Integer)
    gender = Column(String)
    bed_number = Column(String)
    status = Column(String, default="Stable")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class VitalReading(Base):
    __tablename__ = "vitals"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    heart_rate = Column(Float)
    bp_sys = Column(Float)
    bp_dia = Column(Float)
    spo2 = Column(Float)
    temperature = Column(Float)
    resp_rate = Column(Float)
    ecg_value = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    type = Column(String)
    severity = Column(String)
    message = Column(String)
    acknowledged = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
