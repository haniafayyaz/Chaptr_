import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);

  useEffect(() => {
    // Check localStorage for isAuthor
    const userData = localStorage.getItem('user');
    const parsedUser = JSON.parse(userData);
    const authorStatus = parsedUser.isAuthor;
    console.log(authorStatus);

    setIsAuthor(authorStatus === true);
    console.log(isAuthor);
  }, []);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
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
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/clubs" className="nav-link active">Book Clubs</Link>
          <Link to="/challenges" className="nav-link">Challenges</Link>
          <Link to="/books" className="nav-link">Discover</Link>
          <Link to="/authors" className="nav-link">Authors</Link>
          <Link to="/calendar" className="nav-link">Calendar</Link>
          {isAuthor && (
            <>
              <Link to="/publications" className="nav-link">Publications</Link>
            </>
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