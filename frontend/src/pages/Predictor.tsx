import { useState } from "react";
import { API_URL } from "../config";


type PredictRequest = {
  POSTCODE: string;
  PROPERTYTYPE: string;
  DURATION: string;
  /** EPC band letter (A–G). The backend maps this to a numeric score. */
  EPC_RATING: string;
  TOTAL_FLOOR_AREA: number | null;
  NUMBER_HABITABLE_ROOMS: number | null;
  CONSTRUCTION_AGE_BAND: string;
  BUILT_FORM: string;
};

type PredictResponse = {
  predicted_price: number;
};

const INITIAL_FORM: PredictRequest = {
  POSTCODE: "",
  PROPERTYTYPE: "T",
  DURATION: "F",
  EPC_RATING: "D",
  TOTAL_FLOOR_AREA: null,
  NUMBER_HABITABLE_ROOMS: null,
  CONSTRUCTION_AGE_BAND: "England and Wales: 1967-1975",
  BUILT_FORM: "Semi-Detached",
};

const SAMPLE_FORM: PredictRequest = {
  POSTCODE: "B15 2TT",
  PROPERTYTYPE: "S",
  DURATION: "F",
  EPC_RATING: "D",
  TOTAL_FLOOR_AREA: 85,
  NUMBER_HABITABLE_ROOMS: 3,
  CONSTRUCTION_AGE_BAND: "England and Wales: 1967-1975",
  BUILT_FORM: "Semi-Detached",
};

