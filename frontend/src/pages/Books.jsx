import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/books.css';
import Navbar from './Navbar'; 

const Books = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOption, setFilterOption] = useState(''); 
  const [searchQuery, setSearchQuery] = useState('');
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
        setFilteredBooks(data); 
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);


  useEffect(() => {
    if (!filterOption || !searchQuery) {
      setFilteredBooks(books); 
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
      <Navbar /> {/* Replace static navbar with Navbar component */}

      <div className="primary-content-discover">
        <div className="books-wrapper">
          <div className="books-content">
            <h1>Discover Books</h1>
            <div className="search-bar">
              <select
                value={filterOption}
                onChange={handleFilterChange}
                className="filter-dropdown"
                aria-label="Select search filter"
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
                    aria-label={`Search books by ${filterOption}`}
                    id="search-b"
                  />
                  <button
                    onClick={handleClearSearch}
                    className="clear-search-btn"
                    aria-label="Clear search"
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
                      <span className="book-author">{book.author}</span>
                      <span className="book-genre">{book.genre}</span>
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