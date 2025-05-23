import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/bookClubs.css";
import Navbar from "./Navbar";

const Clubs = () => {
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("myClubs");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: "",
    coverImage: null,
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [navbarOpen, setNavbarOpen] = useState(false);

  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/clubs`);
        if (!response.ok) {
          throw new Error("Failed to fetch clubs");
        }
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
    setSearchQuery("");
    setFormError(null);
    setFormSuccess(null);
    setFormData({
      name: "",
      description: "",
      tags: "",
      coverImage: null,
    });
  };

  const handleClubAction = async (clubId) => {
    if (activeTab === "myClubs") {
      navigate(`/club/${clubId}`);
    } else {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.username) {
          throw new Error("User not logged in");
        }

        const response = await fetch(`${BASE_URL}/api/clubs/${clubId}/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username: user.username }),
        });

        const text = await response.text();
        if (!response.ok) {
          let errorMessage = "Failed to join club";
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = "An unexpected error occurred";
          }
          alert(errorMessage);
          return;
        }

        const updatedClub = JSON.parse(text);
        setClubs((prev) =>
          prev.map((club) =>
            club._id === clubId ? updatedClub : club
          )
        );
        setFilteredClubs((prev) =>
          prev.map((club) =>
            club._id === clubId ? updatedClub : club
          )
        );
        setFormSuccess("Successfully joined the club!");
        setTimeout(() => setFormSuccess(null), 3000);
      } catch (err) {
        alert(err.message);
        console.error("Join club error:", err);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "coverImage" ? files[0] : value,
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.name.trim()) {
      setFormError("Club name is required");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Description is required");
      return;
    }
    if (!formData.coverImage) {
      setFormError("Cover image is required (JPEG/JPG/PNG)");
      return;
    }
    if (!["image/jpeg", "image/jpg", "image/png"].includes(formData.coverImage.type)) {
      setFormError("Cover image must be JPEG, JPG, or PNG");
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("tags", formData.tags);
      data.append("coverImage", formData.coverImage);

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.username) {
        throw new Error("User not found or username missing in localStorage");
      }
      data.append("username", user.username);

      const response = await fetch(`${BASE_URL}/api/clubs`, {
        method: "POST",
        body: data,
      });

      const text = await response.text();
      if (!response.ok) {
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || "Failed to create club");
        } catch (e) {
          throw new Error(`Server returned invalid response: ${text.slice(0, 100)}`);
        }
      }

      const newClub = JSON.parse(text);
      setClubs((prev) => [...prev, newClub]);
      setFilteredClubs((prev) => [...prev, newClub]);
      setFormSuccess("Club created successfully!");
      setFormData({
        name: "",
        description: "",
        tags: "",
        coverImage: null,
      });
      setActiveTab("myClubs");
    } catch (err) {
      setFormError(err.message);
      console.error("Form submission error:", err);
    }
  };

  const handleNavbarToggle = (isOpen) => {
    setNavbarOpen(isOpen);
  };

  if (loading) {
    return <div className="loader">Loading clubs...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  const displayedClubs =
    activeTab === "myClubs"
      ? filteredClubs.filter(
          (club) =>
            Array.isArray(club.members) &&
            user?.username &&
            club.members.includes(user.username)
        )
      : filteredClubs;

  return (
    <div className={`dash-wrapper ${navbarOpen ? "navbar-open" : ""}`}>
      <header className="bookclub-hero-section">
        <div className="bookclub-hero-content">
          <h1>Book Club</h1>
        </div>
      </header>
      <Navbar onToggle={handleNavbarToggle} />
      <div className="primary-content">
        <div className="clubs-wrapper">
          <div className="clubs-content">
            <div className="clubs-header-wrapper">
              <div className="clubs-header">
                <div className="tabs">
                  <button
                    className={`tab ${activeTab === "myClubs" ? "active" : ""}`}
                    onClick={() => handleTabChange("myClubs")}
                  >
                    My Clubs {activeTab === "myClubs" && `(${displayedClubs.length})`}
                  </button>
                  <button
                    className={`tab ${activeTab === "discover" ? "active" : ""}`}
                    onClick={() => handleTabChange("discover")}
                  >
                    Discover
                  </button>
                  <button
                    className={`tab ${activeTab === "createClub" ? "active" : ""}`}
                    onClick={() => handleTabChange("createClub")}
                  >
                    Create Club
                  </button>
                </div>
                {activeTab !== "createClub" && (
                  <div className="search-bar">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search book clubs..."
                      className="search-input"
                    />
                  </div>
                )}
              </div>
            </div>
            {activeTab === "createClub" ? (
              <div className="create-club-form">
                <h2>Create a New Book Club</h2>
                {formError && <div className="error-message">{formError}</div>}
                {formSuccess && <div className="success-message">{formSuccess}</div>}
                <form className="create-club-form-element" onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="name" className="create-club-form-label">
                      Club Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Enter club name"
                      className="create-club-form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="description" className="create-club-form-label">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      placeholder="Describe your book club"
                      className="create-club-form-textarea"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="tags" className="create-club-form-label">
                      Tags <span className="label-subtext">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleFormChange}
                      placeholder="e.g., fiction, fantasy, classics"
                      className="create-club-form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="coverImage" className="create-club-form-label">
                      Cover Image <span className="label-subtext">(required)</span>
                    </label>
                    <input
                      type="file"
                      id="coverImage"
                      name="coverImage"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleFormChange}
                      className="create-club-form-input"
                      required
                    />
                  </div>
                  <button type="submit" className="submit-club-btn">
                    Create Club
                  </button>
                </form>
              </div>
            ) : displayedClubs.length === 0 ? (
              <p className="no-clubs-message">No clubs found.</p>
            ) : (
              <div className="clubs-layout">
                {displayedClubs.map((club) => (
                  <div key={club._id} className="club-item">
                    <h2 className="club-name">{club.name}</h2>
                    <div className="club-image-wrapper">
                      {club.coverImage ? (
                        <img
                          src={`${BASE_URL}${club.coverImage}`}
                          alt={`${club.name} cover`}
                          className="club-image"
                          onError={(e) => console.error(`Failed to load image: ${BASE_URL}${club.coverImage}`)}
                        />
                      ) : (
                        <div className="club-image-fallback">No Cover Available</div>
                      )}
                    </div>
                    <p className="club-description">{club.description}</p>
                    <div className="club-info">
                      <p className="club-tags">
                        {club.tags.map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))}
                      </p>
                      <p className="club-members">
                        <span className="member-icon">👥</span> {(club.members || []).length} members
                      </p>
                    </div>
                    <button
                      className="view-club-btn"
                      onClick={() => handleClubAction(club._id)}
                    >
                      {activeTab === "myClubs" ? "View Club" : "Join Club"}
                    </button>
                  </div>
                ))}
              </div>
            )}
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

export default Clubs;