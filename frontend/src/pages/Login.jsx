import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate instead of useHistory
import axios from "axios"; // Import axios
import "../styles/login.css"; // Ensure correct import

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Use useNavigate for redirecting after login

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true); // Set loading to true while making the request

    try {
      const response = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      // If login is successful, handle the response (you can store the token, for example)
      alert("Login successful!");

      // Store the token in localStorage (or you could store it in state or a context)
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user data if needed

      console.log(localStorage.getItem('user'));

      // Redirect to a different page (e.g., dashboard, home) after successful login
      navigate("/dashboard"); // Change to the route you want to navigate to after login

    } catch (error) {
      setError(error.response ? error.response.data.message : "Server error. Please try again.");
    }

    setLoading(false); // Set loading to false after the request is done
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
              {loading ? "Logging in..." : "Login"}
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