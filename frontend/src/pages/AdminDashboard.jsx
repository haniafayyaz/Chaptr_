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
        setError(error.response?.data?.message || 'Failed to fetch users');
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
      setError(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/admin-login');
  };

  // Format nested arrays for display
  const formatArray = (arr, key) => {
    if (!arr || arr.length === 0) return 'None';
    if (typeof arr[0] === 'string') return arr.join(', ');
    return arr.map((item, index) => (
      <div key={index}>
        {Object.entries(item).map(([k, v]) => (
          <span key={k}>{`${k}: ${v}, `}</span>
        ))}
      </div>
    ));
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-card">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <h2 className="welcome-message">Welcome, {user?.username || 'Admin'}</h2>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>

        <h3 className="section-title">Manage Users</h3>
        {error && <div className="error-text">{error}</div>}
        {loading ? (
          <div className="loading-text">Loading users...</div>
        ) : (
          <div className="table-wrapper">
            <table className="users-table">
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
                    <td colSpan="10" className="no-users">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.username}</td>
                      <td>{user.bio || 'None'}</td>
                      <td>{user.isAuthor ? 'Yes' : 'No'}</td>
                      <td>{formatArray(user.followers)}</td>
                      <td>
                        {formatArray(
                          user.authorProfile?.books,
                          'title'
                        )}
                      </td>
                      <td>
                        {formatArray(
                          user.authorProfile?.bookDetails,
                          'name'
                        )}
                      </td>
                      <td>
                        {formatArray(
                          user.authorProfile?.announcements,
                          'title'
                        )}
                      </td>
                      <td>
                        <button
                          className="delete-button"
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
      </div>
    </div>
  );
};

export default AdminDashboard;