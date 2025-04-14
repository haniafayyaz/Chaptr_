// src/pages/Login.js
import React, { useState, useContext } from 'react'; // Add useContext
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/login.css';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Use context to get login function

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        email,
        password,
      });

      alert('Login successful!');

      // Store in localStorage with keys matching AuthContext
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Update AuthContext
      login(response.data.token, response.data.user);

      navigate('/dashboard');
    } catch (error) {
      setError(error.response ? error.response.data.message : 'Server error. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div>
      <div className="login-container">
        <div className="login-card">
          <h1 className="app-name">Chaptr</h1>
          <h2 className="heading">Login</h2>
          <p className="text">Enter your credentials to access your account</p>

          {error && <div className="error-alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>

            <div className="input-group">
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>

            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="signup-text">
            Don't have an account? <Link to="/register" className="link">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;