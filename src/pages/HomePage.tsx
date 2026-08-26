import "./HomePage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getVisibleHrResourceGroups } from "../config/hrResources";
import { useUser } from "../context/UserContext";
// import slideLogo from "../assets/image.webp";

export default function HomePage() {
  const { userInfo } = useUser();
  const keyFeatures = useMemo(
    () => getVisibleHrResourceGroups(userInfo?.eligibleTypeCode),
    [userInfo?.eligibleTypeCode]
  );

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
                    <li key={link.text}>
                      {link.url.startsWith("/") ? (
                        <Link to={link.url} className="card-link">
                          {link.text}
                        </Link>
                      ) : (
                        <a
                          href={link.url}
                          className="card-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.text}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>

                <FontAwesomeIcon
                  className="feature-icon"
                  icon={feature.homeIcon}
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
