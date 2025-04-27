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
    try {
      const response = await axios.get('http://localhost:5000/api/reading-challenges');
      setChallenges(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch challenges. Please try again.');
      console.error(err);
    }
  };

  const fetchEnrolledChallenges = async (username) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reading-challenges/enrolled/${username}`);
      setEnrolledChallenges(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch enrolled challenges.');
      console.error(err);
    }
  };

  const handleEnroll = async (challengeId) => {
    if (!user || !user.username) {
      setError('Please log in to enroll in a challenge.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/reading-challenges/enroll', {
        username: user.username,
        challengeId,
      });
      setSuccess(response.data.message);
      setError(null);
      fetchChallenges(); // Refresh challenges to update participant count
      fetchEnrolledChallenges(user.username); // Refresh enrolled challenges
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in challenge.');
      setSuccess(null);
      console.error(err);
    }
  };

  return (
    <div className={`container ${isNavOpen ? 'nav-open' : ''}`}>
      <Navbar onToggle={handleNavToggle} />
      <h1>Reading Challenges</h1>

      {/* Error and Success Messages */}
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {/* Enrolled Challenges Section */}
      <div className="enrolled-section">
        <h2>Your Enrolled Challenges</h2>
        {!user ? (
          <p className="no-challenges">Please log in to view your enrolled challenges.</p>
        ) : enrolledChallenges.length === 0 ? (
          <p className="no-challenges">No enrolled challenges found.</p>
        ) : (
          <div className="challenges-grid">
            {enrolledChallenges.map((progress) => (
              <div key={progress._id} className="challenge-card">
                <h3>{progress.challenge.title}</h3>
                <p>Start: {new Date(progress.challenge.startDate).toLocaleDateString()}</p>
                <p>End: {new Date(progress.challenge.endDate).toLocaleDateString()}</p>
                <p>Pages: {progress.challenge.noOfPages}</p>
                <p>Pages Read: {progress.pagesRead}</p>
                <p>Joined: {new Date(progress.joinedAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Challenges Section */}
      <div>
        <h2>All Challenges</h2>
        {challenges.length === 0 ? (
          <p className="no-challenges">No challenges found.</p>
        ) : (
          <div className="challenges-grid">
            {challenges.map((challenge) => (
              <div key={challenge._id} className="challenge-card">
                <h3>{challenge.title}</h3>
                <p>Start: {new Date(challenge.startDate).toLocaleDateString()}</p>
                <p>End: {new Date(challenge.endDate).toLocaleDateString()}</p>
                <p>Pages: {challenge.noOfPages}</p>
                <p>Participants: {challenge.participants.length}</p>
                <button
                  onClick={() => handleEnroll(challenge._id)}
                  className="button enroll-button"
                  disabled={!user}
                >
                  Enroll
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingChallenge;