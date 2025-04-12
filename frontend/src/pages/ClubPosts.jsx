import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/clubPosts.css';

const ClubPage = () => {
  const { clubId } = useParams();
  const [club, setClub] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postText, setPostText] = useState('');
  const [postError, setPostError] = useState(null);
  const [postSuccess, setPostSuccess] = useState(null);

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

  if (loading) {
    return <div className="loader">Loading club...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!club) {
    return <div className="error-message">Club not found</div>;
  }

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
        <div className="club-page-wrapper">
          <div className="club-header">
            <h1>{club.name}</h1>
            {club.coverImage ? (
              <img
                src={`${BASE_URL}${club.coverImage}`}
                alt={`${club.name} cover`}
                className="club-cover"
                onError={(e) => console.error(`Failed to load image: ${BASE_URL}${club.coverImage}`)}
              />
            ) : (
              <div className="club-image-fallback">No Cover Available</div>
            )}
            <p className="club-description">{club.description}</p>
            <div className="club-meta">
              <p className="club-tags">
                {club.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </p>
              <p className="club-members">
                <span className="member-icon">👥</span> {club.members.length} members
              </p>
            </div>
          </div>

          <div className="post-form">
            <h2>Share Your Thoughts</h2>
            {postError && <div className="error-message">{postError}</div>}
            {postSuccess && <div className="success-message">{postSuccess}</div>}
            <form onSubmit={handlePostSubmit}>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's on your mind?"
                className="post-textarea"
                required
              />
              <button type="submit" className="submit-post-btn">Post</button>
            </form>
          </div>

          <div className="posts-list">
            <h2>Club Posts</h2>
            {posts.length === 0 ? (
              <div className="no-posts-message">
                <p>No posts yet. Be the first to share!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="post-item">
                  <p className="post-text">{post.text}</p>
                  <p className="post-meta">
                    Posted by <span className="post-username">{post.username}</span> on{' '}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubPage;