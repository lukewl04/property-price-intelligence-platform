from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd
import re
import os
import math
from datetime import date
import xgboost as xgb
import scipy.sparse as sp

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI()

_default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

_extra = os.environ.get("CORS_ORIGINS", "")
allowed_origins = _default_origins + [o.strip() for o in _extra.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://property-price-intelligence-platfor.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load XGBoost deploy bundle ──────────────────────────────────────────
print("Starting api.py...")
bundle = joblib.load(os.path.join(BASE_DIR, "xgboost_deploy.joblib"))
print("Model bundle loaded.")
model = bundle["model"]
feature_columns = bundle["feature_columns"]
num_imputer = bundle["num_imputer"]
ohe = bundle["ohe"]
num_cols = bundle["num_cols"]
cat_cols = bundle["cat_cols"]
postcode_coords = bundle["postcode_coords"]
district_coords = bundle["district_coords"]
kmeans_model = bundle["kmeans"]
sector_te_map = bundle["sector_te_map"]
district_te_map = bundle["district_te_map"]
district_density_map = bundle["district_density_map"]
district_median_map = bundle["district_median_map"]
train_global_mean = bundle["train_global_mean"]
epc_band_map = bundle["epc_band_map"]
band_midpoints = bundle["band_midpoints"]
cities = bundle["cities"]
cutoff_year = bundle["cutoff_year"]


# ── Helpers ──────────────────────────────────────────────────────────────
_EARTH_R_KM = 6371.0


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in km between two (lat, lon) pairs."""
    la1, lo1, la2, lo2 = map(math.radians, (lat1, lon1, lat2, lon2))
    dlat = la2 - la1
    dlon = lo2 - lo1
    a = math.sin(dlat / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(dlon / 2) ** 2
    return _EARTH_R_KM * 2 * math.asin(math.sqrt(a))


def _normalise_postcode(pc: str) -> str:
    """Strip spaces and upper-case."""
    return (pc or "").upper().replace(" ", "").strip()


def _postcode_district(pc_norm: str) -> str:
    m = re.match(r"^([A-Z]{1,2}\d{1,2})", pc_norm)
    return m.group(1) if m else ""


def _postcode_sector(pc_norm: str) -> str:
    r"""Extract postcode sector without space, matching training regex.
    E.g. 'SW1A1AA' → 'SW1A1'  (outward code + first digit of inward code).
    Training used: r'^([A-Z]{1,2}\d{1,2}[A-Z]?\d)'
    """
    m = re.match(r"^([A-Z]{1,2}\d{1,2}[A-Z]?\d)", pc_norm)
    return m.group(1) if m else ""


class PredictRequest(BaseModel):
    POSTCODE: str
    PROPERTYTYPE: str
    DURATION: str
    EPC_RATING: str               # letter A–G
    TOTAL_FLOOR_AREA: float
    NUMBER_HABITABLE_ROOMS: float
    CONSTRUCTION_AGE_BAND: str
    BUILT_FORM: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(req: PredictRequest):
    #  EPC letter → numeric CURRENT_ENERGY_EFFICIENCY ────────────────
    epc_letter = req.EPC_RATING.strip().upper()
    if epc_letter not in epc_band_map:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid EPC rating '{req.EPC_RATING}'. Must be one of {', '.join(sorted(epc_band_map))}.",
        )
    epc_num = epc_band_map[epc_letter]

    #  Postcode normalisation & derived strings ──────────────────────
    pc_norm = _normalise_postcode(req.POSTCODE)
    if not pc_norm:
        raise HTTPException(status_code=400, detail="Postcode is required.")
    district = _postcode_district(pc_norm)
    sector = _postcode_sector(pc_norm)

    # Floor-area & rooms interaction features ───────────────────────
    area = req.TOTAL_FLOOR_AREA
    rooms = req.NUMBER_HABITABLE_ROOMS
    log_area = float(np.log1p(area))
    # In training ROOMS_IMPUTED was a binary flag for missing rooms;
    # the frontend always supplies a value, so imputed = 0.
    rooms_safe = rooms if rooms > 0 else 1.0
    rooms_imputed = 0
    rooms_per_sqm = rooms_safe / area if area > 0 else 0.0
    sqm_per_room = area / rooms_safe if rooms_safe > 0 else 0.0
    epc_x_logarea = epc_num * log_area
    rooms_x_area = rooms_safe * area
    epc_per_room = epc_num / rooms_safe if rooms_safe > 0 else 0.0

    # Lat / Lon lookup ──────────────────────────────────────────────
    lat, lon = None, None
    if pc_norm in postcode_coords.index:
        lat = float(postcode_coords.loc[pc_norm, "LATITUDE"])
        lon = float(postcode_coords.loc[pc_norm, "LONGITUDE"])
    elif district in district_coords.index:
        lat = float(district_coords.loc[district, "LATITUDE"])
        lon = float(district_coords.loc[district, "LONGITUDE"])

    if lat is None or lon is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to geo-locate postcode '{req.POSTCODE}'. Check spelling.",
        )

    # City distance features ────────────────────────────────────────
    city_dists: dict[str, float] = {}
    city_log_dists: dict[str, float] = {}
    for city_name, (clat, clon) in cities.items():
        d = _haversine_km(lat, lon, clat, clon)
        city_dists[f"DIST_{city_name}_KM"] = d
        city_log_dists[f"LOG_DIST_{city_name}"] = float(np.log1p(d))

    # Location cluster ──────────────────────────────────────────────
    location_cluster = "unknown"
    if kmeans_model is not None:
        try:
            loc_df = pd.DataFrame([[lat, lon]], columns=["LATITUDE", "LONGITUDE"])
            cluster_id = int(kmeans_model.predict(loc_df)[0])
            location_cluster = str(cluster_id)
        except Exception:
            pass

    #  Target-encoded / aggregated postcode features ─────────────────
    pc_sector_mean_log = sector_te_map.get(sector, train_global_mean)
    pc_district_mean_log = district_te_map.get(district, train_global_mean)
    # Training stored raw counts; feature is log1p(count)
    raw_density = district_density_map.get(district, 0)
    district_log_density = float(np.log1p(raw_density))
    district_median_log = district_median_map.get(district, train_global_mean)

    #  Current-date temporal features ────────────────────────────────
    today = date.today()
    sale_year = today.year
    sale_quarter = (today.month - 1) // 3 + 1
    sale_month = today.month
    # Training: SALE_YEAR * 12 + SALE_MONTH
    sale_month_index = sale_year * 12 + sale_month
    month_sin = math.sin(2 * math.pi * sale_month / 12)
    month_cos = math.cos(2 * math.pi * sale_month / 12)
    # Training: year_scaled = SALE_YEAR - cutoff_year (2023)
    year_scaled = sale_year - cutoff_year
    log_area_x_year = log_area * year_scaled
    epc_x_year = epc_num * year_scaled

    #  Construction-age-band compatibility ───────────────────────────
    # Frontend sends "2012 onwards"; training split into "2012-2022" / "2023 onwards"
    _AGE_BAND_COMPAT: dict[str, str] = {
        "England and Wales: 2012 onwards": "England and Wales: 2012-2022",
    }
    age_band = _AGE_BAND_COMPAT.get(req.CONSTRUCTION_AGE_BAND, req.CONSTRUCTION_AGE_BAND)



    #  Assemble feature row ─────────────────────────────────────────
    row: dict = {
        # categorical / raw inputs
        "PROPERTYTYPE": req.PROPERTYTYPE,
        "DURATION": req.DURATION,
        "CONSTRUCTION_AGE_BAND": age_band,
        "BUILT_FORM": req.BUILT_FORM,
        "TENURE": "unknown",
        "POSTCODE_DISTRICT": district,
        "LOCATION_CLUSTER": location_cluster,
        # numeric
        "CURRENT_ENERGY_EFFICIENCY": epc_num,
        "TOTAL_FLOOR_AREA": area,
        "LOG_FLOOR_AREA": log_area,
        "NUMBER_HABITABLE_ROOMS": rooms_safe,
        "ROOMS_IMPUTED": rooms_imputed,
        "ROOMS_PER_SQM": rooms_per_sqm,
        "SQM_PER_ROOM": sqm_per_room,
        "EPC_x_LOGAREA": epc_x_logarea,
        "ROOMS_X_AREA": rooms_x_area,
        "EPC_PER_ROOM": epc_per_room,
        "LATITUDE": lat,
        "LONGITUDE": lon,
        # city distances
        **city_dists,
        **city_log_dists,
        # temporal
        "SALE_YEAR": sale_year,
        "SALE_QUARTER": sale_quarter,
        "SALE_MONTH": sale_month,
        "SALE_MONTH_INDEX": sale_month_index,
        "MONTH_SIN": month_sin,
        "MONTH_COS": month_cos,
        "LOG_AREA_x_YEAR": log_area_x_year,
        "EPC_x_YEAR": epc_x_year,
        # aggregated postcode features
        "POSTCODE_SECTOR_MEAN_LOG": pc_sector_mean_log,
        "POSTCODE_DISTRICT_MEAN_LOG": pc_district_mean_log,
        "DISTRICT_LOG_SALE_DENSITY": district_log_density,
        "DISTRICT_MEDIAN_LOG_PRICE": district_median_log,
    }

    all_cols = list(dict.fromkeys(feature_columns + num_cols + cat_cols))
    data = {}
    for col in all_cols:
        if col in row:
            data[col] = row[col]
        else:
            data[col] = "unknown" if col in cat_cols else 0

    X = pd.DataFrame([data])

    for col in cat_cols:
        if col in X.columns:
            if X[col].dtype in [np.float64, np.float32]:
                X[col] = X[col].astype("Int64").astype(str).replace("<NA>", "unknown")
            else:
                X[col] = X[col].astype(str).fillna("unknown")

    X_num = num_imputer.transform(X[num_cols])
    X_cat = ohe.transform(X[cat_cols])
    X_final = sp.hstack([sp.csr_matrix(X_num), X_cat])
    dmatrix = xgb.DMatrix(X_final)

    y_log = float(model.predict(dmatrix)[0])
    price = float(np.expm1(y_log))

    return {"predicted_price": round(price, 0)}