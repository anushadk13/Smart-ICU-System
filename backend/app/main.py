from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import patients, vitals, alerts, auth
from app.websocket import stream
from app.services.mqtt_listener import start_mqtt
from app.db.session import init_db
import asyncio

app = FastAPI(title="Smart ICU API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(patients.router, prefix="/api/patients", tags=["patients"])
app.include_router(vitals.router, prefix="/api/vitals", tags=["vitals"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(stream.router, tags=["websocket"])

@app.on_event("startup")
async def startup_event():
    # Wait for database to be ready
    import time
    from sqlalchemy.exc import OperationalError
    
    retries = 5
    while retries > 0:
        try:
            await init_db()
            break
        except Exception as e:
            print(f"Database not ready, retrying... ({retries} left). Error: {e}")
            await asyncio.sleep(2)
            retries -= 1

    from app.models.database import Patient
    from app.db.session import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        from sqlalchemy.future import select
        result = await db.execute(select(Patient))
        if not result.scalars().first():
            patients = [
                Patient(name="John Doe", age=65, gender="Male", bed_number="A1", status="Stable"),
                Patient(name="Jane Smith", age=72, gender="Female", bed_number="A2", status="Critical"),
                Patient(name="Robert Brown", age=58, gender="Male", bed_number="B1", status="Stable"),
                Patient(name="Emily Davis", age=45, gender="Female", bed_number="B2", status="Recovering"),
                Patient(name="Michael Wilson", age=80, gender="Male", bed_number="C1", status="Stable"),
            ]
            db.add_all(patients)
            await db.commit()
            print("Database auto-seeded.")
    
    loop = asyncio.get_event_loop()
    start_mqtt(loop)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
