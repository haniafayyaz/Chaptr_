import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/bookDetails.css';

const BookDetails = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/books/${id}`);
        if (!response.ok) throw new Error('Failed to fetch book details');
        const data = await response.json();
        setBook(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
    const loggedInUser = JSON.parse(localStorage.getItem('user'));
    if (loggedInUser) setUser(loggedInUser);
  }, [id]);

  const handleAddToList = async () => {
    if (!user) {
      alert('User not logged in!');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/reading-list/add-to-reading-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          bookId: book._id,
          bookTitle: book.title,
          bookAuthor: book.author,
          coverImage: book.coverImage || '',
          totalPages: book.totalPages || 0,
          status: 'wantToRead'
        }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('Book added successfully!');
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('Server error: ' + err.message);
    }
  };

  if (loading) return <div className="loading">Loading book details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!book) return <div className="error">Book not found</div>;

  return (
    <div className="book-details-page">
      <div className="book-details-container">
        <div className="book-details-content">
          <div className="book-details-cover">
            {book.coverImage ? (
              <img src={book.coverImage} alt={`${book.title} cover`} className="book-details-cover-image" />
            ) : (
              <div className="book-details-cover-placeholder">No Cover Available</div>
            )}
          </div>
          <div className="book-details-info">
            <h1 className="book-details-title">{book.title}</h1>
            <p className="book-details-author">by {book.author}</p>
            <div className="book-details-rating">{'★★★★★'} {book.rating || '5.0'}</div>
            <p className="book-details-genre"><strong>Genre:</strong> {book.genre}</p>
            <p className="book-details-pages"><strong>Pages:</strong> {book.totalPages || 'N/A'}</p>
            <p className="book-details-summary"><strong>Summary:</strong> {book.summary || 'No summary available'}</p>
            <button className="add-button" onClick={handleAddToList}>Add to List</button>
            <button className="add-button">Add a Review</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
