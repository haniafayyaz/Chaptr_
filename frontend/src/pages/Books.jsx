import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/books.css';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleDetailsClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  if (loading) {
    return <div className="loader">Loading books...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="books-wrapper">
      <div className="books-content">
        <h1>Discover Books</h1>
        {books.length === 0 ? (
          <p>No books available.</p>
        ) : (
          <div className="books-layout">
            {books.map((book) => (
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
  );
};

export default Books;