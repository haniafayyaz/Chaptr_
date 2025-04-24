import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/adminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/auth/admin', {
        email,
        password,
      });

      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/admin-dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-login-container">
        <div className="admin-login-card">
          <h1 className="app-name">Chaptr Admin</h1>
          <h2 className="heading">Admin Login</h2>
          <p className="text">Enter your admin credentials to access the dashboard</p>

          {error && <div className="error-text">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="label">Email</label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                id="adminEmailInput"
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
                id="adminPwInput"
              />
            </div>

            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="user-login-text">
            Not an admin? <Link to="/login" className="link">User Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;