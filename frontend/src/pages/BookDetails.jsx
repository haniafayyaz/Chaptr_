import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/bookDetails.css';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: '',
    comment: '',
  });
  const [formError, setFormError] = useState(null);
  const [navbarOpen, setNavbarOpen] = useState(false);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/books/${id}`);
        if (!response.ok) throw new Error('Failed to fetch book details');
        const data = await response.json();
        console.log("Book coverImage:", data.coverImage); // Log coverImage for debugging
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
          status: 'wantToRead',
        }),
      });
      const result = await response.json();
      if (response.ok) {
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      alert('Server error: ' + err.message);
    }
  };

  const handleStarClick = (rating) => {
    setReviewForm((prev) => ({ ...prev, rating: rating.toString() }));
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetReviewForm = () => {
    setReviewForm({ rating: '', comment: '' });
    setFormError(null);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to submit a review!');
      return;
    }
    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      setFormError('Please select a rating between 1 and 5');
      return;
    }

    const hasReviewed = book.reviews.some(review => review.reviewerName === user.username);
    if (hasReviewed) {
      setFormError('You have already submitted a review for this book');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/books/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewerName: user.username,
          rating: parseInt(reviewForm.rating),
          comment: reviewForm.comment,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('Review submitted successfully!');
        setBook(result.book);
        setReviewForm({ rating: '', comment: '' });
        setFormError(null);
      } else {
        setFormError(result.message);
      }
    } catch (err) {
      setFormError('Server error: ' + err.message);
    }
  };

  if (loading) return <div className="loading">Loading book details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!book) return <div className="error">Book not found</div>;

  const averageRating = book.averageRating || 0;
  const filledStars = Math.round(averageRating);
  const stars = '★'.repeat(filledStars) + '☆'.repeat(5 - filledStars);

  const hasReviewed = user && book.reviews.some(review => review.reviewerName === user.username);

  return (
    <div className={`details-wrapper ${navbarOpen ? "navbar-open" : ""}`}>
      <div className="book-details-page">
        <div className="book-details-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            Back
          </button>
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
              <div className="book-details-rating">
                <span className="stars">{stars}</span> {averageRating.toFixed(1)}
              </div>
              <p className="book-details-genre"><strong>Genre:</strong> {book.genre}</p>
              <p className="book-details-pages"><strong>Pages:</strong> {book.totalPages || 'N/A'}</p>
              <p className="book-details-summary"><strong>Summary:</strong> {book.summary || 'No summary available'}</p>
              <button className="add-button" onClick={handleAddToList}>
                Add to List
              </button>
            </div>
          </div>

          <div className="review-form-container">
            <h2>Submit a Review</h2>
            {hasReviewed ? (
              <p className="review-message">You have already submitted a review for this book.</p>
            ) : (
              <>
                {formError && <div className="error">{formError}</div>}
                <form onSubmit={handleReviewSubmit}>
                  <div className="form-group">
                    <label>Rating:</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`star ${parseInt(reviewForm.rating) >= star ? 'filled' : ''}`}
                          onClick={() => handleStarClick(star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="comment" className="comment-label">Comment (optional):</label>
                    <textarea
                      id="comment"
                      name="comment"
                      value={reviewForm.comment}
                      onChange={handleReviewChange}
                      rows="4"
                    />
                  </div>
                  <div className="form-buttons">
                    <button type="submit" className="add-button">
                      Submit Review
                    </button>
                    <button type="button" onClick={resetReviewForm} className="reset-button">
                      Reset Form
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div className="reviews-container">
            <h2>Reviews</h2>
            {book.reviews && book.reviews.length > 0 ? (
              <ul className="reviews-listed">
                {book.reviews.map((review, index) => (
                  <li key={index} className="review-item">
                    <p className="book-review-header">
                      <strong>{review.reviewerName}</strong> rated it{' '}
                      <span className="review-stars">
                        {'★'.repeat(review.rating)}
                        <span className="empty-stars">{'☆'.repeat(5 - review.rating)}</span>
                      </span>
                    </p>
                    {review.comment && <p className="book-review-comment">{review.comment}</p>}
                    <p className="book-review-date">{new Date(review.date).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-reviews">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;