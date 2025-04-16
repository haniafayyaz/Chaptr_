import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/authors.css";
import Navbar from "./Navbar";

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("followedAuthors");
  const [activitySubTab, setActivitySubTab] = useState("announcements");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";

  const fetchActivityData = async (username) => {
    try {
      const announcementsUrl = `${BASE_URL}/api/authors/announcements?username=${encodeURIComponent(username)}`;
      const booksUrl = `${BASE_URL}/api/authors/books?username=${encodeURIComponent(username)}`;
      console.log("Fetching activity data - Announcements URL:", announcementsUrl);
      console.log("Fetching activity data - Books URL:", booksUrl);

      const [announcementsResponse, booksResponse] = await Promise.all([
        fetch(announcementsUrl),
        fetch(booksUrl)
      ]);

      console.log("Announcements response:", announcementsResponse.ok, await announcementsResponse.clone().json());
      console.log("Books response:", booksResponse.ok, await booksResponse.clone().json());

      if (!announcementsResponse.ok || !booksResponse.ok) {
        throw new Error("Failed to fetch activity data");
      }

      const [announcementsData, booksData] = await Promise.all([
        announcementsResponse.json(),
        booksResponse.json()
      ]);

      console.log("Announcements data:", announcementsData);
      console.log("Books data:", booksData);

      return { announcementsData, booksData };
    } catch (err) {
      console.error("Error fetching activity data:", err);
      throw err;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.username) {
          console.error("User not logged in or username missing");
          navigate("/login");
          return;
        }
        console.log("Logged-in user:", user);
        console.log("Fetching with username:", user.username);

        const authorsUrl = `${BASE_URL}/api/authors`;
        console.log("Authors URL:", authorsUrl);

        const [authorsResponse, { announcementsData, booksData }] = await Promise.all([
          fetch(authorsUrl).then(res => res.json()),
          fetchActivityData(user.username)
        ]);

        console.log("Authors data:", authorsResponse);

        setAuthors(authorsResponse);
        setFilteredAuthors(authorsResponse);
        setAnnouncements(announcementsData);
        setBooks(booksData);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
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
    if (tab !== "recentActivity") {
      setActivitySubTab("announcements");
    }
  };

  const handleSubTabChange = (subTab) => {
    setActivitySubTab(subTab);
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

      // Refetch announcements and books for the updated followed authors
      const { announcementsData, booksData } = await fetchActivityData(user.username);
      setAnnouncements(announcementsData);
      setBooks(booksData);

      alert(`Successfully ${updatedAuthor.followers.includes(user.username) ? "followed" : "unfollowed"} the author!`);
    } catch (err) {
      alert(err.message);
      console.error("Follow/unfollow error:", err);
    }
  };

  if (loading) {
    return <div className="author-loader">Loading data...</div>;
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
                <button
                  className={`author-tab ${activeTab === "recentActivity" ? "author-tab-active" : ""}`}
                  onClick={() => handleTabChange("recentActivity")}
                >
                  Recent Activity
                </button>
              </div>
              {activeTab !== "recentActivity" && (
                <div className="author-search">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search authors..."
                    className="author-search-input"
                  />
                </div>
              )}
            </div>

            {activeTab === "recentActivity" ? (
              <div className="activity-section">
                <div className="activity-subtabs">
                  <button
                    className={`activity-subtab ${activitySubTab === "announcements" ? "activity-subtab-active" : ""}`}
                    onClick={() => handleSubTabChange("announcements")}
                  >
                    Announcements
                  </button>
                  <button
                    className={`activity-subtab ${activitySubTab === "publishedBooks" ? "activity-subtab-active" : ""}`}
                    onClick={() => handleSubTabChange("publishedBooks")}
                  >
                    Published Books
                  </button>
                </div>

                {activitySubTab === "announcements" && (
                  <div className="announcements-grid">
                    {console.log("Rendering announcements:", announcements)}
                    {announcements.length === 0 ? (
                      <p>No announcements from followed authors.</p>
                    ) : (
                      announcements.map((announcement, index) => (
                        <div key={index} className="announcement-card">
                          <h3>{announcement.title || "Untitled Announcement"}</h3>
                          <p className="announcement-content">{announcement.content || "No content available"}</p>
                          <p className="announcement-date">Posted on: {announcement.date || "Date not available"}</p>
                          <p className="announcement-author">By: @{announcement.authorUsername}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activitySubTab === "publishedBooks" && (
                  <div className="books-grid">
                    {console.log("Rendering books:", books)}
                    {books.length === 0 ? (
                      <p>No books published by followed authors.</p>
                    ) : (
                      books.map((book, index) => (
                        <div key={index} className="book-card">
                          <h3>{book.name || "Untitled Book"}</h3>
                          <p className="book-genre">Genre: {book.genre || "Unknown"}</p>
                          <p className="book-author">By: @{book.authorUsername}</p>
                          {book.coverImage && (
                            <img
                              src={`${BASE_URL}${book.coverImage}`}
                              alt={`${book.name} cover`}
                              className="book-cover-image"
                              onError={(e) => console.error(`Failed to load image: ${BASE_URL}${book.coverImage}`)}
                            />
                          )}
                          {book.bookPdf && (
                            <a
                              href={`${BASE_URL}${book.bookPdf}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="book-pdf-btn"
                            >
                              View PDF
                            </a>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : displayedAuthors.length === 0 ? (
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