import './Navbar.css';


export default function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar-container">
        <div className="navbar-left">
          <a className="nav-item" href="/">HOME</a>
          <a className="nav-item" href="/leave-details">LEAVE</a>
          <a className="nav-item" >HELP CARDS</a>
        </div>

        <div className="navbar-right">
          Welcome Tania Bhattacharjee
        </div>
      </nav>
    </header>
  );
}
