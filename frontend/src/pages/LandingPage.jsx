// landingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/landingPage.css";
import landingVideo from '../assets/landingpagevideo.mp4';

const LandingPage = () => {
  return (
    <div className="landing-page-container">

      {/* Background Video */}
      <video className="landing-page-video" autoPlay loop muted>
        <source src={landingVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay to control transparency */}
      <div className="landing-page-overlay"></div>

      {/* Logo in the top left corner */}
      <div className="landing-page-logo">
        <span className="landing-page-logo-icon">📖</span>
        <span className="landing-page-logo-text">Chaptr</span>
      </div>

      {/* Login and Signup buttons in the top right corner */}
      <div className="landing-page-auth-buttons">
        <Link to="/login" className="landing-page-auth-button landing-page-login-button">Login</Link>
        <Link to="/register" className="landing-page-auth-button landing-page-signup-button">Sign up</Link>
      </div>

      {/* Main content */}
      <div className="landing-page-hero">
        <h1 className="landing-page-hero-title">Chaptr</h1>
        <p className="landing-page-hero-subtitle">Your Reading Journey, All in One Place</p>
      </div>

    </div>
  );
};

export default LandingPage;