export default function Predictor() {
  const [form, setForm] = useState<PredictRequest>({ ...INITIAL_FORM });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof PredictRequest>(
    key: K,
    value: PredictRequest[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm({ ...INITIAL_FORM });
    setResult(null);
    setError(null);
  }

  function loadSample() {
    setForm({ ...SAMPLE_FORM });
    setResult(null);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!form.POSTCODE.trim()) {
      setError("Please enter a postcode.");
      return;
    }
    if (form.TOTAL_FLOOR_AREA == null || form.NUMBER_HABITABLE_ROOMS == null) {
      setError("Please fill in Floor Area and Habitable Rooms.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data: PredictResponse = await res.json();
      setResult(data.predicted_price);
    } catch (err: any) {
      setError(err.message ?? "Prediction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="section-title">Price Prediction</h1>
        <p className="section-intro">
          Enter property details below to generate an estimated price using
          the deployed XGBoost model. All fields are used as model inputs.
        </p>

        <div className="prediction-form">
          <form onSubmit={submit}>
            {/* -- Location -- */}
            <fieldset className="form-section">
              <legend className="form-section-legend">Location</legend>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="postcode" className="form-label">
                      Postcode
                    </label>
                    <input
                      id="postcode"
                      type="text"
                      className="form-control"
                      placeholder="e.g. B15 2TT"
                      value={form.POSTCODE}
                      onChange={(e) => update("POSTCODE", e.target.value)}
                    />
                    <span className="form-hint">
                      Used to derive latitude, longitude, and area-level statistics.
                    </span>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* -- Property Characteristics -- */}
            <fieldset className="form-section">
              <legend className="form-section-legend">Property Characteristics</legend>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="propType" className="form-label">
                      Property Type
                    </label>
                    <select
                      id="propType"
                      className="form-select"
                      value={form.PROPERTYTYPE}
                      onChange={(e) => update("PROPERTYTYPE", e.target.value)}
                    >
                      <option value="D">Detached</option>
                      <option value="S">Semi-Detached</option>
                      <option value="T">Terraced</option>
                      <option value="F">Flat / Maisonette</option>
                      <option value="O">Other</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="builtForm" className="form-label">
                      Built Form
                    </label>
                    <select
                      id="builtForm"
                      className="form-select"
                      value={form.BUILT_FORM}
                      onChange={(e) => update("BUILT_FORM", e.target.value)}
                    >
                      <option value="Detached">Detached</option>
                      <option value="Semi-Detached">Semi-Detached</option>
                      <option value="Mid-Terrace">Mid-Terrace</option>
                      <option value="End-Terrace">End-Terrace</option>
                      <option value="Enclosed Mid-Terrace">Enclosed Mid-Terrace</option>
                      <option value="Enclosed End-Terrace">Enclosed End-Terrace</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="constructionAge" className="form-label">
                      Construction Age Band
                    </label>
                    <select
                      id="constructionAge"
                      className="form-select"
                      value={form.CONSTRUCTION_AGE_BAND}
                      onChange={(e) =>
                        update("CONSTRUCTION_AGE_BAND", e.target.value)
                      }
                    >
                      <option value="England and Wales: before 1900">Before 1900</option>
                      <option value="England and Wales: 1900-1929">1900&ndash;1929</option>
                      <option value="England and Wales: 1930-1949">1930&ndash;1949</option>
                      <option value="England and Wales: 1950-1966">1950&ndash;1966</option>
                      <option value="England and Wales: 1967-1975">1967&ndash;1975</option>
                      <option value="England and Wales: 1976-1982">1976&ndash;1982</option>
                      <option value="England and Wales: 1983-1990">1983&ndash;1990</option>
                      <option value="England and Wales: 1991-1995">1991&ndash;1995</option>
                      <option value="England and Wales: 1996-2002">1996&ndash;2002</option>
                      <option value="England and Wales: 2003-2006">2003&ndash;2006</option>
                      <option value="England and Wales: 2007-2011">2007&ndash;2011</option>
                      <option value="England and Wales: 2012 onwards">2012 onwards</option>
                    </select>
                    <span className="form-hint">As recorded in the EPC dataset.</span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="tenure" className="form-label">
                      Tenure
                    </label>
                    <select
                      id="tenure"
                      className="form-select"
                      value={form.DURATION}
                      onChange={(e) => update("DURATION", e.target.value)}
                    >
                      <option value="F">Freehold</option>
                      <option value="L">Leasehold</option>
                    </select>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* -- Size & Energy -- */}
            <fieldset className="form-section">
              <legend className="form-section-legend">Size &amp; Energy</legend>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="floorArea" className="form-label">
                      Total Floor Area (m&sup2;)
                    </label>
                    <input
                      id="floorArea"
                      type="number"
                      min="1"
                      className="form-control"
                      placeholder="e.g. 85"
                      value={form.TOTAL_FLOOR_AREA ?? ""}
                      onChange={(e) =>
                        update(
                          "TOTAL_FLOOR_AREA",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="rooms" className="form-label">
                      Habitable Rooms
                    </label>
                    <input
                      id="rooms"
                      type="number"
                      min="1"
                      className="form-control"
                      placeholder="e.g. 3"
                      value={form.NUMBER_HABITABLE_ROOMS ?? ""}
                      onChange={(e) =>
                        update(
                          "NUMBER_HABITABLE_ROOMS",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="epcRating" className="form-label">
                      EPC Rating
                    </label>
                    <select
                      id="epcRating"
                      className="form-select"
                      value={form.EPC_RATING}
                      onChange={(e) => update("EPC_RATING", e.target.value)}
                    >
                      <option value="A">A (Most efficient)</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                      <option value="F">F</option>
                      <option value="G">G (Least efficient)</option>
                    </select>
                    <span className="form-hint">
                      Mapped to a numeric energy efficiency score internally.
                    </span>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* -- Actions -- */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {" "}Predicting&hellip;
                  </>
                ) : (
                  "Predict Price"
                )}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={loadSample}
              >
                Load Sample
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={resetForm}
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* -- Result -- */}
        {result !== null && (
          <div className="result-card">
            <div className="result-label">Estimated Price</div>
            <h2>&pound;{result.toLocaleString()}</h2>
            <p className="result-disclaimer">
              This is a model estimate based on historical transaction and
              property data. It is not a formal valuation.
            </p>
          </div>
        )}

        {/* -- Error -- */}
        {error && (
          <div className="alert alert-danger mt-4" role="alert">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}
