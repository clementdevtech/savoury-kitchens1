import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "../assets/css/Navbar.css";
import logo from "../assets/images/logo.png";

const API_URL = process.env.REACT_APP_API_URL;

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = () => setIsOpen(!isOpen);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true); 
    
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          setLoading(false); 
          return;
        }
    
        const response = await fetch(`${API_URL}/users/getuser`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) throw new Error("Unauthorized");
    
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error("Authentication Error:", err);
        setUser(null);
      } finally {
        setLoading(false); 
      }
    };    

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src={logo} alt="Logo" className="navbar-logo" />
          <span className="ms-2">Savoury Kitchens</span>
        </Link>
        <span
          className="navbar-toggler"
          onClick={toggleNavbar}
          style={{ border: "none", outline: "none", padding: "5px" }}
        >
          <span className="navbar-toggler-icon"></span>
        </span>
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><Link className="nav-link" to="/services">Services</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/gallery">Gallery</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/testimonials">Testimonials</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/about-us">About Us</Link></li>

            {/* Admin Section */}
            {user?.role === "admin" && (
              <li className="nav-item"><Link className="nav-link" to="/admin">Admin</Link></li>
            )}

            {/* Login/Logout Button */}
            <li className="nav-item">
              {loading ? (
                <span className="nav-link text-light">Loading...</span>
              ) : user ? (
                <button className="nav-link btn btn-link text-white" onClick={handleLogout}>Logout</button>
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
