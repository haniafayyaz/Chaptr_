// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import BookClub from './pages/BookClub';
import ClubPage from './pages/ClubPosts';
import Profile from './pages/Profile';
import Authors from './pages/Authors'; 
import Publications from './pages/Publications'; 
import Calendar from './pages/Calendar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <Books />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute>
                <BookDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clubs"
            element={
              <ProtectedRoute>
                <BookClub />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/:clubId"
            element={
              <ProtectedRoute>
                <ClubPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authors"
            element={
              <ProtectedRoute>
                <Authors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/publications"
            element={
              <ProtectedRoute>
                <Publications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <Calendar />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;