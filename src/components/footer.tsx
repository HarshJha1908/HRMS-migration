import './footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-line">
        Copyright © {currentYear} · All Rights Reserved · Corporate IT Hub, Kolkata
      </div>
    </footer>
  );
};

export default Footer;