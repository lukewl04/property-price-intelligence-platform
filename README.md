# 🏠 Property Price Intelligence Platform

A full-stack web application that predicts residential property prices across England and Wales using machine learning. Built as an Honours undergraduate project, the platform combines government datasets — Land Registry transactions, Energy Performance Certificates (EPC), and ONS Postcode Directory — with an XGBoost gradient-boosted model to deliver instant price estimates based on property characteristics and geographic location.

🔗 **Live Demo:** [property-price-intelligence-platfor.vercel.app](https://property-price-intelligence-platfor.vercel.app/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [How the Prediction Works](#how-the-prediction-works)
- [Model Performance](#model-performance)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

### User-Facing

- **Property Price Predictor** — Submit property details (postcode, type, size, EPC rating, etc.) and receive an instant estimated price.
- **Sample Data Loading** — One-click "Load Sample" button pre-fills the form with example property data for quick testing.
- **Dark / Light Theme** — Toggle between themes with automatic persistence via `localStorage` and system preference detection on first visit.
- **How It Works** — Educational page documenting the full data pipeline, feature engineering techniques, and model methodology.
- **Model Results Dashboard** — Displays evaluation metrics, a predicted vs. actual scatter plot, strengths, limitations, and future improvements.
- **Responsive Design** — Mobile-friendly layout optimised for phones, tablets, and desktops.

### Technical

- **40+ Engineered Features** derived from just 8 user inputs at inference time.
- **Postcode Geolocation** with dual-lookup (exact postcode → district centroid fallback).
- **Haversine Distance Calculations** to major UK cities.
- **Target Encoding** — Aggregated postcode-level price statistics at sector and district levels.
- **KMeans Location Clustering** for geographic categorisation.
- **Cyclical Temporal Encoding** — sin/cos transformations for month features.
- **Sparse Matrix Support** — OneHotEncoded categorical variables in sparse format for efficient inference.
- **Async API** — FastAPI with asynchronous support for scalability.
- **Auto-generated API Docs** — Swagger UI at `/docs`.

---

## Tech Stack

| Layer     | Technology                                                       |
| --------- | ---------------------------------------------------------------- |
| Frontend  | React 19, TypeScript, Vite, React Router DOM, Bootstrap 5       |
| Backend   | Python, FastAPI, Uvicorn                                         |
| ML / Data | XGBoost, scikit-learn, pandas, NumPy, SciPy, joblib              |
| Styling   | Bootstrap 5 + custom CSS with CSS variables (light/dark themes)  |
| Font      | Inter (Google Fonts)                                             |

---

## Project Structure

```
property-price-intelligence-platform/
├── backend/
│   ├── api.py                        # FastAPI application & prediction pipeline
│   ├── xgboost_deploy.joblib         # Trained model + preprocessing bundle
│   └── requirements.txt              # Python dependencies
│
├── frontend/
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── App.tsx                   # Main routing component
│   │   ├── main.tsx                  # React entry point
│   │   ├── config.ts                 # API URL configuration
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Landing page with feature highlights
│   │   │   ├── Predictor.tsx         # Prediction form & result display
│   │   │   ├── HowItWorks.tsx        # Methodology documentation
│   │   │   └── Results.tsx           # Model evaluation & metrics
│   │   ├── components/
│   │   │   └── Navbar.tsx            # Navigation bar with theme toggle
│   │   ├── context/
│   │   │   └── ThemeContext.tsx       # Dark/light mode context & persistence
│   │   └── styles/
│   │       └── app.css               # Main stylesheet (light/dark themes)
│   ├── index.html                    # HTML entry point
│   ├── package.json                  # NPM dependencies & scripts
│   ├── vite.config.ts                # Vite build configuration
│   ├── tsconfig.json                 # TypeScript configuration
│   └── eslint.config.js              # ESLint rules
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm** (or yarn/pnpm)
- **Python** ≥ 3.10

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment 
python -m venv venv
source venv/bin/activate        # Linux / macOS
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn api:app --reload
```

The API will be available at **http://127.0.0.1:8000** with interactive docs at **http://127.0.0.1:8000/docs**.

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## Environment Variables

| Variable        | Location | Default                    | Description                                      |
| --------------- | -------- | -------------------------- | ------------------------------------------------ |
| `VITE_API_URL`  | Frontend | `http://127.0.0.1:8000`   | Base URL for the backend API                     |
| `CORS_ORIGINS`  | Backend  | *(localhost:5173)*         | Comma-separated list of additional allowed origins |

---

## API Reference

### `GET /health`

Health check endpoint.

**Response:**

```json
{ "status": "ok" }
```

### `POST /predict`

Submit property details and receive a predicted price.

**Request Body:**

```json
{
  "POSTCODE": "B15 2TT",
  "PROPERTYTYPE": "S",
  "DURATION": "F",
  "EPC_RATING": "D",
  "TOTAL_FLOOR_AREA": 85.0,
  "NUMBER_HABITABLE_ROOMS": 3,
  "CONSTRUCTION_AGE_BAND": "England and Wales: 2007-2011",
  "BUILT_FORM": "Semi-Detached"
}
```

| Field                    | Type   | Description                                          |
| ------------------------ | ------ | ---------------------------------------------------- |
| `POSTCODE`               | string | UK postcode (e.g. `"B15 2TT"`)                      |
| `PROPERTYTYPE`           | string | `D` (Detached), `S` (Semi), `T` (Terraced), `F` (Flat), `O` (Other) |
| `DURATION`               | string | `F` (Freehold) or `L` (Leasehold)                   |
| `EPC_RATING`             | string | Energy rating letter `A`–`G`                         |
| `TOTAL_FLOOR_AREA`       | float  | Total floor area in m²                               |
| `NUMBER_HABITABLE_ROOMS` | float  | Number of habitable rooms                            |
| `CONSTRUCTION_AGE_BAND`  | string | Age band (e.g. `"England and Wales: 2012 onwards"`)  |
| `BUILT_FORM`             | string | Built form (e.g. `"Semi-Detached"`, `"Detached"`)    |

**Response:**

```json
{ "predicted_price": 245000 }
```

**Error Responses:**

| Status | Condition                                     |
| ------ | --------------------------------------------- |
| `400`  | Invalid EPC rating, unrecognised postcode, or missing required fields |
| `500`  | Unexpected server error during inference       |

---

## How the Prediction Works

The platform transforms 8 user inputs into 40+ features before feeding them to the XGBoost model:

```
User inputs (8)
     │
     ▼
┌─────────────────────────────────────────────┐
│  1. Normalise postcode (uppercase, trim)    │
│  2. Map EPC letter → numeric score          │
│  3. Extract postcode district & sector      │
│  4. Look up lat/lon coordinates             │
│  5. Compute Haversine distances to cities   │
│  6. KMeans location cluster assignment      │
│  7. Target-encoded postcode aggregations    │
│  8. Temporal features (year, month, cyclic) │
│  9. Interaction terms (EPC × area, etc.)    │
│ 10. Numeric imputation + OneHotEncoding     │
└─────────────────────────────────────────────┘
     │
     ▼
  XGBoost prediction (log-price)
     │
     ▼
  expm1() → Estimated price in £
```

### Data Sources

| Source                    | Description                                |
| ------------------------- | ------------------------------------------ |
| **HM Land Registry**     | Historical property transaction records    |
| **Energy Performance Certificates (EPC)** | Building energy ratings and characteristics |
| **ONS Postcode Directory** | Postcode-to-coordinate mappings           |

### Feature Engineering Highlights

- **Log-transformed floor area** (`log1p`) for numerical stability
- **Interaction terms**: rooms per m², EPC × log area, rooms × area
- **Haversine distances** to major UK cities (+ log-transformed)
- **Target encoding** at postcode sector and district levels (mean prices, density, median)
- **KMeans clustering** on geographic coordinates
- **Cyclical month encoding** using sin/cos transformations

---

## Model Performance

Evaluated on a held-out test set of **574,327 transactions**:

### Price Scale

| Metric      | Value      |
| ----------- | ---------- |
| R²          | 0.78       |
| MAE         | £61,915    |
| RMSE        | £103,991   |
| MAPE        | 20.26%     |
| Median APE  | 13.66%     |

### Log Scale

| Metric | Value  |
| ------ | ------ |
| R²     | 0.82   |
| MAE    | 0.1886 |
| RMSE   | 0.2640 |

### Strengths

- Trained on real government data covering England and Wales.
- Extensive feature engineering pipeline (40+ features from 8 inputs).
- XGBoost model well-suited for tabular, heterogeneous data.
- Fully deployed end-to-end prediction pipeline.

### Known Limitations

- Missing private sales (not all transactions appear in Land Registry).
- EPC records may be outdated — certificates are valid for 10 years.
- Address-matching noise when merging datasets.
- No uncertainty quantification — single point estimate only.

---

## Future Improvements

- **Periodic Retraining** — Automated model updates as new transaction data is released.
- **Additional Features** — Proximity to transport links, schools, flood risk zones.
- **Prediction Intervals** — Confidence ranges alongside point estimates.
- **SHAP Explainability** — Feature importance breakdowns for each prediction.
- **Historical Trends** — Show price trends for a given postcode over time.

---

## License

This project was developed as part of an Honours undergraduate degree. All data sources used (Land Registry, EPC, ONS) are published under the [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).
