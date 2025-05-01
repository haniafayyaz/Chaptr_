import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/bookClubs.css';

const ClubPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postText, setPostText] = useState('');
  const [postError, setPostError] = useState(null);
  const [postSuccess, setPostSuccess] = useState(null);
  const [navbarOpen, setNavbarOpen] = useState(false);

  const BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchClubAndPosts = async () => {
      try {
        const clubResponse = await fetch(`${BASE_URL}/api/clubs/${clubId}`);
        if (!clubResponse.ok) {
          throw new Error('Failed to fetch club');
        }
        const clubData = await clubResponse.json();
        setClub(clubData);

        const postsResponse = await fetch(`${BASE_URL}/api/clubs/${clubId}/posts`);
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch posts');
        }
        const postsData = await postsResponse.json();
        setPosts(postsData);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchClubAndPosts();
  }, [clubId]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPostError(null);
    setPostSuccess(null);

    if (!postText.trim()) {
      setPostError('Post text is required');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.username) {
        throw new Error('User not logged in');
      }

      const response = await fetch(`${BASE_URL}/api/clubs/${clubId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user.username, text: postText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }

      const newPost = await response.json();
      setPosts((prev) => [newPost, ...prev]);
      setPostText('');
      setPostSuccess('Post created successfully!');
      setTimeout(() => setPostSuccess(null), 3000);
    } catch (err) {
      setPostError(err.message);
    }
  };

  const handleNavbarToggle = (isOpen) => {
    setNavbarOpen(isOpen);
  };

  const handleBackClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling to parent elements
    navigate('/clubs');
  };

  if (loading) {
    return <div className="loader">Loading club...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!club) {
    return <div className="no-clubs-message">Club not found</div>;
  }

  return (
    <div className={`dash-wrapper ${navbarOpen ? "navbar-open" : ""}`}>
      <header className="bookclub-hero-section">
        <div className="bookclub-hero-content">
          <h1>{club.name}</h1>
        </div>
      </header>
      <Navbar onToggle={handleNavbarToggle} />
      <div className="primary-content">
        <div className="club-details-wrapper">
          <div className="club-details-content">
            <button onClick={handleBackClick} className="back-btn">
              Back to Clubs
            </button>
            <div className="club-details-header">
              <div className="club-details-image-wrapper">
                {club.coverImage ? (
                  <img
                    src={`${BASE_URL}${club.coverImage}`}
                    alt={`${club.name} cover`}
                    className="club-details-image"
                    onError={(e) => console.error(`Failed to load image: ${BASE_URL}${club.coverImage}`)}
                  />
                ) : (
                  <div className="club-image-fallback">No Cover Available</div>
                )}
              </div>
              <div className="club-details-info">
                <h2 className="club-details-name">{club.name}</h2>
                <p className="club-details-description">{club.description}</p>
                <div className="club-details-meta">
                  <p className="club-details-tags">
                    {club.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </p>
                  <p className="club-details-members">
                    <span className="member-icon">👥</span> {club.members.length} members
                  </p>
                </div>
              </div>
            </div>

            <div className="share-thoughts-section">
              <h3>Share Your Thoughts</h3>
              {postError && <div className="error-message">{postError}</div>}
              {postSuccess && <div className="success-message">{postSuccess}</div>}
              <form onSubmit={handlePostSubmit} className="share-thoughts-form">
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="What's on your mind?"
                  className="share-thoughts-textarea"
                  required
                  id="post-text"
                />
                <button type="submit" className="share-thoughts-btn">Post</button>
              </form>
            </div>

            <div className="club-posts-section">
              <h3>Club Posts</h3>
              {posts.length === 0 ? (
                <p className="no-posts-message">
                  No posts yet. Be the first to share!
                </p>
              ) : (
                <div className="posts-list">
                  {posts.map((post) => (
                    <div key={post._id} className="post-item">
                      <div className="post-header">
                        <span className="post-author">{post.username}</span>
                        <span className="post-date">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="post-content">{post.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <footer className="bookclub-footer">
        <div className="bookclub-footer-content">
          <p>© 2025 Book Club. All rights reserved.</p>
          <p>Contact us: <a href="mailto:support@bookclub.com">support@bookclub.com</a></p>
        </div>
      </footer>
    </div>
  );
};

export default ClubPage;