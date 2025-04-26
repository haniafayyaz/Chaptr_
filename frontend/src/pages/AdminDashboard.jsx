import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/adminDashboard.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || null;

  // Redirect to login if no user is authenticated
  useEffect(() => {
    if (!user) {
      navigate('/admin-login');
    }
  }, [user, navigate]);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/users');
        setUsers(response.data);
        setError('');
      } catch (error) {
        console.error('Fetch users error:', error.response?.data, error.message);
        setError('Failed to fetch users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle user deletion
  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`http://localhost:5000/users/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      setError('');
    } catch (error) {
      console.error('Delete user error:', error.response?.data, error.message);
      setError('Failed to delete user. Please try again.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    navigate('/admin-login');
  };

  // Format nested arrays/objects for display
  const formatArray = (arr, key) => {
    if (!arr || arr.length === 0) return 'None';
    if (typeof arr[0] === 'string') return arr.join(', ');
    return arr.map((item, index) => (
      <div key={index} className="admin-dashboard__nested-item">
        {key ? item[key] : Object.entries(item).map(([k, v]) => (
          <span key={k} className="admin-dashboard__nested-field">{`${k}: ${v}`}</span>
        ))}
      </div>
    ));
  };

  return (
    <div className="admin-dashboard__container">
      <header className="admin-dashboard__header">
        <h1 className="admin-dashboard__title">Admin Dashboard</h1>
        <button className="admin-dashboard__logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <main className="admin-dashboard__content">
        <section className="admin-dashboard__welcome">
          <h2 className="admin-dashboard__welcome-text">Welcome, {user?.username || 'Admin'}</h2>
        </section>
        <section className="admin-dashboard__users">
          <h3 className="admin-dashboard__section-title">Manage Users</h3>
          {error && <div className="admin-dashboard__error">{error}</div>}
          {loading ? (
            <div className="admin-dashboard__loading">Loading users...</div>
          ) : (
            <div className="admin-dashboard__table-wrapper">
              <table className="admin-dashboard__table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Bio</th>
                    <th>Author</th>
                    <th>Followers</th>
                    <th>Books</th>
                    <th>Book Details</th>
                    <th>Announcements</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="admin-dashboard__no-users">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name || 'N/A'}</td>
                        <td>{user.email}</td>
                        <td>{user.username}</td>
                        <td>{user.bio || 'None'}</td>
                        <td>{user.isAuthor ? 'Yes' : 'No'}</td>
                        <td>{formatArray(user.followers)}</td>
                        <td>{formatArray(user.authorProfile?.books, 'title')}</td>
                        <td>{formatArray(user.authorProfile?.bookDetails, 'name')}</td>
                        <td>{formatArray(user.authorProfile?.announcements, 'title')}</td>
                        <td>
                          <button
                            className="admin-dashboard__delete-btn"
                            onClick={() => handleDelete(user._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;