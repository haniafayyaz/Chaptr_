import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/challenges.css';

const ReadingChallenge = () => {
  const [challenges, setChallenges] = useState([]);
  const [enrolledChallenges, setEnrolledChallenges] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('startDate');

  // Handle navbar toggle
  const handleNavToggle = (isOpen) => {
    setIsNavOpen(isOpen);
  };

  // Fetch user from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  // Fetch all challenges on mount
  useEffect(() => {
    fetchChallenges();
  }, []);

  // Fetch enrolled challenges when user is available
  useEffect(() => {
    if (user && user.username) {
      fetchEnrolledChallenges(user.username);
    }
  }, [user]);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/reading-challenges');
      setChallenges(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch challenges. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledChallenges = async (username) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/reading-challenges/enrolled/${username}`);
      setEnrolledChallenges(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch enrolled challenges.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (challengeId) => {
    if (!user || !user.username) {
      setError('Please log in to enroll in a challenge.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/reading-challenges/enroll', {
        username: user.username,
        challengeId,
      });
      setSuccess(response.data.message);
      setError(null);
      await Promise.all([fetchChallenges(), fetchEnrolledChallenges(user.username)]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in challenge.');
      setSuccess(null);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort challenges
  const filteredChallenges = challenges
    .filter((challenge) =>
      challenge.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === 'startDate') {
        return new Date(a.startDate) - new Date(b.startDate);
      } else if (sortOption === 'pages') {
        return a.noOfPages - b.noOfPages;
      } else if (sortOption === 'participants') {
        return b.participants.length - a.participants.length;
      }
      return 0;
    });

  return (
    <div className={`page-wrapper ${isNavOpen ? 'nav-open' : ''}`}>
      <Navbar onToggle={handleNavToggle} />

          {/* Hero Section */}
          <section className="challenges-hero-section">
        <div className="challenges-hero-content">
          <h1>Join a Reading Challenge</h1>
          <p>Embark on a journey of knowledge and discovery with our exciting challenges!</p>
          <button 
            className="challenges-cta-button" 
            disabled={!user} 
            onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
          >
            Explore Challenges
          </button>
        </div>
      </section>

      <main className="container">
        {/* User Stats */}
        {user && (
          <section className="stats-section">
            <h2>Your Reading Journey</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>{enrolledChallenges.length}</h3>
                <p>Challenges Joined</p>
              </div>
              <div className="stat-card">
                <h3>{enrolledChallenges.reduce((sum, c) => sum + c.pagesRead, 0)}</h3>
                <p>Pages Read</p>
              </div>
              <div className="stat-card">
                <h3>{enrolledChallenges.filter(c => c.pagesRead >= c.challenge.noOfPages).length}</h3>
                <p>Challenges Completed</p>
              </div>
            </div>
          </section>
        )}

        {/* Error and Success Messages */}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="success" role="alert">
            {success}
          </p>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}

        {/* Enrolled Challenges Section */}
        <section className="enrolled-section" aria-labelledby="enrolled-challenges">
          <h2 id="enrolled-challenges">Your Enrolled Challenges</h2>
          {!user ? (
            <p className="no-challenges">Please log in to view your enrolled challenges.</p>
          ) : enrolledChallenges.length === 0 ? (
            <p className="no-challenges">No enrolled challenges found.</p>
          ) : (
            <div className="challenges-grid">
              {enrolledChallenges.map((progress, index) => (
                <article key={progress._id} className="challenge-card" style={{ animationDelay: `${index * 100}ms` }}>
                  <h3>{progress.challenge.title}</h3>
                  <p>Start: {new Date(progress.challenge.startDate).toLocaleDateString()}</p>
                  <p>End: {new Date(progress.challenge.endDate).toLocaleDateString()}</p>
                  <p>Pages: {progress.challenge.noOfPages}</p>
                  <p>Pages Read: {progress.pagesRead}</p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(progress.pagesRead / progress.challenge.noOfPages) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p>Joined: {new Date(progress.joinedAt).toLocaleDateString()}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Filter and Search Bar */}
        <section className="filter-section">
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              aria-label="Search challenges by title"
            />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="sort-select"
              aria-label="Sort challenges"
            >
              <option value="startDate">Sort by Start Date</option>
              <option value="pages">Sort by Pages</option>
              <option value="participants">Sort by Participants</option>
            </select>
          </div>
        </section>

        {/* All Challenges Section */}
        <section aria-labelledby="all-challenges">
          <h2 id="all-challenges">All Challenges</h2>
          {filteredChallenges.length === 0 ? (
            <p className="no-challenges">No challenges found.</p>
          ) : (
            <div className="challenges-grid">
              {filteredChallenges.map((challenge, index) => (
                <article key={challenge._id} className="challenge-card" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="badge-container">
                    {challenge.participants.length > 50 && <span className="badge popular">Popular</span>}
                    {new Date(challenge.startDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                      <span className="badge new">New</span>
                    )}
                  </div>
                  <h3>{challenge.title}</h3>
                  <p>Start: {new Date(challenge.startDate).toLocaleDateString()}</p>
                  <p>End: {new Date(challenge.endDate).toLocaleDateString()}</p>
                  <p>Pages: {challenge.noOfPages}</p>
                  <p>Participants: {challenge.participants.length}</p>
                  <div className="button-group">
                    <button
                      onClick={() => handleEnroll(challenge._id)}
                      className="button enroll-button"
                      disabled={!user || loading}
                      aria-label={`Enroll in ${challenge.title} challenge`}
                      title={user ? 'Enroll in this challenge' : 'Log in to enroll'}
                    >
                      {loading ? 'Enrolling...' : 'Enroll'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 Reading Challenges. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default ReadingChallenge;