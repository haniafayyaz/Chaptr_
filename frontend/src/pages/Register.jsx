import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory
import axios from "axios"; // Import axios
import "../styles/register.css"; // Ensure correct import

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // New state for username
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState(""); // To display errors
  const [loading, setLoading] = useState(false); // Loading state

  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setLoading(true); // Set loading to true while making the request

    try {
      const response = await axios.post("http://localhost:5000/auth/register", {
        name,
        username, // Sending username to the backend
        email,
        password,
      });

      console.log(response.data); // You can check the response
      alert("Account created successfully!");

      // Redirect after successful registration using navigate
      navigate("/login");

    } catch (error) {
      setError(error.response ? error.response.data.message : "Server error. Please try again.");
    }

    setLoading(false); // Set loading to false after the request is done
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="app-name">Chaptr</h1> {/* App Name inside the box */}
        <h2>Create an account</h2>
        <p>Enter your information to create an account</p>

        {passwordError && <div className="error-alert">{passwordError}</div>}
        {error && <div className="error-alert">{error}</div>} {/* Display other errors */}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Username</label> {/* New username field */}
            <input
              type="text"
              placeholder="john_doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
