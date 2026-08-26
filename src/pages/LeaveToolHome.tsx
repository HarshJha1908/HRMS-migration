import LeaveBalance from "../components/LeaveBalance";
import "./HomePage.css";
import "./LeaveToolHome.css";

export default function LeaveToolHome() {
  return (
    <div className="home-page leave-tool-home">
      <section className="hero-section">
        <div className="hero-container">
          <img
            src="/homepage-banner.svg"
            alt="Linde banner"
            className="hero-image"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            width="766"
            height="271"
          />
        </div>
      </section>

      <section className="welcome-section">
        <div className="welcome-container">
          <h2>Welcome to Linde IT Kolkata Hub</h2>
        </div>
      </section>

      <section className="leave-tool-dashboard-section">
        <div className="leave-tool-dashboard-container">
          <LeaveBalance showDashboardCards={true} showLeaveBalanceDetails={false} />
        </div>
      </section>
    </div>
  );
}
