import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LandingPage from './pages/LandingPage'; 
import Register from "./pages/Register"; 
import Dashboard from "./pages/Dashboard"; 
import Books from "./pages/Books"; 
import BookDetails from './pages/BookDetails';
import BookClub from './pages/BookClub';
import ClubPage from './pages/ClubPosts';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/clubs" element={<BookClub />} />
        <Route path="/club/:clubId" element={<ClubPage />} />
      </Routes>
    </Router>
  );
}

export default App;