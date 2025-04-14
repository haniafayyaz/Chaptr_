import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';
import axios from 'axios';
import Navbar from '../pages/Navbar'; // Import Navbar component

const Dashboard = () => {
  const [books, setBooks] = useState({
    reading: [],
    wantToRead: [],
    completed: [],
  });
  const [stats, setStats] = useState({
    booksRead: 0,
    pagesRead: 0,
    readingStreak: 0,
    goalProgress: 0,
  });
  const [goal, setGoal] = useState({
    dailyPagesGoal: 0,
    currentProgress: 0,
    streak: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [pagesInput, setPagesInput] = useState('');
  const [newGoalInput, setNewGoalInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/login');
        return;
      }

      const parsedUser = JSON.parse(userData);
      if (!parsedUser || !parsedUser.username) {
        console.error('Invalid user data');
        navigate('/login');
        return;
      }

      try {
        // Fetch user profile from backend
        const profileUrl =
          process.env.NODE_ENV === 'development'
            ? `http://localhost:5000/api/profile/${parsedUser.username}`
            : `/api/profile/${parsedUser.username}`;
        const profileRes = await axios.get(profileUrl, {
          headers: { Authorization: `Bearer ${parsedUser.token}` },
        });

        const updatedUser = {
          ...parsedUser,
          name: profileRes.data.name,
          username: profileRes.data.username,
          email: profileRes.data.email,
          profilePicture: profileRes.data.profilePicture || null,
          bio: profileRes.data.bio || null,
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Fetch reading list
        const apiUrl =
          process.env.NODE_ENV === 'development'
            ? `http://localhost:5000/api/reading-list/get-reading-list/${parsedUser.username}`
            : `/api/reading-list/get-reading-list/${parsedUser.username}`;
        const readingListRes = await axios.get(apiUrl);

        const readingListData = Array.isArray(readingListRes.data)
          ? readingListRes.data
          : Array.isArray(readingListRes.data.books)
          ? readingListRes.data.books
          : [];

        const booksUrl =
          process.env.NODE_ENV === 'development'
            ? 'http://localhost:5000/api/books'
            : '/api/books';
        const booksRes = await axios.get(booksUrl);
        const booksData = booksRes.data;

        const bookPagesMap = new Map();
        booksData.forEach((book) => {
          bookPagesMap.set(book._id, book.totalPages || 0);
        });

        const readingBooks = readingListData
          .filter((book) => book.status === 'reading')
          .map((book) => ({
            id: book.bookId,
            readingListId: book._id,
            title: book.bookTitle,
            author: book.bookAuthor,
            coverImage: book.coverImage,
            progress:
              book.pagesRead &&
              bookPagesMap.get(book.bookId) &&
              bookPagesMap.get(book.bookId) > 0
                ? Math.round(
                    (book.pagesRead / bookPagesMap.get(book.bookId)) * 100
                  )
                : 0,
            totalPages: bookPagesMap.get(book.bookId) || book.totalPages || 0,
            pagesRead: book.pagesRead || 0,
          }));

        const wantToReadBooks = readingListData
          .filter((book) => book.status === 'wantToRead')
          .map((book) => ({
            id: book.bookId,
            readingListId: book._id,
            title: book.bookTitle,
            author: book.bookAuthor,
            coverImage: book.coverImage,
            progress: 0,
            totalPages: bookPagesMap.get(book.bookId) || book.totalPages || 0,
            pagesRead: 0,
          }));

        const completedBooks = readingListData
          .filter((book) => book.status === 'completed')
          .map((book) => ({
            id: book.bookId,
            readingListId: book._id,
            title: book.bookTitle,
            author: book.bookAuthor,
            coverImage: book.coverImage,
            progress: 100,
            totalPages: bookPagesMap.get(book.bookId) || book.totalPages || 0,
            pagesRead: book.pagesRead || book.totalPages || 0,
          }));

        const completedBooksCount = readingListData.filter(
          (book) => book.status === 'completed'
        ).length;

        const totalPagesRead = readingBooks.reduce(
          (total, book) => total + (book.pagesRead || 0),
          0
        );

        setBooks({
          reading: readingBooks,
          wantToRead: wantToReadBooks,
          completed: completedBooks,
        });

        // Fetch goal data
        const goalUrl =
          process.env.NODE_ENV === 'development'
            ? `http://localhost:5000/api/goals/${parsedUser.username}`
            : `/api/goals/${parsedUser.username}`;
        const goalRes = await axios.get(goalUrl);

        setGoal({
          dailyPagesGoal: goalRes.data.dailyPagesGoal || 0,
          currentProgress: goalRes.data.currentProgress || 0,
          streak: goalRes.data.streak || 0,
        });

        setStats({
          booksRead: completedBooksCount,
          pagesRead: totalPagesRead,
          readingStreak: goalRes.data.streak || 0,
          goalProgress:
            goalRes.data.dailyPagesGoal > 0
              ? Math.round(
                  (goalRes.data.currentProgress / goalRes.data.dailyPagesGoal) *
                    100
                )
              : 0,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUpdateClick = (book) => {
    setCurrentBook(book);
    setPagesInput('');
    setShowModal(true);
  };

  const handleSetGoal = async () => {
    if (!newGoalInput || isNaN(newGoalInput) || newGoalInput <= 0) {
      alert('Please enter a valid number of pages');
      return;
    }

    if (!user || !user.username) {
      alert('User not authenticated');
      navigate('/login');
      return;
    }

    try {
      const goalUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:5000/api/goals'
          : '/api/goals';
      const response = await axios.post(goalUrl, {
        username: user.username,
        dailyPagesGoal: parseInt(newGoalInput),
      });

      setGoal({
        ...goal,
        dailyPagesGoal: parseInt(newGoalInput),
        currentProgress: 0,
      });

      setStats((prev) => ({
        ...prev,
        goalProgress: 0,
      }));

      setShowGoalModal(false);
      setNewGoalInput('');
    } catch (error) {
      console.error('Error setting goal:', error.response?.data || error.message);
      alert('Failed to set goal. Please try again.');
    }
  };

  const handleProgressUpdate = async () => {
    if (!pagesInput || isNaN(pagesInput)) return;
  
    const pagesNum = parseInt(pagesInput);
    const newPagesRead = currentBook.pagesRead + pagesNum;
    const newProgress = currentBook.totalPages > 0 
      ? Math.round((newPagesRead / currentBook.totalPages) * 100) 
      : 0;
  
    try {
      // Update book progress
      const updateUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000/api/reading-list/update-progress'
        : '/api/reading-list/update-progress';
      const response = await axios.put(updateUrl, {
        username: user.username,
        bookId: currentBook.id,
        pagesRead: newPagesRead
      });
  
      const updatedBook = response.data.updatedBook;
  
      // Update goal progress only if a goal exists
      let goalResponse = null;
      if (goal.dailyPagesGoal > 0) {
        const goalUrl = process.env.NODE_ENV === 'development'
          ? 'http://localhost:5000/api/goals/update-progress'
          : '/api/goals/update-progress';
        goalResponse = await axios.put(goalUrl, {
          username: user.username,
          pagesRead: pagesNum
        });
      }
  
      setBooks(prev => {
        let updatedReading = prev.reading;
        let updatedCompleted = prev.completed;
  
        if (updatedBook.status === 'completed') {
          // Remove from reading and add to completed
          updatedReading = prev.reading.filter(book => book.id !== currentBook.id);
          updatedCompleted = [
            ...prev.completed,
            {
              ...currentBook,
              pagesRead: newPagesRead,
              progress: newProgress,
              status: 'completed'
            }
          ];
        } else {
          // Update progress in reading
          updatedReading = prev.reading.map(book => 
            book.id === currentBook.id 
              ? { 
                  ...book, 
                  pagesRead: newPagesRead,
                  progress: newProgress
                } 
              : book
          );
        }
  
        const totalPagesRead = updatedReading.reduce((total, book) => total + (book.pagesRead || 0), 0);
  
        setStats(prevStats => ({
          ...prevStats,
          pagesRead: totalPagesRead,
          goalProgress: goal.dailyPagesGoal > 0 && goalResponse
            ? Math.round((goalResponse.data.currentProgress / goal.dailyPagesGoal) * 100)
            : prevStats.goalProgress,
          readingStreak: goalResponse ? goalResponse.data.streak : prevStats.readingStreak,
          booksRead: updatedBook.status === 'completed' 
            ? prevStats.booksRead + 1 
            : prevStats.booksRead
        }));
  
        if (goalResponse) {
          setGoal({
            ...goal,
            currentProgress: goalResponse.data.currentProgress,
            streak: goalResponse.data.streak
          });
        }
  
        return {
          ...prev,
          reading: updatedReading,
          completed: updatedCompleted
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
      const bookToMove = books.wantToRead.find((book) => book.id === bookId);
      if (!bookToMove) {
        throw new Error('Book not found in Want to Read list');
      }

      const updateUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:5000/api/reading-list/update-progress'
          : '/api/reading-list/update-progress';
      const response = await axios.put(updateUrl, {
        username: user.username,
        bookId: bookId,
        status: 'reading',
        pagesRead: 0,
      });

      setBooks((prev) => {
        const updatedWantToRead = prev.wantToRead.filter(
          (book) => book.id !== bookId
        );
        const updatedReading = [
          ...prev.reading,
          {
            ...bookToMove,
            status: 'reading',
            progress: 0,
            pagesRead: 0,
          },
        ];

        return {
          ...prev,
          reading: updatedReading,
          wantToRead: updatedWantToRead,
        };
      });
    } catch (error) {
      console.error('Error starting to read book:', error.response?.data || error.message);
      alert(
        `Failed to start reading the book: ${error.response?.data?.message || error.message}. Please try again.`
      );
    }
  };

  const removeBook = async (bookId) => {
    try {
      const removeUrl =
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:5000/api/reading-list/remove'
          : '/api/reading-list/remove';
      const response = await axios.delete(removeUrl, {
        data: {
          username: user.username,
          bookId: bookId,
        },
      });

      setBooks((prev) => ({
        ...prev,
        wantToRead: prev.wantToRead.filter((book) => book.id !== bookId),
      }));
    } catch (error) {
      console.error('Error removing book:', error.response?.data || error.message);
      alert(
        `Failed to remove the book: ${error.response?.data?.message || error.message}. Please try again.`
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading your books...</div>;
  }

  return (
    <div className="dash-wrapper">
      {/* Replace static navbar with Navbar component */}
      <Navbar />

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
              <button onClick={() => setShowModal(false)} className="close-btn">
                Cancel
              </button>
              <button onClick={handleProgressUpdate} className="save-btn">
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {showGoalModal && (
        <div className="popup-background">
          <div className="popup-container">
            <h3>Set Daily Reading Goal</h3>
            <div className="input-section">
              <label>Pages to read daily:</label>
              <input
                type="number"
                value={newGoalInput}
                onChange={(e) => setNewGoalInput(e.target.value)}
                placeholder="Enter number of pages"
                min="1"
              />
            </div>
            <div className="popup-actions">
              <button
                onClick={() => setShowGoalModal(false)}
                className="close-btn"
              >
                Cancel
              </button>
              <button onClick={handleSetGoal} className="save-btn">
                Set Goal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="primary-content">
        <header className="top-bar">
          <h2>Welcome back, {user.name}!</h2>
          <div
            className="profile-icon"
            onMouseEnter={() => setShowProfileMenu(true)}
            onMouseLeave={() => setShowProfileMenu(false)}
          >
            {user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Profile"
                className="profile-picture"
              />
            ) : (
              <div className="initials-avatar">
                {user.name?.split(' ').map((n) => n[0]).join('')}
              </div>
            )}
            {showProfileMenu && (
              <div className="profile-menu">
                <Link to="/profile" className="profile-menu-item">
                  Profile
                </Link>
                <button onClick={handleLogout} className="profile-menu-item">
                  Logout
                </button>
              </div>
            )}
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
              <p>Goal Streak</p>
              <span className="metric-change">Keep it up!</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-symbol">🎯</div>
            <div className="metric-details">
              <div className="goal-metrics">
                <h3>{stats.goalProgress}%</h3>
                <p className="goal-pages">
                  {goal.dailyPagesGoal > 0
                    ? `${goal.currentProgress}/${goal.dailyPagesGoal} pages`
                    : 'No goal set'}
                </p>
              </div>
              <p>Daily Goal Progress</p>
              <div className="progress-indicator">
                <div
                  className="progress-level"
                  style={{ width: `${stats.goalProgress}%` }}
                ></div>
              </div>
              <button
                onClick={() => setShowGoalModal(true)}
                className="set-goal-btn"
              >
                {goal.dailyPagesGoal > 0 ? 'Update Goal' : 'Set Goal'}
              </button>
            </div>
          </div>
        </div>

        <div className="reading-area">
          <div className="reading-group">
            <h3>Currently Reading</h3>
            {books.reading.length > 0 ? (
              books.reading.map((book) => (
                <div key={book.id} className="reading-item">
                  <div
                    className="reading-cover"
                    style={{ backgroundImage: `url(${book.coverImage})` }}
                  >
                    {!book.coverImage &&
                      book.title.split(' ').map((word) => word[0]).join('')}
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
              books.wantToRead.map((book) => (
                <div key={book.id} className="reading-item">
                  <div
                    className="reading-cover"
                    style={{ backgroundImage: `url(${book.coverImage})` }}
                  >
                    {!book.coverImage &&
                      book.title.split(' ').map((word) => word[0]).join('')}
                  </div>
                  <div className="reading-info">
                    <h4>{book.title || 'Untitled'}</h4>
                    <p>{book.author || 'Unknown Author'}</p>
                    <div className="button-group">
                      <button
                        onClick={() => startReading(book.id)}
                        className="begin-btn"
                      >
                        Start Reading
                      </button>
                      <button
                        onClick={() => removeBook(book.id)}
                        className="begin-btn"
                      >
                        Remove Book
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Your want to read list is empty</p>
            )}
          </div>

          <div className="reading-group">
            <h3>Completed Books</h3>
            {books.completed.length > 0 ? (
              books.completed.map((book) => (
                <div key={book.id} className="reading-item">
                  <div
                    className="reading-cover"
                    style={{ backgroundImage: `url(${book.coverImage})` }}
                  >
                    {!book.coverImage &&
                      book.title.split(' ').map((word) => word[0]).join('')}
                  </div>
                  <div className="reading-info">
                    <h4>{book.title}</h4>
                    <p>{book.author}</p>
                    <p className="page-count">
                      Completed: {book.pagesRead} of {book.totalPages} pages
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>You haven't completed any books yet</p>
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
                <h3>Updated progress</h3>
                <p>
                  Read 25 pages of {books.reading[0]?.title || 'your book'}
                </p>
                <span className="update-timestamp">2 hours ago</span>
              </div>
            </div>

            <div className="update-entry">
              <div className="update-symbol">⭐</div>
              <div className="update-info">
                <h3>Added to list</h3>
                <p>
                  {books.wantToRead[0]?.title || 'New book'} added to want to
                  read
                </p>
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