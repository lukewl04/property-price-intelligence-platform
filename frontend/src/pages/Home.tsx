import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page-container">
      <div className="page-content text-center">
        <h1 className="hero-title">
          Property Price Intelligence Platform
        </h1>

        <p className="hero-subtitle">
          An honours project investigating the use of machine learning to
          predict residential property prices across England and Wales,
          using HM Land Registry Price Paid Data and Energy Performance
          Certificate (EPC) records.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <h3>Data-Driven Modelling</h3>
            <p>
              Combines transaction records with energy performance data
              to build a predictive model grounded in real-world evidence.
            </p>
          </div>
          <div className="feature-card">
            <h3>Feature Engineering</h3>
            <p>
              Derives spatial, temporal, and property-level features
              including postcode-based target encoding, distance metrics,
              and interaction terms.
            </p>
          </div>
          <div className="feature-card">
            <h3>Deployed Prediction</h3>
            <p>
              A trained CatBoost model is served via a FastAPI backend,
              accepting property attributes and returning an estimated price.
            </p>
          </div>
        </div>

        <Link to="/predict" className="cta-link">
          <button className="btn-cta">
            Try the Predictor
            <span className="cta-arrow">&rarr;</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
