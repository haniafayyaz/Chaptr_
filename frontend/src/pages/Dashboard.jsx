import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../styles/dashboard.css";
import axios from 'axios';

const Dashboard = () => {
  const [books, setBooks] = useState({
    reading: [],
    wantToRead: []
  });
  const [stats, setStats] = useState({
    booksRead: 0,
    pagesRead: 0,
    readingStreak: 0,
    goalProgress: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [pagesInput, setPagesInput] = useState('');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        try {
          // Fetch reading list
          const apiUrl = process.env.NODE_ENV === 'development'
            ? `http://localhost:5000/api/reading-list/get-reading-list/${parsedUser.username}`
            : `/api/reading-list/get-reading-list/${parsedUser.username}`;
          const readingListRes = await axios.get(apiUrl);
  
          const readingListData = Array.isArray(readingListRes.data)
            ? readingListRes.data
            : Array.isArray(readingListRes.data.books)
              ? readingListRes.data.books
              : [];
  
          // Fetch all books to get total pages
          const booksUrl = process.env.NODE_ENV === 'development'
            ? 'http://localhost:5000/api/books'
            : '/api/books';
          const booksRes = await axios.get(booksUrl);
          const booksData = booksRes.data;
  
          // Create a map of bookId to totalPages
          const bookPagesMap = new Map();
          booksData.forEach(book => {
            bookPagesMap.set(book._id, book.totalPages || 0); // Use totalPages from /api/books
          });
  
          const readingBooks = readingListData
            .filter(book => book.status === 'reading')
            .map(book => ({
              id: book.bookId,
              readingListId: book._id, // Store reading list _id
              title: book.bookTitle,
              author: book.bookAuthor,
              coverImage: book.coverImage,
              progress: book.pagesRead && bookPagesMap.get(book.bookId) && bookPagesMap.get(book.bookId) > 0
                ? Math.round((book.pagesRead / bookPagesMap.get(book.bookId)) * 100)
                : 0,
              totalPages: bookPagesMap.get(book.bookId) || book.totalPages || 0, // Prefer API data
              pagesRead: book.pagesRead || 0
            }));
  
          const wantToReadBooks = readingListData
            .filter(book => book.status === 'wantToRead')
            .map(book => ({
              id: book.bookId,
              readingListId: book._id, // Store reading list _id
              title: book.bookTitle,
              author: book.bookAuthor,
              coverImage: book.coverImage,
              progress: 0,
              totalPages: bookPagesMap.get(book.bookId) || book.totalPages || 0,
              pagesRead: 0
            }));
  
          const totalPagesRead = readingBooks.reduce((total, book) => total + (book.pagesRead || 0), 0);
  
          setBooks({
            reading: readingBooks,
            wantToRead: wantToReadBooks
          });
  
          setStats(prev => ({
            ...prev,
            pagesRead: totalPagesRead
          }));
  
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error.response?.data || error.message);
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    };
  
    fetchUserData();
  }, [navigate]);

  const handleUpdateClick = (book) => {
    setCurrentBook(book);
    setPagesInput('');
    setShowModal(true);
  };

  const handleProgressUpdate = async () => {
    if (!pagesInput || isNaN(pagesInput)) return;
    
    const pagesNum = parseInt(pagesInput);
    const newPagesRead = currentBook.pagesRead + pagesNum;
    const newProgress = currentBook.totalPages > 0 
      ? Math.round((newPagesRead / currentBook.totalPages) * 100) 
      : 0;
  
    try {
      const updateUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000/api/reading-list/update-progress'
        : '/api/reading-list/update-progress';
      const response = await axios.put(updateUrl, {
        username: user.username,
        bookId: currentBook.id,
        pagesRead: newPagesRead
      });
  
      console.log('Progress Update Response:', response.data);
  
      setBooks(prev => {
        const updatedReading = prev.reading.map(book => 
          book.id === currentBook.id 
            ? { 
                ...book, 
                pagesRead: newPagesRead,
                progress: newProgress
              } 
            : book
        );
  
        const totalPagesRead = updatedReading.reduce((total, book) => total + (book.pagesRead || 0), 0);
  
        setStats(prevStats => ({
          ...prevStats,
          pagesRead: totalPagesRead
        }));
  
        return {
          ...prev,
          reading: updatedReading
        };
      });
  
      setShowModal(false);
    } catch (error) {
      console.error("Error updating progress:", error.response?.data || error.message);
      alert("Failed to update progress. Please try again.");
    }
  };

  const startReading = async (bookId) => {
    try {
      const bookToMove = books.wantToRead.find(book => book.id === bookId);
      if (!bookToMove) {
        throw new Error("Book not found in Want to Read list");
      }
  
      // Update status using the same endpoint as progress updates
      const updateUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000/api/reading-list/update-progress'
        : '/api/reading-list/update-progress';
      const response = await axios.put(updateUrl, {
        username: user.username,
        bookId: bookId,
        status: 'reading',
        pagesRead: 0 // Reset pagesRead when starting
      });
  
      console.log('Status Update Response:', response.data);
  
      // Update frontend state
      setBooks(prev => {
        const updatedWantToRead = prev.wantToRead.filter(book => book.id !== bookId);
        const updatedReading = [
          ...prev.reading,
          {
            ...bookToMove,
            status: 'reading',
            progress: 0,
            pagesRead: 0
          }
        ];
  
        return {
          ...prev,
          reading: updatedReading,
          wantToRead: updatedWantToRead
        };
      });
  
    } catch (error) {
      console.error("Error starting to read book:", error.response?.data || error.message);
      alert(`Failed to start reading the book: ${error.response?.data?.message || error.message}. Please try again.`);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading your books...</div>;
  }

  return (
    <div className="dash-wrapper">
      {showModal && currentBook && (
        <div className="popup-background">
          <div className="popup-container">
            <h3>Update Progress for {currentBook.title}</h3>
            <p>Current progress: {currentBook.progress}%</p>
            <div className="input-section">
              <label>Pages read since last update:</label>
              <input
                type="number"
                value={pagesInput}
                onChange={(e) => setPagesInput(e.target.value)}
                placeholder="Enter number of pages"
                min="1"
              />
            </div>
            <div className="popup-actions">
              <button onClick={() => setShowModal(false)} className="close-btn">Cancel</button>
              <button onClick={handleProgressUpdate} className="save-btn">Update</button>
            </div>
          </div>
        </div>
      )}

      <div className="side-panel">
        <h1 className="brand-title">BookTrack</h1>
        <nav className="navigation">
          <Link to="/books" className="nav-link active">My Books</Link>
          <Link to="/clubs" className="nav-link">Book Clubs</Link>
          <Link to="/challenges" className="nav-link">Challenges</Link>
          <Link to="/books" className="nav-link">Discover</Link>
        </nav>
      </div>

      <div className="primary-content">
        <header className="top-bar">
          <h2>Welcome back, {user.name}!</h2>
          <div className="profile-icon">
            {user.name?.split(' ').map(n => n[0]).join('')}
          </div>
        </header>

        <div className="metrics-display">
          <div className="metric-box">
            <div className="metric-symbol">📚</div>
            <div className="metric-details">
              <h3>{stats.booksRead}</h3>
              <p>Books Read</p>
              <span className="metric-change">+2 from last month</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-symbol">📖</div>
            <div className="metric-details">
              <h3>{(stats.pagesRead || 0).toLocaleString()}</h3>
              <p>Pages Read</p>
              <span className="metric-change">+342 from last month</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-symbol">🔥</div>
            <div className="metric-details">
              <h3>{stats.readingStreak}</h3>
              <p>Reading Streak</p>
              <span className="metric-change">Keep it up!</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-symbol">🎯</div>
            <div className="metric-details">
              <h3>{stats.goalProgress}%</h3>
              <p>Goal Progress</p>
              <div className="progress-indicator">
                <div 
                  className="progress-level" 
                  style={{ width: `${stats.goalProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="reading-area">
          <div className="reading-group">
            <h3>Currently Reading</h3>
            {books.reading.length > 0 ? (
              books.reading.map(book => (
                <div key={book.id} className="reading-item">
                  <div className="reading-cover" style={{ backgroundImage: `url(${book.coverImage})` }}>
                    {!book.coverImage && book.title.split(' ').map(word => word[0]).join('')}
                  </div>
                  <div className="reading-info">
                    <h4>{book.title}</h4>
                    <p>{book.author}</p>
                    <div className="reading-progress">
                      <div className="progress-indicator">
                        <div 
                          className="progress-level" 
                          style={{ width: `${book.progress}%` }}
                        ></div>
                      </div>
                      <span>{book.progress}%</span>
                    </div>
                    <p className="page-count">
                      {book.totalPages === 0 
                        ? 'Total pages unknown'
                        : `${book.pagesRead} of ${book.totalPages} pages read`}
                    </p>
                    <button 
                      onClick={() => handleUpdateClick(book)} 
                      className="modify-btn"
                    >
                      Update Progress
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>You're not currently reading any books</p>
            )}
          </div>

          <div className="reading-group">
            <h3>Want to Read</h3>
            {books.wantToRead.length > 0 ? (
              books.wantToRead.map(book => (
                <div key={book.id} className="reading-item">
                  <div className="reading-cover" style={{ backgroundImage: `url(${book.coverImage})` }}>
                    {!book.coverImage && book.title.split(' ').map(word => word[0]).join('')}
                  </div>
                  <div className="reading-info">
                    <h4>{book.title || 'Untitled'}</h4>
                    <p>{book.author || 'Unknown Author'}</p>
                    <button 
                      onClick={() => startReading(book.id)} 
                      className="begin-btn"
                    >
                      Start Reading
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>Your want to read list is empty</p>
            )}
          </div>
        </div>

        <div className="updates-section">
          <div className="updates-header">
            <h3>Recent Activity</h3>
            <p className="updates-subtitle">Your reading journey</p>
          </div>
          
          <div className="updates-list">
            <div className="update-entry">
              <div className="update-symbol">📖</div>
              <div className="update-info">
                <h4>Updated progress</h4>
                <p>Read 25 pages of {books.reading[0]?.title || 'your book'}</p>
                <span className="update-timestamp">2 hours ago</span>
              </div>
            </div>

            <div className="update-entry">
              <div className="update-symbol">⭐</div>
              <div className="update-info">
                <h4>Added to list</h4>
                <p>{books.wantToRead[0]?.title || 'New book'} added to want to read</p>
                <span className="update-timestamp">Yesterday</span>
              </div>
            </div>
          </div>

          <button className="show-all-btn">View All Activity →</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;