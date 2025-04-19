import React, { useState, useEffect } from "react";
import "../styles/publications.css";
import Navbar from "./Navbar";

const Publications = () => {
  const [authorProfile, setAuthorProfile] = useState(null);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("myBooks");
  const [searchQuery, setSearchQuery] = useState("");
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [bookForm, setBookForm] = useState({
    name: "",
    genre: "",
    coverImage: null,
    bookPdf: null,
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
  });
  const [releaseForm, setReleaseForm] = useState({
    title: "",
    releaseDate: "",
  });
  const [navbarOpen, setNavbarOpen] = useState(false); // Add state for navbar toggle

  const BASE_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.username || !user.isAuthor) {
          throw new Error("User not logged in or not an author");
        }

        const response = await fetch(`${BASE_URL}/api/publications?username=${user.username}`);
        if (!response.ok) {
          throw new Error("Failed to fetch publications");
        }

        const data = await response.json();
        setAuthorProfile(data.authorProfile || { books: [], bookDetails: [], announcements: [] });
        setFilteredItems(data.authorProfile?.bookDetails || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAuthorProfile();
  }, []);

  useEffect(() => {
    if (!authorProfile) {
      setFilteredItems([]);
      return;
    }

    let items = [];
    if (activeTab === "myBooks") items = authorProfile.bookDetails || [];
    else if (activeTab === "announcements") items = authorProfile.announcements || [];
    else items = authorProfile.books || [];

    if (!searchQuery) {
      setFilteredItems(items);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = items.filter((item) =>
      activeTab === "myBooks" || activeTab === "releaseDates"
        ? item.name?.toLowerCase().includes(lowerQuery) || item.title?.toLowerCase().includes(lowerQuery)
        : item.title.toLowerCase().includes(lowerQuery) || item.content.toLowerCase().includes(lowerQuery)
    );
    setFilteredItems(filtered);
  }, [searchQuery, authorProfile, activeTab]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setFormError(null);
    setFormSuccess(null);
    setBookForm({ name: "", genre: "", coverImage: null, bookPdf: null });
    setAnnouncementForm({ title: "", content: "" });
    setReleaseForm({ title: "", releaseDate: "" });
  };

  const handleBookFormChange = (e) => {
    const { name, value, files } = e.target;
    setBookForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleAnnouncementFormChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReleaseFormChange = (e) => {
    const { name, value } = e.target;
    setReleaseForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetBookForm = () => {
    setBookForm({ name: "", genre: "", coverImage: null, bookPdf: null });
    setFormError(null);
    setFormSuccess(null);
  };

  const resetAnnouncementForm = () => {
    setAnnouncementForm({ title: "", content: "" });
    setFormError(null);
    setFormSuccess(null);
  };

  const resetReleaseForm = () => {
    setReleaseForm({ title: "", releaseDate: "" });
    setFormError(null);
    setFormSuccess(null);
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!bookForm.name.trim()) {
      setFormError("Book name is required");
      return;
    }
    if (!bookForm.genre.trim()) {
      setFormError("Genre is required");
      return;
    }
    if (!bookForm.coverImage) {
      setFormError("Cover image is required (JPEG/JPG/PNG)");
      return;
    }
    if (!["image/jpeg", "image/jpg", "image/png"].includes(bookForm.coverImage.type)) {
      setFormError("Cover image must be JPEG, JPG, or PNG");
      return;
    }
    if (!bookForm.bookPdf) {
      setFormError("PDF file is required");
      return;
    }
    if (bookForm.bookPdf.type !== "application/pdf") {
      setFormError("File must be a PDF");
      return;
    }

    try {
      const data = new FormData();
      data.append("name", bookForm.name);
      data.append("genre", bookForm.genre);
      data.append("coverImage", bookForm.coverImage);
      data.append("bookPdf", bookForm.bookPdf);

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.username) {
        throw new Error("User not logged in");
      }
      data.append("username", user.username);

      const response = await fetch(`${BASE_URL}/api/publications/book`, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload book");
      }

      const updatedProfile = await response.json();
      setAuthorProfile(updatedProfile);
      setFilteredItems(updatedProfile.bookDetails);
      setFormSuccess("Book uploaded successfully!");
      setBookForm({ name: "", genre: "", coverImage: null, bookPdf: null });
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleBookRemove = async (bookName) => {
    setFormError(null);
    setFormSuccess(null);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.username) {
        throw new Error("User not logged in");
      }

      const response = await fetch(`${BASE_URL}/api/publications/book`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user.username, name: bookName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to remove book");
      }

      const updatedProfile = await response.json();
      setAuthorProfile(updatedProfile);
      setFilteredItems(updatedProfile.bookDetails);
      setFormSuccess("Book removed successfully!");
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!announcementForm.title.trim()) {
      setFormError("Announcement title is required");
      return;
    }
    if (!announcementForm.content.trim()) {
      setFormError("Announcement content is required");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.username) {
        throw new Error("User not logged in");
      }

      const response = await fetch(`${BASE_URL}/api/publications/announcement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...announcementForm, username: user.username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to post announcement");
      }

      const updatedProfile = await response.json();
      setAuthorProfile(updatedProfile);
      setFilteredItems(updatedProfile.announcements);
      setFormSuccess("Announcement posted successfully!");
      setAnnouncementForm({ title: "", content: "" });
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleReleaseSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!releaseForm.title.trim()) {
      setFormError("Book title is required");
      return;
    }
    if (!releaseForm.releaseDate) {
      setFormError("Release date is required");
      return;
    }

    const selectedDate = new Date(releaseForm.releaseDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setFormError("Release date cannot be in the past");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.username) {
        throw new Error("User not logged in");
      }

      const response = await fetch(`${BASE_URL}/api/publications/release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...releaseForm, username: user.username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add release date");
      }

      const updatedProfile = await response.json();
      setAuthorProfile(updatedProfile);
      setFilteredItems(updatedProfile.books);
      setFormSuccess("Release date added successfully!");
      setReleaseForm({ title: "", releaseDate: "" });
    } catch (err) {
      setFormError(err.message);
    }
  };

  if (loading) {
    return <div className="pub-loader">Loading publications...</div>;
  }

  if (error) {
    return <div className="pub-error">Error: {error}</div>;
  }

  if (!authorProfile) {
    return <div className="pub-error">No author profile set up.</div>;
  }

  return (
    <div className={`pub-wrapper ${navbarOpen ? "navbar-open" : ""}`}>
      <Navbar setNavbarOpen={setNavbarOpen} />
      <div className="pub-main">
        <div className="pub-section">
          <div className="pub-panel">
            <h1>My Publications</h1>
            <div className="pub-controls">
              <div className="pub-tabs">
                <button
                  className={`pub-tab ${activeTab === "myBooks" ? "pub-tab-active" : ""}`}
                  onClick={() => handleTabChange("myBooks")}
                >
                  My Books {activeTab === "myBooks" && `(${filteredItems.length})`}
                </button>
                <button
                  className={`pub-tab ${activeTab === "announcements" ? "pub-tab-active" : ""}`}
                  onClick={() => handleTabChange("announcements")}
                >
                  Announcements
                </button>
                <button
                  className={`pub-tab ${activeTab === "releaseDates" ? "pub-tab-active" : ""}`}
                  onClick={() => handleTabChange("releaseDates")}
                >
                  Release Dates
                </button>
              </div>
              <div className="pub-search">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={`Search ${activeTab === "myBooks" ? "books" : activeTab === "announcements" ? "announcements" : "release dates"}...`}
                  className="pub-search-input"
                />
              </div>
            </div>

            {activeTab === "myBooks" && (
              <div className="pub-form">
                <h2>Add a New Book</h2>
                {formError && <div className="pub-error">{formError}</div>}
                {formSuccess && <div className="pub-success">{formSuccess}</div>}
                <form onSubmit={handleBookSubmit}>
                  <div className="pub-form-group">
                    <label htmlFor="name">Book Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={bookForm.name}
                      onChange={handleBookFormChange}
                      placeholder="Enter book name"
                      required
                    />
                  </div>
                  <div className="pub-form-group">
                    <label htmlFor="genre">Genre</label>
                    <input
                      type="text"
                      id="genre"
                      name="genre"
                      value={bookForm.genre}
                      onChange={handleBookFormChange}
                      placeholder="e.g., Fantasy, Sci-Fi"
                      required
                    />
                  </div>
                  <div className="pub-form-group">
                    <label htmlFor="coverImage">Cover Image (JPEG/JPG/PNG)</label>
                    <input
                      type="file"
                      id="coverImage"
                      name="coverImage"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleBookFormChange}
                      required
                    />
                  </div>
                  <div className="pub-form-group">
                    <label htmlFor="bookPdf">Book PDF</label>
                    <input
                      type="file"
                      id="bookPdf"
                      name="bookPdf"
                      accept="application/pdf"
                      onChange={handleBookFormChange}
                      required
                    />
                  </div>
                  <div className="pub-form-buttons">
                    <button type="submit" className="pub-submit-btn">
                      Upload Book
                    </button>
                    <button type="button" onClick={resetBookForm} className="pub-reset-btn">
                      Reset Form
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "announcements" && (
              <div className="pub-form">
                <h2>Post an Announcement</h2>
                {formError && <div className="pub-error">{formError}</div>}
                {formSuccess && <div className="pub-success">{formSuccess}</div>}
                <form onSubmit={handleAnnouncementSubmit}>
                  <div className="pub-form-group">
                    <label htmlFor="title">Announcement Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={announcementForm.title}
                      onChange={handleAnnouncementFormChange}
                      placeholder="Enter announcement title"
                      required
                    />
                  </div>
                  <div className="pub-form-group">
                    <label htmlFor="content">Content</label>
                    <textarea
                      id="content"
                      name="content"
                      value={announcementForm.content}
                      onChange={handleAnnouncementFormChange}
                      placeholder="Write your announcement"
                      required
                    />
                  </div>
                  <div className="pub-form-buttons">
                    <button type="submit" className="pub-submit-btn">
                      Post Announcement
                    </button>
                    <button type="button" onClick={resetAnnouncementForm} className="pub-reset-btn">
                      Reset Form
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "releaseDates" && (
              <div className="pub-form">
                <h2>Add a Release Date</h2>
                {formError && <div className="pub-error">{formError}</div>}
                {formSuccess && <div className="pub-success">{formSuccess}</div>}
                <form onSubmit={handleReleaseSubmit}>
                  <div className="pub-form-group">
                    <label htmlFor="title">Book Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={releaseForm.title}
                      onChange={handleReleaseFormChange}
                      placeholder="Enter book title"
                      required
                    />
                  </div>
                  <div className="pub-form-group">
                    <label htmlFor="releaseDate">Release Date</label>
                    <input
                      type="date"
                      id="releaseDate"
                      name="releaseDate"
                      value={releaseForm.releaseDate}
                      onChange={handleReleaseFormChange}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>
                  <div className="pub-form-buttons">
                    <button type="submit" className="pub-submit-btn">
                      Add Release Date
                    </button>
                    <button type="button" onClick={resetReleaseForm} className="pub-reset-btn">
                      Reset Form
                    </button>
                  </div>
                </form>
              </div>
            )}

            {filteredItems.length === 0 ? (
              <p className="pub-no-items">
                No {activeTab === "myBooks" ? "books" : activeTab === "announcements" ? "announcements" : "release dates"} found.
              </p>
            ) : (
              <div className="pub-grid">
                {filteredItems.map((item) => (
                  <div key={`${item.name || item.title}-${item.releaseDate || item.date || item.bookPdf}`} className="pub-card">
                    {activeTab === "myBooks" && (
                      <>
                        <h2 className="pub-card-title">{item.name}</h2>
                        <p className="pub-card-genre">Genre: {item.genre}</p>
                        <div className="pub-card-image-container">
                          {item.coverImage ? (
                            <img
                              src={`${BASE_URL}${item.coverImage}`}
                              alt={`${item.name} cover`}
                              className="pub-card-image"
                            />
                          ) : (
                            <div className="pub-card-image-placeholder">No Image</div>
                          )}
                        </div>
                        <div className="pub-card-actions">
                          <a
                            href={`${BASE_URL}${item.bookPdf}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pub-card-link"
                          >
                            View PDF
                          </a>
                          <button
                            onClick={() => handleBookRemove(item.name)}
                            className="pub-remove-btn"
                          >
                            Remove Book
                          </button>
                        </div>
                      </>
                    )}
                    {activeTab === "announcements" && (
                      <>
                        <h2 className="pub-card-title">{item.title}</h2>
                        <p className="pub-card-content">{item.content}</p>
                        <p className="pub-card-date">
                          Posted: {item.date ? new Date(item.date).toLocaleDateString() : "N/A"}
                        </p>
                      </>
                    )}
                    {activeTab === "releaseDates" && (
                      <>
                        <h2 className="pub-card-title">{item.title}</h2>
                        <p className="pub-card-date">
                          Release Date: {item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : "N/A"}
                        </p>
                      </>
                    )}
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

export default Publications;