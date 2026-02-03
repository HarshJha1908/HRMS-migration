import './Navbar.css';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar-container">
        <div className="navbar-left">
           <Link className="nav-item" to="/">HOME</Link>
          <Link className="nav-item" to="/leave-details">LEAVE</Link>
          <button className="nav-item" type="button">HELP CARDS</button>
        </div>

        <div className="navbar-right">
          Welcome Tania Bhattacharjee
        </div>
      </nav>
    </header>
  );
}
