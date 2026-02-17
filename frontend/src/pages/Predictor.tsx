import { useState } from "react";

/**
 * This type MUST match what FastAPI expects.
 * It mirrors the features used during training.
 */
type PredictRequest = {
  POSTCODE: string;
  PROPERTYTYPE: string;
  DURATION: string;
  CURRENT_ENERGY_EFFICIENCY: number | null;
  TOTAL_FLOOR_AREA: number | null;
  NUMBER_HABITABLE_ROOMS: number | null;
  CONSTRUCTION_AGE_BAND: string;
  BUILT_FORM: string;
};

type PredictResponse = {
  predicted_price: number;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export default function App() {
  const [form, setForm] = useState<PredictRequest>({
    POSTCODE: "",
    PROPERTYTYPE: "T",
    DURATION: "F",
    CURRENT_ENERGY_EFFICIENCY: null,
    TOTAL_FLOOR_AREA: null,
    NUMBER_HABITABLE_ROOMS: null,
    CONSTRUCTION_AGE_BAND: "England and Wales: 1967-1975",
    BUILT_FORM: "Semi-Detached",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof PredictRequest>(
    key: K,
    value: PredictRequest[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

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
        <h1 className="h2 mb-2">Property Price Intelligence</h1>
        <p className="text-muted mb-4">
          Birmingham house price prediction (ML-powered)
        </p>

              <div className="prediction-form">
                <form onSubmit={submit}>
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
                          onChange={(e) =>
                            update("POSTCODE", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="floorArea" className="form-label">
                          Floor Area (m²)
                        </label>
                        <input
                          id="floorArea"
                          type="number"
                          className="form-control"
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
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="energyEff" className="form-label">
                          Energy Efficiency (0–100)
                        </label>
                        <input
                          id="energyEff"
                          type="number"
                          className="form-control"
                          value={form.CURRENT_ENERGY_EFFICIENCY ?? ""}
                          onChange={(e) =>
                            update(
                              "CURRENT_ENERGY_EFFICIENCY",
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
                          className="form-control"
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
                        <label htmlFor="propType" className="form-label">
                          Property Type
                        </label>
                        <select
                          id="propType"
                          className="form-select"
                          value={form.PROPERTYTYPE}
                          onChange={(e) =>
                            update("PROPERTYTYPE", e.target.value)
                          }
                        >
                          <option value="D">Detached</option>
                          <option value="S">Semi-Detached</option>
                          <option value="T">Terraced</option>
                          <option value="F">Flat</option>
                          <option value="O">Other</option>
                        </select>
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
                          onChange={(e) =>
                            update("DURATION", e.target.value)
                          }
                        >
                          <option value="F">Freehold</option>
                          <option value="L">Leasehold</option>
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
                          <option value="England and Wales: 1900-1929">1900–1929</option>
                          <option value="England and Wales: 1930-1949">1930–1949</option>
                          <option value="England and Wales: 1950-1966">1950–1966</option>
                          <option value="England and Wales: 1967-1975">1967–1975</option>
                          <option value="England and Wales: 1976-1982">1976–1982</option>
                          <option value="England and Wales: 1983-1990">1983–1990</option>
                          <option value="England and Wales: 1991-1995">1991–1995</option>
                          <option value="England and Wales: 1996-2002">1996–2002</option>
                          <option value="England and Wales: 2003-2006">2003–2006</option>
                          <option value="England and Wales: 2007-2011">2007–2011</option>
                          <option value="England and Wales: 2012 onwards">2012 onwards</option>
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
                          onChange={(e) =>
                            update("BUILT_FORM", e.target.value)
                          }
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

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Predicting…
                        </>
                      ) : (
                        "Predict Price"
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {result && (
                <div className="result-card">
                  <div className="result-label">Predicted Price</div>
                  <h2 className="result-card h2">
                    £{result.toLocaleString()}
                  </h2>
                </div>
              )}

              {error && (
                <div className="alert alert-danger mt-4" role="alert">
                  <strong>Error:</strong> {error}
                </div>
              )}
      </div>
    </div>
  );
}
