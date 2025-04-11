import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/books.css';
import '../styles/navbar.css'; // Import navbar.css for styling

const Books = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOption, setFilterOption] = useState(''); // Selected filter: '', 'author', 'title', 'genre'
  const [searchQuery, setSearchQuery] = useState(''); // Search input
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/books');
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        setBooks(data);
        setFilteredBooks(data); // Initialize filteredBooks with all books
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Update filtered books when filterOption or searchQuery changes
  useEffect(() => {
    if (!filterOption || !searchQuery) {
      setFilteredBooks(books); // Show all books if no filter or query
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = books.filter((book) => {
      if (filterOption === 'author') {
        return book.author?.toLowerCase().includes(lowerQuery);
      } else if (filterOption === 'title') {
        return book.title?.toLowerCase().includes(lowerQuery);
      } else if (filterOption === 'genre') {
        return book.genre?.toLowerCase().includes(lowerQuery);
      }
      return true;
    });

    setFilteredBooks(filtered);
  }, [filterOption, searchQuery, books]);

  const handleDetailsClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
    setSearchQuery(''); // Clear query when changing filter
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setFilterOption('');
    setSearchQuery('');
    setFilteredBooks(books); // Reset to all books
  };

  if (loading) {
    return <div className="loader">Loading books...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="dash-wrapper">
      <div className="side-panel">
        <h1 className="brand-title">BookTrack</h1>
        <nav className="navigation">
          <Link to="/dashboard" className="nav-link">My Books</Link>
          <Link to="/clubs" className="nav-link">Book Clubs</Link>
          <Link to="/challenges" className="nav-link">Challenges</Link>
          <Link to="/books" className="nav-link active">Discover</Link>
        </nav>
      </div>

      <div className="primary-content">
        <div className="books-wrapper">
          <div className="books-content">
            <h1>Discover Books</h1>
            <div className="search-bar">
              <select
                value={filterOption}
                onChange={handleFilterChange}
                className="filter-dropdown"
              >
                <option value="">Select Filter</option>
                <option value="author">Author</option>
                <option value="title">Title</option>
                <option value="genre">Genre</option>
              </select>
              {filterOption && (
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={`Search by ${filterOption}`}
                    className="search-input"
                  />
                  <button
                    onClick={handleClearSearch}
                    className="clear-search-btn"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            {filteredBooks.length === 0 ? (
              <p>No books match your search.</p>
            ) : (
              <div className="books-layout">
                {filteredBooks.map((book) => (
                  <div key={book._id} className="book-item">
                    <div className="book-image-wrapper">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage}
                          alt={`${book.title} cover`}
                          className="book-image"
                        />
                      ) : (
                        <div className="book-image-fallback">No Cover Available</div>
                      )}
                    </div>
                    <div className="book-info">
                      <h2 className="book-name">{book.title}</h2>
                      <p className="book-writer">{book.author}</p>
                      <p className="book-category">{book.genre}</p>
                      <div className="separator"></div>
                      <button
                        className="book-info-btn"
                        onClick={() => handleDetailsClick(book._id)}
                      >
                        Details
                      </button>
                    </div>
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

export default Books;