import "./LoadingScreen.css";

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <h1>Welcome to Linde IT Kolkata Hub</h1>
        </div>

        <h2 className="loading-title">
          HRMS Web Portal
        </h2>

        <div className="loading-progress-wrapper">
          <div className="loading-progress-text">
            Authenticating...
          </div>
        </div>

        <div className="loading-spinner"></div>
      </div>
    </div>
  );
}
