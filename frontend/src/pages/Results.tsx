export default function Results() {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="section-title">Evaluation &amp; Results</h1>

        <p className="section-intro">
          This page summarises the performance of the deployed CatBoost model
          and discusses the strengths and limitations of the approach.
        </p>

        {/* ── Performance Metrics ──────────────────────────────── */}
        <div className="info-card">
          <h3>Model Performance</h3>
          <p>
            The model was evaluated on a held-out test set that was not used
            during training. The following metrics summarise prediction accuracy:
          </p>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-value">&mdash;</span>
              <span className="metric-label">MAE (&pound;)</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">&mdash;</span>
              <span className="metric-label">RMSE (&pound;)</span>
            </div>
            <div className="metric-item">
              <span className="metric-value">&mdash;</span>
              <span className="metric-label">R&sup2;</span>
            </div>
          </div>
          <p className="placeholder-note">
            Replace the dashes above with your actual test-set metrics.
          </p>
        </div>

        {/* ── Evaluation Method ────────────────────────────────── */}
        <div className="info-card">
          <h3>Evaluation Method</h3>
          <p>
            The dataset was split into training and test partitions. The model
            was trained exclusively on the training set and evaluated on the
            unseen test set to estimate generalisation performance.
            Metrics are computed on the original pound scale after reversing
            the log transformation applied during training.
          </p>
        </div>

        {/* ── Interpretation ───────────────────────────────────── */}
        <div className="info-card">
          <h3>Interpretation of Results</h3>
          <p>
            {/* Replace or expand on this placeholder once you have results */}
            A high R&sup2; value indicates the model captures a large proportion
            of variance in property prices. MAE provides an intuitive
            average-error figure in pounds, while RMSE penalises large
            individual errors more heavily. Together these metrics give a
            balanced view of prediction quality.
          </p>
        </div>

        {/* ── Chart Placeholder ────────────────────────────────── */}
        <div className="info-card">
          <h3>Predicted vs. Actual Prices</h3>
          <div className="chart-placeholder">
            <p>Chart placeholder &mdash; insert a scatter plot or residual
            chart here once evaluation visuals are generated.</p>
          </div>
        </div>

        {/* ── Strengths ────────────────────────────────────────── */}
        <div className="info-card">
          <h3>Strengths</h3>
          <ul>
            <li>
              Uses real, publicly available government data covering all of
              England and Wales.
            </li>
            <li>
              Extensive feature engineering (spatial encoding,
              target-encoded postcode statistics, interaction terms) adds
              predictive signal beyond raw inputs.
            </li>
            <li>
              CatBoost handles categorical features natively and generalises
              well on tabular data with relatively little tuning.
            </li>
            <li>
              The full pipeline from raw data to live prediction is
              reproducible and deployed as a working web application.
            </li>
          </ul>
        </div>

        {/* ── Limitations & Future Work ────────────────────────── */}
        <h2 className="section-subtitle">Limitations &amp; Future Work</h2>

        <div className="info-card">
          <h3>Dataset Limitations</h3>
          <ul>
            <li>
              Land Registry data does not capture private sales or
              off-market transactions, which may bias the price distribution.
            </li>
            <li>
              EPC records may be outdated; a certificate is only required
              at the point of sale or letting, so some property attributes
              may have changed since the last assessment.
            </li>
            <li>
              The merge between datasets relies on postcode and address
              matching, which can introduce noise if records are
              inconsistently formatted.
            </li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Model Generalisation</h3>
          <ul>
            <li>
              The model reflects historical price patterns and may not
              generalise to rapid market shifts or regions with sparse data.
            </li>
            <li>
              Predictions are point estimates with no built-in uncertainty
              quantification.
            </li>
            <li>
              Outputs should be treated as indicative estimates, not formal
              valuations.
            </li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Possible Improvements</h3>
          <ul>
            <li>
              Periodic retraining on updated Land Registry releases to keep
              the model current.
            </li>
            <li>
              Incorporating additional features such as proximity to
              transport links, school ratings, or flood risk data.
            </li>
            <li>
              Adding prediction intervals or conformal calibration
              to communicate uncertainty to users.
            </li>
            <li>
              Integrating model explainability tools (e.g.&nbsp;SHAP) so users
              can understand which features most influence a given prediction.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
