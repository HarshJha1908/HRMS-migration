import './Navbar 1.css';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useUser } from '../context/UserContext';
import { getVisibleHrResourceGroups } from '../config/hrResources';

export default function Navbar1() {
  const { user, } = useAuth();
  const {
    isManager,
    isAdmin,
    userInfo,
  } = useUser();
  const hrResourceNavbarOrder = [
    "Kolkata Center HR Policies",
    "Reward & Recognition Portal",
    "Training & Certification Portal",
    "Payroll Portal",
    "TEMS",
    "Hospitalization",
    "Other Important Links"
  ];
//const testEligibleTypeCode = "IN091A";
  const hrResourceGroups = useMemo(
    () =>
      getVisibleHrResourceGroups(userInfo?.eligibleTypeCode)
    //getVisibleHrResourceGroups(testEligibleTypeCode)
        .filter((group) => group.navIcon)
        .sort(
          (left, right) =>
            hrResourceNavbarOrder.indexOf(left.title) -
            hrResourceNavbarOrder.indexOf(right.title)
        ),
    [userInfo?.eligibleTypeCode]
  );

  return (
    <header className="navbar">
      <nav className="navbar-container">
        <div className="navbar-left">

          <Link className="nav-item" to="/">Home</Link>

          {/* <div className="dropdown">
            <span className="nav-item dropdown-toggle">Career</span>
            <div className="dropdown-menu qr-dropdown">
              <Link to="/job-vacancy" className="dropdown-item">Job Vacancy</Link>
              <Link to="/manage-job-vacancy" className="dropdown-item">Manage Job Vacancy</Link>
            </div>
          </div> */}

          {/* My Workspace Mega Menu */}
          <div className="dropdown">
            <span className="nav-item dropdown-toggle nav-tip" data-tooltip="View your profile, apply leave, and check holidays">My Workspace</span>

            <div className="dropdown-menu hr-mega-menu workspace-mega-menu">
              <div className="hr-mega-grid workspace-mega-grid">
                <div className="hr-mega-column">
                  <div className="hr-mega-heading">
                    <span className="hr-mega-icon hr-mega-icon--blue" aria-hidden="true">👤</span> My Profile
                  </div>
                  <ul className="hr-mega-list">
                    <li><Link to="/my-profile" className="hr-mega-link" title="View and update your personal information">View / Edit Profile</Link></li>
                    <li><Link to="/insurance" className="hr-mega-link" title="Update employee insurance details">Update Insurance Info</Link></li>
                  </ul>
                </div>

                <div className="hr-mega-column">
                  <div className="hr-mega-heading">
                    <span className="hr-mega-icon hr-mega-icon--orange" aria-hidden="true">🏖️</span> Leave Management
                  </div>
                  <ul className="hr-mega-list">
                    <li><Link to="/apply-leave" className="hr-mega-link" title="Submit a new leave request">Apply Leave</Link></li>
                    <li><Link to="/leave-balance" className="hr-mega-link" title="Check your available leave balance">Leave Balance</Link></li>
                    <li><Link to="/leave-details" className="hr-mega-link" title="View past and pending leave requests">Leave History</Link></li>
                  </ul>
                </div>

                <div className="hr-mega-column">
                  <div className="hr-mega-heading">
                    <span className="hr-mega-icon hr-mega-icon--purple" aria-hidden="true">📅</span> Holidays &amp; Policies
                  </div>
                  <ul className="hr-mega-list">
                    <li><Link to="/holiday-list" className="hr-mega-link" title="See company holidays">Holiday List</Link></li>
                    <li><Link to="/leave-rules" className="hr-mega-link" title="Understand leave policies and rules">Leave Rules</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          {isManager && (
            <div className="dropdown">
              <span className="nav-item dropdown-toggle nav-tip" data-tooltip="Approve requests and manage your team">Manager Dashboard</span>

              <div className="dropdown-menu hr-mega-menu manager-mega-menu">
                <div className="hr-mega-grid manager-mega-grid">
                  <div className="hr-mega-column">
                    <div className="hr-mega-heading">
                      <span className="hr-mega-icon hr-mega-icon--green" aria-hidden="true">✅</span> Approvals
                    </div>
                    <ul className="hr-mega-list">
                      <li><Link to="/pending-approval" className="hr-mega-link" title="Review and approve team requests">Pending Requests</Link></li>
                      <li><Link to="/team-leave-details" className="hr-mega-link" title="View past approvals and decisions">Approval History</Link></li>
                    </ul>
                  </div>

                  {/* <div className="hr-mega-column">
                    <div className="hr-mega-heading">
                      <span className="hr-mega-icon hr-mega-icon--teal" aria-hidden="true">👥</span> Team Overview
                    </div>
                    <ul className="hr-mega-list">
                      <li><Link to="/locked" className="hr-mega-link" title="See team leave schedule">Team Leave Calendar</Link></li>
                      <li><Link to="/locked" className="hr-mega-link" title="View team attendance summary">Attendance Summary</Link></li>
                    </ul>
                  </div> */}

                  <div className="hr-mega-column">
                    <div className="hr-mega-heading">
                      <span className="hr-mega-icon hr-mega-icon--indigo" aria-hidden="true">📊</span> Reports &amp; Records
                    </div>
                    <ul className="hr-mega-list">
                      {/* <li><Link to="/download-center?type=leave-details" className="hr-mega-link" title="Download team leave reports">Leave Reports</Link></li>
                      <li><Link to="/download-center?type=leave-balance" className="hr-mega-link" title="Check leave balance for team members">Leave Balances</Link></li> */}
                      <li><Link to="/summary-report" className="hr-mega-link" title="View summary reports">Summary report</Link></li>
                      {/* <li><Link to="/download-center?type=emergency-contact" className="hr-mega-link" title="View team emergency contact details">Emergency Contacts</Link></li> */}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* HR Policies & Resources Mega Menu */}
          <div className="dropdown">
            <span className="nav-item dropdown-toggle nav-tip" data-tooltip="Access company policies, SOPs, and resources">HR Policies &amp; Resources</span>

            <div className="dropdown-menu hr-mega-menu">
              <div className="hr-mega-grid">
                {hrResourceGroups.map((group) => (
                  <div className="hr-mega-column" key={group.title}>
                    <div className="hr-mega-heading">
                      <span
                        className={`hr-mega-icon ${group.navIconClassName}`}
                        aria-hidden="true"
                      >
                        {group.navIcon}
                      </span>{" "}
                      {group.navTitle || group.title}
                    </div>
                    <ul className="hr-mega-list">
                      {group.links.map((link) => {
                        const href = link.navUrl || link.url;
                        const label = link.navText || link.text;

                        return (
                          <li key={label}>
                            {href.startsWith("/") ? (
                              <Link to={href} className="hr-mega-link" title={link.title}>
                                {label}
                              </Link>
                            ) : (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hr-mega-link"
                                title={link.title}
                              >
                                {label}
                              </a>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* HR Administration Mega Menu */}
          {isAdmin && (
            <div className="dropdown hr-admin-dropdown">
              <span className="nav-item dropdown-toggle nav-tip" data-tooltip="Manage employees, reports, and HR controls">HR Administration</span>

              <div className="dropdown-menu hr-mega-menu hr-admin-mega-menu">
                <div className="hr-mega-grid hr-admin-mega-grid">
                  <div className="hr-mega-column">
                    <div className="hr-mega-heading">
                      <span className="hr-mega-icon hr-mega-icon--indigo" aria-hidden="true">📊</span> Reports &amp; Exports
                    </div>
                    <ul className="hr-mega-list">
                      <li><Link to="/quick-export" className="hr-mega-link" title="View overall leave summary">Quick Export</Link></li>
                      {/* <li><Link to="/summary-report" className="hr-mega-link" title="View overall leave summary">Summary Report</Link></li> */}
                      {/* <li><Link to="/locked" className="hr-mega-link" title="Export employee leave data">Leave Reports</Link></li>
                      <li><Link to="/locked" className="hr-mega-link" title="Download yearly leave balance and details">Year-wise Balance Export</Link></li>
                      <li><Link to="/locked" className="hr-mega-link" title="Export all employee emergency contacts">Emergency Contacts (All)</Link></li> */}
                    </ul>
                  </div>

                  <div className="hr-mega-column">
                    <div className="hr-mega-heading">
                      <span className="hr-mega-icon hr-mega-icon--orange" aria-hidden="true">⚙️</span> Employee Actions
                    </div>
                    <ul className="hr-mega-list">
                      <li><Link to="/profile" className="hr-mega-link" title="Add a new employee profile">Create New Profile</Link></li>
                      <li><Link to="/special-leave-entry" className="hr-mega-link" title="Grant special leave to employees">Assign Special Leave</Link></li>
                      <li><Link to="/special-leave-entry" className="hr-mega-link" title="Revoke assigned special leave">Remove Special Leaves</Link></li>
                      <li><Link to="/special-leave-entry?type=export" className="hr-mega-link" title="Download special leave records">Export Special Leaves</Link></li>
                    </ul>
                  </div>

                  <div className="hr-mega-column">
                    <div className="hr-mega-heading">
                      <span className="hr-mega-icon hr-mega-icon--purple" aria-hidden="true">🔎</span> Employee Search &amp; Manage
                    </div>
                    <ul className="hr-mega-list">
                      <li><Link to="/Single-search" className="hr-mega-link" title="Update employee profile details">Profile Update</Link></li>
                      <li><Link to="/Single-search" className="hr-mega-link" title="Modify employee leave balance">Leave Adjustments</Link></li>
                      <li><Link to="/Single-search" className="hr-mega-link" title="Create special leave cases">Create Exception Leave</Link></li>
                      <li><Link to="/Single-search" className="hr-mega-link" title="Update employee insurance details">Update Insurance Info</Link></li>
                      <li><Link to="/Single-search" className="hr-mega-link" title="Calculate leave during exit process">Exit Leave Adjustment</Link></li>
                    </ul>
                  </div>

                  {/* <div className="hr-mega-column">
                    <div className="hr-mega-heading">
                      <span className="hr-mega-icon hr-mega-icon--green" aria-hidden="true">🧩</span> Configuration
                    </div>
                    <ul className="hr-mega-list">
                      <li><Link to="/documents?role=admin" className="hr-mega-link" title="Configure HR policies">Manage Policies</Link></li>
                      <li><Link to="/locked" className="hr-mega-link" title="Manage announcements and HR messages">Manage Event Messages</Link></li>
                    </ul>
                  </div> */}
                </div>
              </div>
            </div>
          )}
        </div>


        <div className="navbar-right">
          {user ? (
            <>
              <span className="welcome-text">Welcome {user.name}</span> {/* user.upn */}
              {/* <button
                type="button"
                onClick={signOut}
                className="signout-btn"
                title="Sign out"
              >
                Sign out
              </button> */}
            </>
          ) : (
            <span className="welcome-text">Signing in&hellip;</span>
          )}
        </div>
      </nav>
    </header>
  );
}
 
