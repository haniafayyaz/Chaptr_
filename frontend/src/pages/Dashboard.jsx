import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';
import axios from 'axios';
import Navbar from '../pages/Navbar';
import dashtopImage from '../assets/dashtop.png';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import confetti from 'canvas-confetti';

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
  const [goalAchieved, setGoalAchieved] = useState(false);
  const prevGoalProgress = useRef(0);

  // Music player state
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [deviceId, setDeviceId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Replace with your Spotify access token (in a real app, fetch this securely via OAuth)
  const SPOTIFY_TOKEN = 'YOUR_SPOTIFY_ACCESS_TOKEN';
  const SPOTIFY_PLAYLIST_ID = '37i9dQZF1DXcBWIGoYBM5M'; // Example: Spotify's "Today's Top Hits"

  const triggerConfetti = () => {
    confetti({
      particleCount: 250,
      spread: 100,
      origin: { y: 0.2 },
      colors: [
        '#6ee7b7', // Mint green
        '#3b82f6', // Blue
        '#1e40af', // Dark blue
        '#ffffff', // White
        '#ff0000', // Red
        '#ff7f00', // Orange
        '#ffff00', // Yellow
        '#00ff00', // Green
        '#0000ff', // Blue
        '#4b0082', // Indigo
        '#8a2be2'  // Violet
      ],
    });
  };

  useEffect(() => {
    if (stats.goalProgress >= 100 && prevGoalProgress.current < 100 && goal.dailyPagesGoal > 0) {
      setGoalAchieved(true);
      triggerConfetti();
      
      const timer = setTimeout(() => {
        setGoalAchieved(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
    
    prevGoalProgress.current = stats.goalProgress;
  }, [stats.goalProgress, goal.dailyPagesGoal]);

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Book Dashboard Player',
        getOAuthToken: cb => { cb(SPOTIFY_TOKEN); },
        volume: 0.5
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
        console.log('Spotify Player ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
        setDeviceId(null);
      });

      player.addListener('player_state_changed', (state) => {
        if (!state) return;
        setIsPlaying(!state.paused);
        setCurrentTrack(state.track_window.current_track);
      });

      player.connect().then(success => {
        if (success) {
          console.log('Spotify Player connected successfully');
        } else {
          setErrorMessage('Failed to connect Spotify Player');
        }
      });

      return () => {
        player.disconnect();
      };
    };
  }, []);

  // Fetch playlist tracks
  useEffect(() => {
    if (!SPOTIFY_TOKEN) {
      setErrorMessage('Spotify access token is missing');
      return;
    }

    const fetchPlaylist = async () => {
      try {
        const response = await axios.get(
          `https://api.spotify.com/v1/playlists/${SPOTIFY_PLAYLIST_ID}/tracks`,
          {
            headers: {
              Authorization: `Bearer ${SPOTIFY_TOKEN}`,
            },
          }
        );
        setPlaylistTracks(response.data.items.map(item => item.track));
      } catch (error) {
        console.error('Error fetching playlist:', error);
        setErrorMessage('Failed to fetch playlist. Please check your token or playlist ID.');
      }
    };

    fetchPlaylist();
  }, []);

  const playTrack = async (uri) => {
    if (!deviceId) {
      setErrorMessage('Spotify device not ready');
      return;
    }

    try {
      await axios.put(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          uris: [uri],
        },
        {
          headers: {
            Authorization: `Bearer ${SPOTIFY_TOKEN}`,
          },
        }
      );
    } catch (error) {
      console.error('Error playing track:', error);
      setErrorMessage('Failed to play track');
    }
  };

  const togglePlayPause = async () => {
    if (!deviceId) return;

    if (isPlaying) {
      await player.pause();
    } else {
      await player.resume();
    }
  };

  const playNextTrack = async () => {
    const currentIndex = playlistTracks.findIndex(track => track.uri === currentTrack?.uri);
    const nextIndex = (currentIndex + 1) % playlistTracks.length;
    const nextTrack = playlistTracks[nextIndex];
    await playTrack(nextTrack.uri);
  };

  const playPreviousTrack = async () => {
    const currentIndex = playlistTracks.findIndex(track => track.uri === currentTrack?.uri);
    const prevIndex = (currentIndex - 1 + playlistTracks.length) % playlistTracks.length;
    const prevTrack = playlistTracks[prevIndex];
    await playTrack(prevTrack.uri);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/login');
        return;
      }

      AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100,
      });

      const parsedUser = JSON.parse(userData);
      if (!parsedUser || !parsedUser.username) {
        console.error('Invalid user data');
        navigate('/login');
        return;
      }

      try {
        const profileUrl = process.env.NODE_ENV === 'development'
          ? `http://localhost:5000/api/profile/${parsedUser.username}`
          : `/api/profile/${parsedUser.username}`;
        const profileRes = await axios.get(profileUrl);

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

    const handleStorageChange = () => {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData.username) {
        setUser(userData);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
      });

      setStats((prev) => ({
        ...prev,
        goalProgress: parseInt(newGoalInput) > 0
          ? Math.round((goal.currentProgress / parseInt(newGoalInput)) * 100)
          : 0,
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
    const newPagesRead = Math.min(currentBook.pagesRead + pagesNum, currentBook.totalPages);
    const newProgress = currentBook.totalPages > 0 
      ? Math.round((newPagesRead / currentBook.totalPages) * 100) 
      : 0;
    const isCompleted = newProgress >= 100;

    try {
      const updateUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000/api/reading-list/update-progress'
        : '/api/reading-list/update-progress';
      const response = await axios.put(updateUrl, {
        username: user.username,
        bookId: currentBook.id,
        pagesRead: newPagesRead,
        status: isCompleted ? 'completed' : 'reading',
      });

      const updatedBook = response.data.updatedBook;

      let goalResponse = null;
      if (goal.dailyPagesGoal > 0) {
        const goalUrl = process.env.NODE_ENV === 'development'
          ? 'http://localhost:5000/api/goals/update-progress'
          : '/api/goals/update-progress';
        goalResponse = await axios.put(goalUrl, {
          username: user.username,
          pagesRead: pagesNum,
        });
      }

      setBooks(prev => {
        let updatedReading = prev.reading;
        let updatedCompleted = prev.completed;

        if (isCompleted) {
          updatedReading = prev.reading.filter(book => book.id !== currentBook.id);
          updatedCompleted = [
            ...prev.completed,
            {
              ...currentBook,
              pagesRead: newPagesRead,
              progress: 100,
              status: 'completed',
            },
          ];
        } else {
          updatedReading = prev.reading.map(book =>
            book.id === currentBook.id 
              ? { 
                  ...book, 
                  pagesRead: newPagesRead,
                  progress: newProgress,
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
          booksRead: isCompleted 
            ? prevStats.booksRead + 1 
            : prevStats.booksRead,
        }));

        if (goalResponse) {
          setGoal({
            ...goal,
            currentProgress: goalResponse.data.currentProgress,
            streak: goalResponse.data.streak,
          });
        }

        return {
          ...prev,
          reading: updatedReading,
          completed: updatedCompleted,
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
    return <div className="loading">Loading...</div>;
  }

  if (loading) {
    return <div className="loading">Loading your books...</div>;
  }

  return (
    <div className="dash-wrapper">
      <Navbar />
      {showModal && currentBook && (
        <div className="popup-background">
          <div className="popup-container" data-aos="zoom-in">
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
          <div className="popup-container" data-aos="zoom-in">
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
        <div
          className="dashboard-header"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url(${dashtopImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          data-aos="fade-down"
        >
          <div className="dashboard-header-content">
            <h1>Welcome back, {user.name}!</h1>
          </div>
          <div
            className="profile-icon"
            onMouseEnter={() => setShowProfileMenu(true)}
            onMouseLeave={() => setShowProfileMenu(false)}
          >
            {user.profilePicture ? (
              <img
                src={
                  process.env.NODE_ENV === 'development'
                    ? `http://localhost:5000${user.profilePicture}`
                    : user.profilePicture
                }
                alt="Profile"
                className="profile-picture"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const initialsAvatar = e.target.nextElementSibling;
                  if (initialsAvatar) {
                    initialsAvatar.style.display = 'flex';
                  }
                }}
              />
            ) : (
              <div className="initials-avatar1">
                {user.name?.split(' ').slice(0, 2).map(n => n[0]).join('')}
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
        </div>

        <div className="metrics-display">
          <div className="metric-card" data-aos="fade-up">
            <div className="metric-icon">📚</div>
            <div className="metric-content">
              <h3>{stats.booksRead}</h3>
              <p>Books Read</p>
              <span className="metric-trend">+2 from last month</span>
            </div>
          </div>

          <div className="metric-card" data-aos="fade-up" data-aos-delay="100">
            <div className="metric-icon">📖</div>
            <div className="metric-content">
              <h3>{(stats.pagesRead || 0).toLocaleString()}</h3>
              <p>Pages Read</p>
              <span className="metric-trend">+342 from last month</span>
            </div>
          </div>

          <div className="metric-card" data-aos="fade-up" data-aos-delay="200">
            <div className="metric-icon">🔥</div>
            <div className="metric-content">
              <h3>{stats.readingStreak}</h3>
              <p>Goal Streak</p>
              <span className="metric-trend streak">Keep it up!</span>
            </div>
          </div>

          <div
            className="metric-card goal-card"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <div className="metric-icon">🎯</div>
            <div className="metric-content">
              <div className="goal-progress">
                <CircularProgressbar
                  value={stats.goalProgress > 100 ? 100 : stats.goalProgress}
                  text={`${stats.goalProgress}%`}
                  styles={buildStyles({
                    textSize: '24px',
                    pathColor: '#6ee7b7',
                    textColor: '#ffffff',
                    trailColor: 'rgba(255, 255, 255, 0.1)',
                  })}
                />
              </div>
              <p className="goal-pages">
                {goal.dailyPagesGoal > 0
                  ? `${goal.currentProgress}/${goal.dailyPagesGoal} pages`
                  : 'No goal set'}
              </p>
              <button
                onClick={() => setShowGoalModal(true)}
                className="set-goal-btn"
              >
                {goal.dailyPagesGoal > 0 ? 'Update Goal' : 'Set Goal'}
              </button>
            </div>
          </div>
        </div>

        {/* Music Player Section */}
        <div className="music-player" data-aos="fade-up">
          <h3>Reading Playlist</h3>
          {errorMessage ? (
            <p className="music-error">{errorMessage}</p>
          ) : (
            <>
              <div className="current-track">
                {currentTrack ? (
                  <>
                    <img
                      src={currentTrack.album.images[0]?.url}
                      alt={currentTrack.name}
                      className="track-image"
                    />
                    <div className="track-info">
                      <p className="track-name">{currentTrack.name}</p>
                      <p className="track-artist">{currentTrack.artists[0].name}</p>
                    </div>
                  </>
                ) : (
                  <p>Select a track to play</p>
                )}
              </div>
              <div className="player-controls">
                <button onClick={playPreviousTrack} className="control-btn">⏮</button>
                <button onClick={togglePlayPause} className="control-btn">
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button onClick={playNextTrack} className="control-btn">⏭</button>
              </div>
              <div className="track-list">
                {playlistTracks.map((track, index) => (
                  <div
                    key={track.id}
                    className={`track-item ${currentTrack?.id === track.id ? 'active' : ''}`}
                    onClick={() => playTrack(track.uri)}
                  >
                    <span className="track-number">{index + 1}</span>
                    <span className="track-title">{track.name}</span>
                    <span className="track-artist">{track.artists[0].name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="reading-area">
          <div className="reading-group" data-aos="fade-up">
            <h3>Currently Reading</h3>
            {books.reading.length > 0 ? (
              books.reading.map((book, index) => (
                <div
                  key={book.id}
                  className="reading-item"
                  data-aos="fade-out"
                  data-aos-delay={index * 100}
                >
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

          <div className="reading-group" data-aos="fade-up" data-aos-delay="200">
            <h3>Want to Read</h3>
            {books.wantToRead.length > 0 ? (
              books.wantToRead.map((book, index) => (
                <div
                  key={book.id}
                  className="reading-item"
                  data-aos="fade-out"
                  data-aos-delay={index * 100}
                >
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
                        className="begin-btn remove-btn"
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

          <div className="reading-group" data-aos="fade-up" data-aos-delay="400">
            <h3>Completed Books</h3>
            {books.completed.length > 0 ? (
              books.completed.map((book, index) => (
                <div
                  key={book.id}
                  className="reading-item"
                  data-aos="fade-out"
                  data-aos-delay={index * 100}
                >
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

        <div className="updates-section" data-aos="fade-up">
          <div className="updates-header">
            <h3>Recent Activity</h3>
            <p className="updates-subtitle">Your reading journey</p>
          </div>

          <div className="updates-list">
            <div className="update-entry" data-aos="fade-up" data-aos-delay="100">
              <div className="update-symbol">📖</div>
              <div className="update-info">
                <h3>Updated progress</h3>
                <p>
                  Read 25 pages of {books.reading[0]?.title || 'your book'}
                </p>
                <span className="update-timestamp">2 hours ago</span>
              </div>
            </div>

            <div className="update-entry" data-aos="fade-up" data-aos-delay="200">
              <div className="update-symbol">⭐</div>
              <div className="update-info">
                <h3>Added to list</h3>
                <p>
                  {books.wantToRead[0]?.title || 'New book'} added to want to read
                </p>
                <span className="update-timestamp">Yesterday</span>
              </div>
            </div>
          </div>

          <button className="show-all-btn" data-aos="fade-up" data-aos-delay="300">
            View All Activity →
          </button>
        </div>
      </div>

      {goalAchieved && <div className="confetti-container"></div>}
    </div>
  );
};

export default Dashboard;