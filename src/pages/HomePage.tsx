import "./HomePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
  links: string[];
  icon: IconDefinition;
};

const keyFeatures: KeyFeature[] = [
  {
    title: "Kolkata Center Leave Tool",
    links: ["Home"],
    icon: faDoorOpen
  },
  {
    title: "Kolkata Center HR Policies",
    links: ["LGSS Policies"],
    icon: faClipboardList
  },
  {
    title: "Payroll Portal",
    links: ["Home"],
    icon: faLandmark
  },
  {
    title: "Hospitalization",
    links: [
      "Reimbursement Claim Form",
      "Network Hospital List",
      "All Hospitalization Related Information",
      "GPA/GTL/GHI Declaration"
    ],
    icon: faHospital
  },
  {
    title: "Reward & Recognition Portal",
    links: ["Home"],
    icon: faAward
  },
  {
    title: "Training & Certification Portal",
    links: ["Home"],
    icon: faChalkboardUser
  },
  {
    title: "Other Important Links",
    links: [
      "Linde Intranet",
      "SMAX",
      "My Linde Portal",
      "Onboarding Or Induction Materials"
    ],
    icon: faArrowUpRightFromSquare
  },
  {
    title: "TEMS",
    links: ["Claims Portal"],
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
                    <li key={link}>{link}</li>
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
