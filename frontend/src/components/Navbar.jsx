import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏗️</span>
          Disaster Resilience
        </Link>
        <div className="navbar-links">
          <Link 
            to="/projects" 
            className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`}
          >
            Projects
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
