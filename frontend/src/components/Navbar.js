import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../assets/css/Navbar.css";

const Navbar = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">netsafehub</Link>
        <span
          className="navbar-toggler" 
          type="button" 
          onClick={toggleNavbar} 
          style={{ border: "none", outline: "none", padding: "5px" }}
        >
          <span className="navbar-toggler-icon"></span>
        </span>
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><Link className="nav-link" to="/services">Services</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/gallery">Gallery</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/testimonials">Testimonials</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/contact">Contact</Link></li>
            
            {/* Admin section - only visible if user is an admin */}
            {user?.role === 'admin' && (
              <li className="nav-item"><Link className="nav-link" to="/admin">Admin</Link></li>
            )}
            
            {/* Login/Logout Button */}
            <li className="nav-item">
              {user ? (
                <Link className="nav-link" to="/logout">Logout</Link>
              ) : (
                <Link className="nav-link" to="/login">Login</Link>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
