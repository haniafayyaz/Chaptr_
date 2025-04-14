import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.username) {
        navigate('/login');
        return;
      }

      try {
        const apiUrl = process.env.NODE_ENV === 'development'
          ? `http://localhost:5000/api/profile/${userData.username}`
          : `/api/profile/${userData.username}`;
        const response = await axios.get(apiUrl);
        setUser(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          password: '',
          bio: response.data.bio || ''
        });
      } catch (error) {
        console.error('Error fetching profile:', error.response?.data || error.message);
        setError(error.response?.data?.message || 'Failed to load profile');
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const updateUrl = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5000/api/profile/update'
        : '/api/profile/update';

      // Include username from localStorage in the update payload
      const userData = JSON.parse(localStorage.getItem('user'));
      const payload = { ...formData, username: userData.username };
      console.log('Sending update:', payload); // Debug
      const updateResponse = await axios.put(updateUrl, payload);

      // Update localStorage with data from update response
      const updatedUserData = {
        name: updateResponse.data.user.name,
        username: updateResponse.data.user.username,
        email: updateResponse.data.user.email,
        bio: updateResponse.data.user.bio || '',
        profilePicture: updateResponse.data.user.profilePicture || ''
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      console.log('Updated localStorage:', updatedUserData); // Debug

      if (profilePicture) {
        const formDataPicture = new FormData();
        formDataPicture.append('profilePicture', profilePicture);
        formDataPicture.append('username', userData.username); // Use username from localStorage
        const uploadUrl = process.env.NODE_ENV === 'development'
          ? 'http://localhost:5000/api/profile/upload-picture'
          : '/api/profile/upload-picture';
        const uploadResponse = await axios.post(uploadUrl, formDataPicture, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        // Update localStorage with new profile picture
        updatedUserData.profilePicture = uploadResponse.data.profilePicture;
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        console.log('Updated localStorage with profile picture:', updatedUserData); // Debug
      }

      // Refetch user profile to confirm changes
      const apiUrl = process.env.NODE_ENV === 'development'
        ? `http://localhost:5000/api/profile/${userData.username}`
        : `/api/profile/${userData.username}`;
      const fetchResponse = await axios.get(apiUrl);
      const fetchedUser = fetchResponse.data;

      // Update state
      setUser(fetchedUser);
      setFormData({
        name: fetchedUser.name,
        email: fetchedUser.email,
        password: '',
        bio: fetchedUser.bio || ''
      });
      window.dispatchEvent(new Event('storage')); // Notify dashboard
      console.log('Profile updated, state set:', fetchedUser); // Debug

      setEditMode(false);
      setProfilePicture(null);
      setPreview(null);
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setError('');
    setProfilePicture(null);
    setPreview(null);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <div className="profile-header">
          <h2>{editMode ? 'Edit Profile' : 'My Profile'}</h2>
          <Link to="/dashboard" className="back-btn">Back to Dashboard</Link>
        </div>
        {error && <p className="error-message">{error}</p>}

        <div className={`profile-picture-section ${editMode ? 'edit-mode' : ''}`}>
          {user.profilePicture ? (
            <img
              src={
                preview ||
                (process.env.NODE_ENV === 'development'
                  ? `http://localhost:5000${user.profilePicture}`
                  : user.profilePicture)
              }
              alt="Profile"
              className="profile-img"
              onError={(e) => console.error('Image load error:', user.profilePicture)}
            />
          ) : (
            <div className="initials-avatar">{user.name.split(' ').map((n) => n[0]).join('')}</div>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Account Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="New password"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Profile Picture</h3>
              <div className="form-group">
                <label htmlFor="profilePicture">Upload New Picture</label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  className="file-input"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>About You</h3>
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={toggleEditMode} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-details">
            <div className="details-section">
              <h3>Personal Information</h3>
              <p>
                <strong>Full Name:</strong> {user.name}
              </p>
              <p>
                <strong>Username:</strong> {user.username}
              </p>
            </div>
            <div className="details-section">
              <h3>Account Details</h3>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
            <div className="details-section">
              <h3>About You</h3>
              <p>
                <strong>Bio:</strong> {user.bio || 'No bio provided'}
              </p>
            </div>
            <button onClick={toggleEditMode} className="edit-btn">
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;