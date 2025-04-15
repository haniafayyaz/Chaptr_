import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/authors.css";
import Navbar from "./Navbar";

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("followedAuthors");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/authors`);
        if (!response.ok) {
          throw new Error("Failed to fetch authors");
        }
        const data = await response.json();
        setAuthors(data);
        setFilteredAuthors(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAuthors();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredAuthors(authors);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = authors.filter(
      (author) =>
        author.name.toLowerCase().includes(lowerQuery) ||
        author.username.toLowerCase().includes(lowerQuery)
    );
    setFilteredAuthors(filtered);
  }, [searchQuery, authors]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
  };

  const handleAuthorAction = async (authorId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.username) {
        throw new Error("User not logged in");
      }

      const response = await fetch(`${BASE_URL}/api/authors/${authorId}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user.username }),
      });

      const text = await response.text();
      if (!response.ok) {
        let errorMessage = "Failed to follow/unfollow author";
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = "An unexpected error occurred";
        }
        alert(errorMessage);
        return;
      }

      const updatedAuthor = JSON.parse(text);
      setAuthors((prev) =>
        prev.map((author) =>
          author._id === authorId ? updatedAuthor : author
        )
      );
      setFilteredAuthors((prev) =>
        prev.map((author) =>
          author._id === authorId ? updatedAuthor : author
        )
      );
      alert(`Successfully ${updatedAuthor.followers.includes(user.username) ? "followed" : "unfollowed"} the author!`);
    } catch (err) {
      alert(err.message);
      console.error("Follow/unfollow error:", err);
    }
  };

  if (loading) {
    return <div className="author-loader">Loading authors...</div>;
  }

  if (error) {
    return <div className="author-error">Error: {error}</div>;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const displayedAuthors =
    activeTab === "followedAuthors"
      ? filteredAuthors.filter(
          (author) =>
            Array.isArray(author.followers) &&
            user?.username &&
            author.followers.includes(user.username)
        )
      : filteredAuthors;

  return (
    <div className="author-container">
      <Navbar />

      <div className="author-main">
        <div className="author-section">
          <div className="author-panel">
            <h1>Authors</h1>
            <div className="author-controls">
              <div className="author-tabs">
                <button
                  className={`author-tab ${activeTab === "followedAuthors" ? "author-tab-active" : ""}`}
                  onClick={() => handleTabChange("followedAuthors")}
                >
                  Followed Authors {activeTab === "followedAuthors" && `(${displayedAuthors.length})`}
                </button>
                <button
                  className={`author-tab ${activeTab === "allAuthors" ? "author-tab-active" : ""}`}
                  onClick={() => handleTabChange("allAuthors")}
                >
                  All Authors
                </button>
              </div>
              <div className="author-search">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search authors..."
                  className="author-search-input"
                />
              </div>
            </div>
            {displayedAuthors.length === 0 ? (
              <p>No authors found.</p>
            ) : (
              <div className="author-grid">
                {displayedAuthors.map((author) => (
                  <div key={author._id} className="author-card">
                    <h2 className="author-card-name">{author.name}</h2>
                    <p className="author-card-username">@{author.username}</p>
                    <p className="author-card-bio">{author.bio || "No bio available"}</p>
                    <div className="author-card-image-container">
                      {author.profilePicture ? (
                        <img
                          src={`${BASE_URL}${author.profilePicture}`}
                          alt={`${author.name}'s profile`}
                          className="author-card-image"
                          onError={(e) => console.error(`Failed to load image: ${BASE_URL}${author.profilePicture}`)}
                        />
                      ) : (
                        <div className="author-card-image-placeholder">No Image</div>
                      )}
                    </div>
                    <div className="author-card-details">
                      <p className="author-card-followers">
                        <span className="author-follower-icon">👥</span> {(author.followers || []).length} followers
                      </p>
                    </div>
                    <button
                      className="author-action-btn"
                      onClick={() => handleAuthorAction(author._id)}
                    >
                      {author.followers?.includes(user?.username) ? "Unfollow" : "Follow"}
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

export default Authors;