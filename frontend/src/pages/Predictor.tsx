import { useState } from "react";

/**
 * This type MUST match what FastAPI expects.
 * It mirrors the features used during training.
 */
type PredictRequest = {
  TOTAL_FLOOR_AREA: number | null;
  CURRENT_ENERGY_EFFICIENCY: number | null;
  NUMBER_HABITABLE_ROOMS: number | null;
  year: number;

  property_type: "D" | "S" | "T" | "F" | "O";
  duration: "F" | "L";
  old_new: "N" | "Y";

  PROPERTY_TYPE?: string | null;
  CURRENT_ENERGY_RATING?: "A" | "B" | "C" | "D" | "E" | "F" | "G" | null;
  BUILT_FORM?: string | null;
};

type PredictResponse = {
  predicted_price: number;
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export default function App() {
  const [form, setForm] = useState<PredictRequest>({
    TOTAL_FLOOR_AREA: null,
    CURRENT_ENERGY_EFFICIENCY: null,
    NUMBER_HABITABLE_ROOMS: null,
    year: new Date().getFullYear(),

    property_type: "T",
    duration: "F",
    old_new: "N",

    PROPERTY_TYPE: null,
    CURRENT_ENERGY_RATING: "C",
    BUILT_FORM: null,
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
                  </div>

                  <div className="row">
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

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="propType" className="form-label">
                          Property Type
                        </label>
                        <select
                          id="propType"
                          className="form-select"
                          value={form.property_type}
                          onChange={(e) =>
                            update("property_type", e.target.value as any)
                          }
                        >
                          <option value="D">Detached</option>
                          <option value="S">Semi-detached</option>
                          <option value="T">Terraced</option>
                          <option value="F">Flat</option>
                          <option value="O">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="tenure" className="form-label">
                          Tenure
                        </label>
                        <select
                          id="tenure"
                          className="form-select"
                          value={form.duration}
                          onChange={(e) =>
                            update("duration", e.target.value as any)
                          }
                        >
                          <option value="F">Freehold</option>
                          <option value="L">Leasehold</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="newBuild" className="form-label">
                          New Build?
                        </label>
                        <select
                          id="newBuild"
                          className="form-select"
                          value={form.old_new}
                          onChange={(e) =>
                            update("old_new", e.target.value as any)
                          }
                        >
                          <option value="N">No</option>
                          <option value="Y">Yes</option>
                        </select>
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
                          value={form.CURRENT_ENERGY_RATING ?? ""}
                          onChange={(e) =>
                            update("CURRENT_ENERGY_RATING", e.target.value as any)
                          }
                        >
                          {["A", "B", "C", "D", "E", "F", "G"].map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
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
