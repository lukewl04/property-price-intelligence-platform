export default function About() {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="section-title">About the Project</h1>

        <div className="info-card">
          <h3>Project Purpose</h3>
          <p>
            This web application was developed as the practical artefact for an
            undergraduate Honours project in Software Development. The aim is to
            investigate the feasibility of predicting residential property prices
            in England and Wales using publicly available datasets and modern
            machine learning techniques.
          </p>
        </div>

        <div className="info-card">
          <h3>Datasets</h3>
          <p>
            The model was trained on two primary open-data sources:
          </p>
          <ul>
            <li>
              <strong>HM Land Registry Price Paid Data</strong> &mdash;
              historical transaction records including sale price, property type,
              tenure, and postcode.
            </li>
            <li>
              <strong>Energy Performance Certificates (EPC)</strong> &mdash;
              property-level attributes such as total floor area, number of
              habitable rooms, construction age band, built form, and current
              energy efficiency rating.
            </li>
          </ul>
          <p>
            These datasets were merged on postcode and address fields to produce
            a unified training set linking transaction prices with physical
            property characteristics.
          </p>
        </div>

        <div className="info-card">
          <h3>System Pipeline</h3>
          <p>
            The end-to-end pipeline consists of data ingestion, cleaning,
            feature engineering, model training, and deployment. Key
            engineered features include log-transformed floor area, interaction
            terms (e.g.&nbsp;EPC&nbsp;&times;&nbsp;log&nbsp;area), postcode-level
            target encodings, Haversine distance to major cities, KMeans-based
            location clustering, and cyclical temporal encodings.
          </p>
        </div>

        <div className="info-card">
          <h3>Deployed Model</h3>
          <p>
            The production model is a <strong>CatBoost</strong> gradient-boosted
            decision tree regressor, trained on log-transformed sale prices
            and converted back to pounds at inference time. CatBoost was
            selected for its native handling of categorical features and strong
            performance on tabular data.
          </p>
        </div>

        <div className="info-card">
          <h3>Technology Stack</h3>
          <ul>
            <li>
              <strong>Backend:</strong> Python, FastAPI, CatBoost, scikit-learn,
              pandas, joblib
            </li>
            <li>
              <strong>Frontend:</strong> React, TypeScript, Vite
            </li>
            <li>
              <strong>Deployment:</strong> Uvicorn (ASGI), single-page
              application served separately from the API
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
