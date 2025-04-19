import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/landingPage.css";
import landingVideo from '../assets/landingpagevideo.mp4';

const LandingPage = () => {
  return (
    <div className="landing-page">

      {/* Background Video */}
      <video className="background-video" autoPlay loop muted>
        <source src={landingVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay to control transparency */}
      <div className="video-overlay"></div>

      {/* Logo in the top left corner */}
      <div className="logo">
        <span className="logo-icon">📖</span>
        <span className="logo-text">Chaptr</span>
      </div>

      {/* Login and Signup buttons in the top right corner */}
      <div className="auth-buttons">
        <Link to="/login" className="auth-button login-button">Login</Link>
        <Link to="/register" className="auth-button signup-button">Sign up</Link>
      </div>

      {/* Main content */}
      <div className="hero-content">
        <h1 className="hero-title">Chaptr</h1>
        <p className="hero-subtitle">Your Reading Journey, All in One Place</p>
      </div>

    </div>
  );
};

export default LandingPage;
