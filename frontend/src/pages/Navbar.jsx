import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = ({ onToggle }) => {
  const [isOpen, setIsOpen] = useState(false); // Changed default to false to start closed
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    // Check localStorage for isAuthor
    const userData = localStorage.getItem('user');
    const parsedUser = JSON.parse(userData);
    const authorStatus = parsedUser?.isAuthor;
    setIsAuthor(authorStatus === true);
  }, []);

  const toggleNavbar = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (onToggle) {
      onToggle(newIsOpen); // Notify parent of state change
    }
  };

  return (
    <>
      <button
        className={`nav-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleNavbar}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      >
        <span className="toggle-icon">→</span>
      </button>
      <div className={`side-panel ${isOpen ? 'open' : ''}`}>
        <h1 className="brand-title">Chaptr</h1>
        <nav className="navigation">
          <Link
            to="/dashboard"
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/clubs"
            className={`nav-link ${location.pathname === '/clubs' ? 'active' : ''}`}
          >
            Book Clubs
          </Link>
          {<Link
            to="/challenges"
            className={`nav-link ${location.pathname === '/challenges' ? 'active' : ''}`}
          >
            Challenges
          </Link> }
          <Link
            to="/books"
            className={`nav-link ${location.pathname === '/books' ? 'active' : ''}`}
          >
            Discover
          </Link>
          <Link
            to="/authors"
            className={`nav-link ${location.pathname === '/authors' ? 'active' : ''}`}
          >
            Authors
          </Link>
          <Link
            to="/calendar"
            className={`nav-link ${location.pathname === '/calendar' ? 'active' : ''}`}
          >
            Calendar
          </Link>
          {isAuthor && (
            <Link
              to="/publications"
              className={`nav-link ${location.pathname === '/publications' ? 'active' : ''}`}
            >
              Publications
            </Link>
          )}
        </nav>
        <div className="nav-footer">
          <div className="nav-decoration"></div>
          <div className="nav-decoration"></div>
          <div className="nav-decoration"></div>
        </div>
      </div>
    </>
  );
};

export default Navbar;