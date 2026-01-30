from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
from typing import Optional

app = FastAPI()

# Allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model + feature metadata
model = joblib.load("baseline_rf_model.joblib")
features = joblib.load("features_used.joblib")

num_features = features["num_features"]
cat_features = features["cat_features"]
ALL_FEATURES = num_features + cat_features


class PredictRequest(BaseModel):
    TOTAL_FLOOR_AREA: Optional[float] = None
    CURRENT_ENERGY_EFFICIENCY: Optional[float] = None
    NUMBER_HABITABLE_ROOMS: Optional[float] = None
    year: int

    property_type: Optional[str] = None
    duration: Optional[str] = None
    old_new: Optional[str] = None
    PROPERTY_TYPE: Optional[str] = None
    CURRENT_ENERGY_RATING: Optional[str] = None
    BUILT_FORM: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(req: PredictRequest):
    row = req.model_dump()

    # Build DataFrame with exact training columns
    X = pd.DataFrame([row], columns=ALL_FEATURES)

    y_log = float(model.predict(X)[0])
    price = float(np.expm1(y_log))

    return {
        "predicted_price": round(price, 0)
    }
