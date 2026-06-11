import './Navbar 1.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { useUser } from '../context/UserContext';

export default function Navbar1() {
  const { user, } = useAuth();
  const {
    isManager,
    isAdmin,
  } = useUser();
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
                      <li><Link to="/download-center?type=leave-details" className="hr-mega-link" title="Download team leave reports">Leave Reports</Link></li>
                      <li><Link to="/download-center?type=leave-balance" className="hr-mega-link" title="Check leave balance for team members">Leave Balances</Link></li>
                      <li><Link to="/download-center?type=emergency-contact" className="hr-mega-link" title="View team emergency contact details">Emergency Contacts</Link></li>
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
                <div className="hr-mega-column">
                  <div className="hr-mega-heading">
                    <span className="hr-mega-icon hr-mega-icon--blue" aria-hidden="true">📄</span> Policies
                  </div>
                  <ul className="hr-mega-list">
                    <li><a href="https://lindegroup.sharepoint.com/sites/Linde%20IS%20Kolkata%20Center/SitePages/HR%20Home.aspx?RootFolder=%2fsites%2fLinde+IS+Kolkata+Center%2fHR+Documents%2fLISKC+Local+Policies&FolderCTID=0x012000920ADECB82359C489EFB07D283255E88&View=%7bFE8B44BC-9711-424F-A0B9-FD411227CA94%7d&xsdata=MDV8MDJ8c2F5YW50aW5pLnNlbi5jaG91ZGh1cnlAbGluZGUuY29tfDhiYzdjYzg1ZWNhMzQzYTVmZDMwMDhkZDAwM2U3YmFifDE1NjJmMDA3MDlhNDRmY2I5MzZiZTc5MjQ2NTcxZmM3fDB8MHw2Mzg2NjY5OTA1MzgxMDYwNTJ8VW5rbm93bnxUV0ZwYkdac2IzZDhleUpGYlhCMGVVMWhjR2tpT25SeWRXVXNJbFlpT2lJd0xqQXVNREF3TUNJc0lsQWlPaUpYYVc0ek1pSXNJa0ZPSWpvaVRXRnBiQ0lzSWxkVUlqb3lmUT09fDB8fHw%3d&sdata=WEVjTTRvSkxOZTZUU3hENU1sL29ISHBQc2d6a1Arbmo0SkttZFpvMXVQcz0%3dEnter+text+here...&SafelinksUrl=https%3a%2f%2flindegroup.sharepoint.com%2fsites%2fLinde%2520IS%2520Kolkata%2520Center%2fSitePages%2fHR%2520Home.aspx&SafelinksUrl=https%3a%2f%2flindegroup.sharepoint.com%2fsites%2fLinde%2520IS%2520Kolkata%2520Center%2fSitePages%2fHR%2520Home.aspx" 
                   target="_blank" rel="noopener noreferrer" className="hr-mega-link">LGSS Policies</a></li>
                  </ul>
                </div>

                <div className="hr-mega-column">
                  <div className="hr-mega-heading">
                    <span className="hr-mega-icon hr-mega-icon--purple" aria-hidden="true">🏆</span> Reward &amp; Recognization
                  </div>
                  <ul className="hr-mega-list">
                    <li><a href="https://apps.powerapps.com/play/e/default-1562f007-09a4-4fcb-936b-e79246571fc7/a/66ac46e3-2b3e-4091-8499-712b0ba26628"
                      target="_blank" rel="noopener noreferrer" className="hr-mega-link">Home</a></li>
                  </ul>
                </div>

                <div className="hr-mega-column">
                  <div className="hr-mega-heading">
                   <span className="hr-mega-icon hr-mega-icon--purple" aria-hidden="true">🎓</span> Training &amp; Certification
                  </div>
                  <ul className="hr-mega-list">
                    <li><a href="https://apps.powerapps.com/play/e/613585e3-8656-4fe7-960f-0ca2d2332bd2/a/dcec88b5-27a8-480c-9efe-f28a9d431354?tenantId=1562f007-09a4-4fcb-936b-e79246571fc7"
                      target="_blank" rel="noopener noreferrer" className="hr-mega-link">Home</a></li>
                  </ul>
                </div>

                <div className="hr-mega-column">
                  <div className="hr-mega-heading">
                    <span className="hr-mega-icon hr-mega-icon--green" aria-hidden="true">🧾</span> Payroll Portal
                  </div>
                  <ul className="hr-mega-list">
                    <li><a href="https://www.cquel.com/lgss/payroll/home.php" target="_blank" rel="noopener noreferrer" className="hr-mega-link">Payroll</a></li>
                  </ul>
                </div>

                <div className="hr-mega-column">
                  <div className="hr-mega-heading">
                    <span className="hr-mega-icon hr-mega-icon--orange" aria-hidden="true">📑</span> TEMS
                  </div>
                  <ul className="hr-mega-list">
                    <li><a href="https://etms.rse.linde.grp/PC/home.aspx" target="_blank" rel="noopener noreferrer" className="hr-mega-link">Claims Portal</a></li>
                  </ul>
                </div>

                <div className="hr-mega-column">
                  <div className="hr-mega-heading">
                    <span className="hr-mega-icon hr-mega-icon--red" aria-hidden="true">🏥</span> Hospitalization
                  </div>
                  <ul className="hr-mega-list">
                    <li><a href="https://prod.hrms.linde.grp/DocHRMS/Hospitalization/Claim%20Form.pdf" target="_blank" rel="noopener noreferrer" className="hr-mega-link">Reimbursement Claim Form</a></li>
                    <li><a href="https://portal.mediassist.in/Home.aspx" 
                    target="_blank" rel="noopener noreferrer" className="hr-mega-link">Network Hospital List</a></li>
                    <li><a href="https://prod.hrms.linde.grp/DocHRMS/Hospitalization/All%20relevant%20information%20regarding%20Hospitalization" 
                    target="_blank" rel="noopener noreferrer" className="hr-mega-link">All Hospitalization Related Information</a></li>
                    <li><Link to="/insurance" className="hr-mega-link">GPA/GTL Declaration</Link></li>
                  </ul>
                </div>

                <div className="hr-mega-column">
                  <div className="hr-mega-heading">
                    <span className="hr-mega-icon hr-mega-icon--orange" aria-hidden="true">🔗</span> Quick Links
                  </div>
                  <ul className="hr-mega-list">
                    <li><a href="https://lindegroup.sharepoint.com/sites/Airtime?xsdata=MDV8MDJ8c3VtYW4uYmlzd2FzQGxpbmRlLmNvbXw2YTA5NDQ0YTJhZWQ0MTZiZWRlYTA4ZGQ4MGJkZDQyNnwxNTYyZjAwNzA5YTQ0ZmNiOTM2YmU3OTI0NjU3MWZjN3wwfDB8NjM4ODA4Mjc0OTk4MDgwNTUzfFVua25vd258VFdGcGJHWnNiM2Q4ZXlKRmJYQjBlVTFoY0draU9uUnlkV1VzSWxZaU9pSXdMakF1TURBd01DSXNJbEFpT2lKWGFXNHpNaUlzSWtGT0lqb2lUV0ZwYkNJc0lsZFVJam95ZlE9PXwwfHx8&sdata=SjJmS1NnVzlkdWN3MTlBbTlhWEtLUk5HRnNJRC9GMHQ0TXkyZk9Wd1Ridz0%3d&SafelinksUrl=https%3a%2f%2flindegroup.sharepoint.com%2fsites%2fAirtime"
                      target="_blank" rel="noopener noreferrer" className="hr-mega-link">Linde Intranet</a></li>
                    <li><a href="https://smax.linde.com/homepage" target="_blank" rel="noopener noreferrer" className="hr-mega-link">SMAX</a></li>
                    <li><a href="https://pgw.linde.grp/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-ui2-cache-disable=X&sap-client=100&sap-language=EN&sap-theme=zlgc_custom_quartz@https://pgw.linde.grp:/sap/public/bc/themes/~client-100/#Shell-home"
                      target="_blank" rel="noopener noreferrer" className="hr-mega-link">My Linde Portal</a></li>
                    <li><a href="https://lindegroup.sharepoint.com/sites/Linde%20IS%20Kolkata%20Center/SitePages/HR%20Home.aspx?RootFolder=%2Fsites%2FLinde%20IS%20Kolkata%20Center%2FHR%20Documents%2FInduction%202022&FolderCTID=0x012000920ADECB82359C489EFB07D283255E88&View=%7BFE8B44BC%2D9711%2D424F%2DA0B9%2DFD411227CA94%7D&InitialTabId=Ribbon%2ERead&VisibilityContext=WSSTabPersistence&OR=Teams-HL&CT=1696326934347&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiIyNy8yMzA5MDExMjIyOSIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3D%3D"
                      target="_blank" rel="noopener noreferrer" className="hr-mega-link">Onboarding Or Induction materials</a></li>
                  </ul>
                </div>
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
                      <li><Link to="/summary-report" className="hr-mega-link" title="View overall leave summary">Summary Report</Link></li>
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
