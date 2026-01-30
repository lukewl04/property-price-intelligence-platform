export default function About() {
  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="mb-4">About the Project</h1>

      <div className="info-card">
        <p>
          This application was developed as part of an undergraduate
          Honours project in Software Development.
        </p>
      </div>

      <div className="info-card">
        <p>
          The system uses machine learning models trained on UK Land Registry
          Price Paid Data and EPC energy performance certificates to predict
          residential property prices.
        </p>
      </div>

      <div className="info-card">
        <h3>Technologies used:</h3>
        <ul>
          <li>Python, scikit-learn, FastAPI</li>
          <li>React + TypeScript (Vite)</li>
          <li>Random Forest regression models</li>
        </ul>
      </div>
      </div>
    </div>
  );
}
