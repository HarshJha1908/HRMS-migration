import { useEffect, useMemo, useState } from "react";
import './Navbar.css';
import { Link } from 'react-router-dom';
import { getDocumentTypes } from "../services/apiService";

type QuickReferenceSection = {
  id: string;
  label: string;
  to?: string;
  links?: Array<{ to: string; label: string }>;
  alwaysVisible?: boolean;
};

const QUICK_REFERENCE_CONFIG: Record<string, QuickReferenceSection> = {
  KP: {
    id: "KP",
    label: "Kolkata Center HR Policies",
    to: "/documents/KP"
  },
  HZ: {
    id: "HZ",
    label: "Hospitalization",
    to: "/documents/HZ"
  },
  STATIC1: {
    id: "STATIC1",
    label: "Important Links",
    links: [
      { to: "/something", label: "Claims Portal" },
      { to: "/something-else", label: "Training & Certifications" },
      { to: "/another-link", label: "Rewards & Recognition" },
      { to: "/one-more-link", label: "Payroll Portal" }


    ],
    alwaysVisible: true
  }
};

const QUICK_REFERENCE_ORDER = ["KP", "HZ", "STATIC1"];

export default function Navbar() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [documentTypeCodes, setDocumentTypeCodes] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  useEffect(() => {
    let isMounted = true;

    const loadDocumentTypes = async () => {
      try {
        const items = await getDocumentTypes();
        if (!isMounted) return;

        setDocumentTypeCodes(items.map((item) => item.docCode));
      } catch {
        if (!isMounted) return;
        setDocumentTypeCodes([]);
      }
    };

    void loadDocumentTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  const quickReferenceSections = useMemo(
    () =>
      QUICK_REFERENCE_ORDER
        .filter((docCode) => {
          const section = QUICK_REFERENCE_CONFIG[docCode];
          return section?.alwaysVisible || documentTypeCodes.includes(docCode);
        })
        .map((docCode) => QUICK_REFERENCE_CONFIG[docCode])
        .filter((section): section is QuickReferenceSection => Boolean(section)),
    [documentTypeCodes]
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
            <span className="nav-item dropdown-toggle">My Team</span>
            <div className="dropdown-menu qr-dropdown">
              <Link to="/pending-approval" className="dropdown-item">Pending Approval</Link>
              <Link to="/team-leave-details" className="dropdown-item">Team Leave Details</Link>
              <Link to="/quick-export" className="dropdown-item">Quick Export</Link>
              <Link to="/download-center" className="dropdown-item">Download Center</Link>
            </div>
          </div>


          {/* Quick Reference Accordion Dropdown */}
          <div className="dropdown">
            <span className="nav-item dropdown-toggle">Quick Reference</span>

            <div className="dropdown-menu qr-dropdown">
              {quickReferenceSections.map((section) => (
                <div key={section.id}>
                  {section.to ? (
                    <Link to={section.to} className="qr-parent no-children">
                      {section.label}
                    </Link>
                  ) : (
                    <>
                      <div
                        className={`qr-parent ${openSection === section.id ? "active" : ""} ${section.links?.length ? "" : "no-children"}`.trim()}
                        onClick={() => section.links?.length && toggleSection(section.id)}
                      >
                        {section.label}
                      </div>
                      {section.links?.length && openSection === section.id && (
                        <div className="qr-children">
                          {section.links.map((link) => (
                            <Link key={link.to} to={link.to} className="qr-child">
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
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
