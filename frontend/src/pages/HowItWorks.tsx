export default function HowItWorks() {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="section-title">How It Works</h1>

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
          <h3>1. Data Sources</h3>
          <p>
            Three open datasets published by UK government bodies form the basis
            of the model:
          </p>
          <ul>
            <li>
              <strong>HM Land Registry Price Paid Data</strong> &mdash; every
              residential property transaction in England and Wales, including
              sale price, date, postcode, property type, and tenure.
            </li>
            <li>
              <strong>Energy Performance Certificates</strong> (DLUHC) &mdash;
              property-level records containing floor area, habitable rooms,
              EPC rating, construction age band, and built form.
            </li>
            <li>
              <strong>ONS Postcode Directory</strong> &mdash; geographic
              reference data mapping postcodes to latitude, longitude, and
              administrative boundaries, used for spatial feature engineering.
            </li>
          </ul>
          <p>
            These datasets were merged on postcode and address fields to produce
            a unified training set linking transaction prices with physical
            property characteristics and geographic context.
          </p>
        </div>

        <div className="info-card">
          <h3>2. Data Preparation &amp; Merging</h3>
          <p>
            The datasets are cleaned independently (removing duplicates,
            handling missing values, and normalising postcodes) and then merged
            on postcode and address to create a single record per transaction
            that combines price information with physical property attributes
            and geographic context.
          </p>
        </div>

        <div className="info-card">
          <h3>3. Feature Engineering</h3>
          <p>
            A set of derived features is computed to improve model
            accuracy. These include:
          </p>
          <ul>
            <li>Log-transformed floor area and interaction terms
              (e.g.&nbsp;EPC&nbsp;&times;&nbsp;log&nbsp;area,
              rooms&nbsp;&times;&nbsp;area)</li>
            <li>Postcode-level target-encoded mean log prices at sector
              and district level</li>
            <li>Haversine distances from the property postcode to major cities</li>
            <li>KMeans-based location clustering on latitude and longitude</li>
            <li>Cyclical month encodings (sin/cos) and year-scaled temporal
              features</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>4. Model Training</h3>
          <p>
            An <strong>XGBoost</strong> gradient-boosted decision tree regressor
            is trained on the log-transformed sale price. XGBoost was selected
            for its speed, regularisation capabilities, and strong performance
            on tabular data.
          </p>
        </div>

        <div className="info-card">
          <h3>5. Deployment &amp; Inference</h3>
          <p>
            The trained model and all preprocessing artefacts (postcode
            coordinate lookups, target-encoding maps, KMeans model, city
            coordinates) are serialised into a single joblib bundle. A FastAPI
            backend loads the bundle at startup and exposes a
            <code> /predict</code> endpoint.
          </p>
          <p>
            When a user submits the form, the frontend sends the raw inputs
            to the API. The backend normalises the postcode, looks up
            coordinates, computes all derived features, constructs a
            single-row DataFrame in training column order, and passes it to
            the XGBoost model. The log-price prediction is converted back
            to pounds with <code>expm1</code> and returned to the browser.
          </p>
        </div>

        <div className="info-card">
          <h3>Technology Stack</h3>
          <ul>
            <li>
              <strong>Backend:</strong> Python, FastAPI, XGBoost, scikit-learn,
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
