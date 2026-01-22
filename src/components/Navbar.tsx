import './Navbar.css';

export default function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar-container">
        <div className="navbar-left">
          <span className="nav-item">HOME</span>
          <span className="nav-item">LEAVE</span>
          <span className="nav-item">HELP CARDS</span>
        </div>

        <div className="navbar-right">
          Welcome Harsh Kumar Jha
        </div>
      </nav>
    </header>
  );
}
