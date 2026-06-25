import "./HomePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  faArrowUpRightFromSquare,
  faAward,
  faChalkboardUser,
  faClipboardList,
  faDoorOpen,
  faHandHoldingMedical,
  faHospital,
  faLandmark,
  type IconDefinition
} from "@fortawesome/free-solid-svg-icons";
// import slideLogo from "../assets/image.webp";

type KeyFeature = {
  title: string;
  links: string[] | { text: string; url: string }[];
  icon: IconDefinition;
};

const keyFeatures: KeyFeature[] = [
{
  title: "Kolkata Center Leave Tool",
  links: [
    {
      text: "Home",
      url: "/leave-tool-home"
    }
  ],
  icon: faDoorOpen
},
{
  title: "Kolkata Center HR Policies",
  links: [
    {
      text: "LGSS Policies",
      url: "https://lindegroup.sharepoint.com/sites/Linde%20IS%20Kolkata%20Center/SitePages/HR%20Home.aspx?RootFolder=%2fsites%2fLinde+IS+Kolkata+Center%2fHR+Documents%2fLISKC+Local+Policies&FolderCTID=0x012000920ADECB82359C489EFB07D283255E88&View=%7bFE8B44BC-9711-424F-A0B9-FD411227CA94%7d&xsdata=MDV8MDJ8c2F5YW50aW5pLnNlbi5jaG91ZGh1cnlAbGluZGUuY29tfDhiYzdjYzg1ZWNhMzQzYTVmZDMwMDhkZDAwM2U3YmFifDE1NjJmMDA3MDlhNDRmY2I5MzZiZTc5MjQ2NTcxZmM3fDB8MHw2Mzg2NjY5OTA1MzgxMDYwNTJ8VW5rbm93bnxUV0ZwYkdac2IzZDhleUpGYlhCMGVVMWhjR2tpT25SeWRXVXNJbFlpT2lJd0xqQXVNREF3TUNJc0lsQWlPaUpYYVc0ek1pSXNJa0ZPSWpvaVRXRnBiQ0lzSWxkVUlqb3lmUT09fDB8fHw%3d&sdata=WEVjTTRvSkxOZTZUU3hENU1sL29ISHBQc2d6a1Arbmo0SkttZFpvMXVQcz0%3dEnter+text+here...&SafelinksUrl=https%3a%2f%2flindegroup.sharepoint.com%2fsites%2fLinde%2520IS%2520Kolkata%2520Center%2fSitePages%2fHR%2520Home.aspx&SafelinksUrl=https%3a%2f%2flindegroup.sharepoint.com%2fsites%2fLinde%2520IS%2520Kolkata%2520Center%2fSitePages%2fHR%2520Home.aspx"
    }
  ],
  icon: faClipboardList
},
  {
    title: "Payroll Portal",
    links: [
      {
        text: "Home",
        url: "https://www.cquel.com/lgss/payroll/home.php"
      }
    ],
    icon: faLandmark
  },
  {
    title: "Hospitalization",
    links: [
      {
        text: "Reimbursement Claim Form",
        url: "https://prod.hrms.linde.grp/DocHRMS/Hospitalization/Claim%20Form.pdf"
      },
      {
        text: "Network Hospital List",
        url: "https://portal.mediassist.in/Home.aspx"
      },
      {
        text: "All Hospitalization Related Information",
        url: "https://prod.hrms.linde.grp/DocHRMS/Hospitalization/All%20relevant%20information%20regarding%20Hospitalization"
      },
      {
        text: "GPA/GTL/GHI Declaration",
        url: "/insurance"
      }
    ],
    icon: faHospital
  },
  {
    title: "Reward & Recognition Portal",
    links: [
      {
        text: "Home",
        url: "https://apps.powerapps.com/play/e/default-1562f007-09a4-4fcb-936b-e79246571fc7/a/66ac46e3-2b3e-4091-8499-712b0ba26628"
      }
    ],
    icon: faAward
  },
  {
    title: "Training & Certification Portal",
    links: [
      {
        text: "Home",
        url: "https://apps.powerapps.com/play/e/613585e3-8656-4fe7-960f-0ca2d2332bd2/a/dcec88b5-27a8-480c-9efe-f28a9d431354?tenantId=1562f007-09a4-4fcb-936b-e79246571fc7"
      }
    ],
    icon: faChalkboardUser
  },
  {
    title: "Other Important Links",
    links: [
      {
        text: "Linde Intranet",
        url: "https://lindegroup.sharepoint.com/sites/Airtime"
      },
      {
        text: "SMAX",
        url: "https://smax.linde.com/homepage"
      },
      {
        text: "My Linde Portal",
        url: "https://pgw.linde.grp/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html"
      },
      {
        text: "Onboarding Or Induction Materials",
        url: "https://lindegroup.sharepoint.com/sites/Linde%20IS%20Kolkata%20Center/SitePages/HR%20Home.aspx"
      }
    ],
    icon: faArrowUpRightFromSquare
  },
  {
    title: "TEMS",
    links: [
      {
        text: "Claims Portal",
        url: "https://etms.rse.linde.grp/PC/home.aspx"
      }
    ],
    icon: faHandHoldingMedical
  }
];

export default function HomePage() {
  return (
    <div className="home-page">
      {/* Preload Hero Image */}
      {/* <link
        rel="preload"
        as="image"
        href={slideLogo}
        type="image/webp"
      /> */}

      {/* Hero Image Section */}
      <section className="hero-section">
        <div className="hero-container">
          <img
            src="/image.webp"
            alt="Linde Logo"
            className="hero-image"
            fetchPriority="high"
            loading="eager"
            decoding="async"
            width="1920"
            height="420"
          />
        </div>
      </section>

      {/* Welcome Section */}
      <section className="welcome-section">
        <div className="welcome-container">
          <h2>Welcome to Linde IT Kolkata Hub</h2>
          {/* <p>
            A comprehensive Human Resource Management System designed to
            streamline your HR operations and enhance employee experience.
          </p> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-grid">
            {keyFeatures.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <h3>{feature.title}</h3>

                <ul className="feature-links">
                  {feature.links.map((link) => (
                    <li key={typeof link === "string" ? link : link.text}>
                      {typeof link === "string" ? (
                        <span>{link}</span>
                      ) : (
                        link.url.startsWith("/") ? (
                          <Link to={link.url} className="card-link">
                            {link.text}
                          </Link>
                        ) : (
                          <a href={link.url}  className="card-link" target="_blank" rel="noopener noreferrer">
                            {link.text}
                          </a>
                        )
                      )}
                    </li>
                  ))}
                </ul>

                <FontAwesomeIcon
                  className="feature-icon"
                  icon={feature.icon}
                  aria-hidden="true"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 
