from fastapi import FastAPI
from app.model import detector
from pydantic import BaseModel

app = FastAPI(title="ICU ML Service")

class VitalsInput(BaseModel):
    heart_rate: float
    bp_sys: float
    bp_dia: float
    spo2: float
    temperature: float
    resp_rate: float

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/predict")
async def predict_risk(vitals: VitalsInput):
    result = detector.predict(vitals.model_dump())
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
