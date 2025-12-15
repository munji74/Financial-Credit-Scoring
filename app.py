from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import json
import numpy as np

app = FastAPI(title="Credit Risk API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("credit_risk_model.pkl")
scaler = joblib.load("scaler.pkl")

with open("feature_names.json") as f:
    feature_names = json.load(f)

class CreditApp(BaseModel):
    features: dict

@app.get("/")
def root():
    return {"message": "Credit Risk Prediction API"}

@app.post("/predict")
def predict(app: CreditApp):
    features = np.array([app.features.get(f, 0) for f in feature_names]).reshape(1, -1)
    features_scaled = scaler.transform(features)
    prediction = model.predict(features_scaled)[0]
    probability = model.predict_proba(features_scaled)[0, 1]
    return {
        "risk_level": "High" if prediction == 1 else "Low",
        "probability": float(probability)
    }
