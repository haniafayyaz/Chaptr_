import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/bookClubs.css'; // We'll create this CSS file
import '../styles/navbar.css'; // Reuse the same navbar styling

const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('myClubs'); // Tabs: 'myClubs', 'popular'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/clubs');
        if (!response.ok) {
          throw new Error('Failed to fetch clubsaa');
        }
        console.log(response)
        const data = await response.json();
        setClubs(data);
        setFilteredClubs(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  // Filter clubs based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredClubs(clubs);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = clubs.filter((club) =>
      club.name.toLowerCase().includes(lowerQuery)
    );
    setFilteredClubs(filtered);
  }, [searchQuery, clubs]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery(''); // Clear search when switching tabs
  };

  const handleViewClub = (clubId) => {
    // Navigate to club details page (you can implement this route later)
    window.location.href = `/club/${clubId}`;
  };

  const handleCreateClub = () => {
    // Navigate to a create club page (you can implement this route later)
    window.location.href = '/create-club';
  };

  if (loading) {
    return <div className="loader">Loading clubs...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  // Filter clubs based on tab
  const displayedClubs =
    activeTab === 'myClubs'
      ? filteredClubs.filter((club) => club.isMember) // Assuming isMember is a field
      : filteredClubs;

  return (
    <div className="dash-wrapper">
      <div className="side-panel">
        <h1 className="brand-title">BookTrack</h1>
        <nav className="navigation">
          <Link to="/dashboard" className="nav-link">My Books</Link>
          <Link to="/clubs" className="nav-link active">Book Clubs</Link>
          <Link to="/challenges" className="nav-link">Challenges</Link>
          <Link to="/books" className="nav-link">Discover</Link>
        </nav>
      </div>

      <div className="primary-content">
        <div className="clubs-wrapper">
          <div className="clubs-content">
            <h1>Book Clubs</h1>
            <div className="clubs-header">
              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'myClubs' ? 'active' : ''}`}
                  onClick={() => handleTabChange('myClubs')}
                >
                  My Clubs {activeTab === 'myClubs' && `(${displayedClubs.length})`}
                </button>
                <button
                  className={`tab ${activeTab === 'popular' ? 'active' : ''}`}
                  onClick={() => handleTabChange('popular')}
                >
                  Popular
                </button>
                <button
                  className={`tab ${activeTab === 'new' ? 'active' : ''}`}
                  onClick={() => handleTabChange('new')}
                >
                  New
                </button>
              </div>
              <div className="search-bar">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search book clubs..."
                  className="search-input"
                />
                <button onClick={handleCreateClub} className="create-club-btn">
                  + Create Club
                </button>
              </div>
            </div>
            {displayedClubs.length === 0 ? (
              <p>No clubs found.</p>
            ) : (
              <div className="clubs-layout">
                {displayedClubs.map((club) => (
                  <div key={club._id} className="club-item">
                    <h2 className="club-name">{club.name}</h2>
                    <p className="club-description">{club.description}</p>
                    <div className="club-image-wrapper">
                      {club.coverImage ? (
                        <img
                          src={club.coverImage}
                          alt={`${club.currentBook.title} cover`}
                          className="club-image"
                        />
                      ) : (
                        <div className="club-image-fallback">No Cover Available</div>
                      )}
                    </div>
                    <div className="club-info">
                      <p className="currently-reading">
                        <strong>Currently Reading</strong><br />
                        {club.currentBook.title} by {club.currentBook.author}
                      </p>
                      <p className="club-tags">
                        {club.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </p>
                      <p className="club-members">
                        <span className="member-icon">👥</span> {club.members} members
                      </p>
                      <p className="club-schedule">{club.schedule}</p>
                    </div>
                    <button
                      className="view-club-btn"
                      onClick={() => handleViewClub(club._id)}
                    >
                      View Club
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clubs;