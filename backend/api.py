from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import re
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the saved PIPELINE (preprocess + model)
pipe = joblib.load(os.path.join(BASE_DIR, "house_price_model_xgb.joblib"))

class PredictRequest(BaseModel):
    POSTCODE: str

    PROPERTYTYPE: str
    DURATION: str
    CURRENT_ENERGY_EFFICIENCY: float
    TOTAL_FLOOR_AREA: float
    NUMBER_HABITABLE_ROOMS: float
    CONSTRUCTION_AGE_BAND: str
    BUILT_FORM: str

def postcode_district(pc: str) -> str:
    pc = (pc or "").upper().replace(" ", "").strip()
    m = re.match(r"^([A-Z]{1,2}\d{1,2})", pc)
    return m.group(1) if m else ""

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(req: PredictRequest):
    row = req.model_dump()
    row["POSTCODE_DISTRICT"] = postcode_district(row["POSTCODE"])

    X = pd.DataFrame([{
        "PROPERTYTYPE": row["PROPERTYTYPE"],
        "DURATION": row["DURATION"],
        "CURRENT_ENERGY_EFFICIENCY": row["CURRENT_ENERGY_EFFICIENCY"],
        "TOTAL_FLOOR_AREA": row["TOTAL_FLOOR_AREA"],
        "NUMBER_HABITABLE_ROOMS": row["NUMBER_HABITABLE_ROOMS"],
        "CONSTRUCTION_AGE_BAND": row["CONSTRUCTION_AGE_BAND"],
        "BUILT_FORM": row["BUILT_FORM"],
        "POSTCODE_DISTRICT": row["POSTCODE_DISTRICT"],
    }])

    y_log = float(pipe.predict(X)[0])
    price = float(np.exp(y_log))  # because training used np.log(price)

    return {"predicted_price": round(price, 0)}
