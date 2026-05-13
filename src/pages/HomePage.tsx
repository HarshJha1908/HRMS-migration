import './HomePage.css';
import slideLogo from '../assets/Linde_plc_logo.png';
// import LockedScreen from '../components/LockedScreen';

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Hero Image Section */}
      <section className="hero-section">
        <div className="hero-container">
          <img src={slideLogo} alt="Linde Logo" className="hero-image" />
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-container">
          <h2>Welcome to Linde HRMS</h2>
          <p>
            A comprehensive Human Resource Management System designed to streamline
            your HR operations and enhance employee experience.
          </p>
        </div>
      </section>

      {/* Features Section (Placeholder) */}
      <section className="features-section">
        <div className="features-container">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Leave Management</h3>
              <p>Manage and track employee leaves efficiently</p>
            </div>
            <div className="feature-card">
              <h3>Document Center</h3>
              <p>Centralized document storage and management</p>
            </div>
            <div className="feature-card">
              <h3>Team Collaboration</h3>
              <p>Enhanced team leave tracking and approvals</p>
            </div>
            <div className="feature-card">
              <h3>Employee Profile</h3>
              <p>Comprehensive employee information management</p>
            </div>
          </div>
        </div>
      </section>

      {/* Under Development Locked Screen */}
      {/* <LockedScreen message="This page is under development. Coming soon!" /> */}
    </div>
  );
}
