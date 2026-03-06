from sklearn.ensemble import IsolationForest
import numpy as np
import pandas as pd
from typing import List, Dict, Any

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.05, random_state=42)
        # Pre-train with some dummy "normal" data
        self._pretrain()

    def _pretrain(self):
        # Generate some synthetic normal ICU data for initial calibration
        normal_data = []
        for _ in range(1000):
            normal_data.append([
                np.random.normal(75, 5),   # HR
                np.random.normal(120, 10), # BP Sys
                np.random.normal(80, 5),   # BP Dia
                np.random.normal(98, 1),   # SpO2
                np.random.normal(37, 0.2), # Temp
                np.random.normal(16, 2)    # Resp
            ])
        self.model.fit(normal_data)

    def predict(self, vitals: Dict) -> Dict:
        features = [[
            vitals['heart_rate'],
            vitals['bp_sys'],
            vitals['bp_dia'],
            vitals['spo2'],
            vitals['temperature'],
            vitals['resp_rate']
        ]]
        
        # -1 for anomaly, 1 for normal
        score = self.model.decision_function(features)[0]
        prediction = self.model.predict(features)[0]
        
        risk_score = (1 - score) / 2 # Normalize to 0-1 range roughly
        risk_level = "Low"
        if risk_score > 0.7:
            risk_level = "High"
        elif risk_score > 0.4:
            risk_level = "Medium"
            
        return {
            "is_anomaly": bool(prediction == -1),
            "risk_score": float(risk_score),
            "risk_level": risk_level
        }

detector = AnomalyDetector()
