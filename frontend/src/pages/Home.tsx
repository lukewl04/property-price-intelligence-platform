import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page-container">
      <div className="page-content text-center">
        <h1 className="hero-title">Property Price Intelligence Platform</h1>

        <p className="hero-subtitle">
          A machine learning system for predicting residential property prices
          in Birmingham using Land Registry and EPC data.
        </p>

        <div className="info-card">
          <h3>What does this project do?</h3>
          <ul>
            <li>Trains ML models on historical property sales</li>
            <li>Integrates energy efficiency and property attributes</li>
            <li>Provides real-time price predictions via a web interface</li>
          </ul>
        </div>

        <Link to="/predict" className="d-inline-block">
          <button className="btn btn-primary btn-lg">
            Start Prediction
          </button>
        </Link>
      </div>
    </div>
  );
}
