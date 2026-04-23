import { useState } from "react";
import './Navbar.css';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <header className="navbar">
      <nav className="navbar-container">
        <div className="navbar-left">

          <Link className="nav-item" to="/">Home</Link>

          <div className="dropdown">
            <span className="nav-item dropdown-toggle">Career</span>
            <div className="dropdown-menu qr-dropdown">
              <Link to="/job-vacancy" className="dropdown-item">Job Vacancy</Link>
              <Link to="/manage-job-vacancy" className="dropdown-item">Manage Job Vacancy</Link>
            </div>
          </div>

          {/* Leave dropdown (unchanged) */}
          <div className="dropdown">
            <span className="nav-item dropdown-toggle">Leave</span>
            <div className="dropdown-menu qr-dropdown">
              <Link to="/my-profile" className="dropdown-item">My Profile</Link>
              <Link to="/apply-leave" className="dropdown-item">Apply Leave</Link>
              <Link to="/leave-details" className="dropdown-item">Leave Details</Link>
              <Link to="/holiday-list" className="dropdown-item">Holiday List</Link>
              <Link to="/leave-rules" className="dropdown-item">Leave Rules</Link>
            </div>
          </div>

          <div className="dropdown">
            <span className="nav-item dropdown-toggle">Manager</span>
            <div className="dropdown-menu qr-dropdown">
              <Link to="/pending-approval" className="dropdown-item">Pending Approval</Link>
              <Link to="/team-leave-details" className="dropdown-item">Team Leave Details</Link>
              <Link to="/emergency-contact" className="dropdown-item">Emergency Contact</Link>
            </div>
          </div>


          {/* Quick Reference Accordion Dropdown */}
          <div className="dropdown">
            <span className="nav-item dropdown-toggle">Quick Reference</span>

            <div className="dropdown-menu qr-dropdown">

              {/* HR Policies */}
              <div
                className={`qr-parent ${openSection === "hr" ? "active" : ""}`}
                onClick={() => toggleSection("hr")}
              >
                HR Policies
              </div>
              {openSection === "hr" && (
                <div className="qr-children">
                  <Link to="/lgss-policies" className="qr-child">LGSS Policies</Link>
                </div>
              )}

              {/* Payroll Portal */}
              <div
                className={`qr-parent ${openSection === "payroll" ? "active" : ""}`}
                onClick={() => toggleSection("payroll")}
              >
                Payroll Portal
              </div>
              {openSection === "payroll" && (
                <div className="qr-children">
                  <Link to="/payroll-portal" className="qr-child">Payroll Portal</Link>
                </div>
              )}

              {/* Hospitalization */}
              <div
                className={`qr-parent ${openSection === "hospital" ? "active" : ""}`}
                onClick={() => toggleSection("hospital")}
              >
                Hospitalization
              </div>
              {openSection === "hospital" && (
                <div className="qr-children">
                  <Link to="/reimbursement" className="qr-child">Reimbursement Claim Form</Link>
                  <Link to="/network-hospital" className="qr-child">Network Hospital List</Link>
                  <Link to="/hospital-info" className="qr-child">All Hospitalization Related Information</Link>
                  <Link to="/insurance" className="qr-child">GPA/GTL Declaration</Link>
                </div>
              )}

            </div>
          </div>

          {/* Report dropdown */}
          <div className="dropdown">
            <div className="nav-item dropdown-toggle">HR</div>
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">Create Profile</Link>
              <Link to="/Single-search" className="dropdown-item">Single Search</Link>
              <Link to="/special-leave-entry" className="dropdown-item">Special Leave Entry</Link>
            </div>

          </div>
        </div>

        <div className="navbar-right">
          Welcome Tania Bhattacharjee
        </div>
      </nav>
    </header>
  );
}
