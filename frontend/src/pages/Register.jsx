import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DOMPurify from "dompurify";
import "../styles/register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    isAuthor: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Validation rules
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation: 2-50 characters, letters and spaces only
    const sanitizedName = DOMPurify.sanitize(formData.name);
    if (!sanitizedName) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z\s]{2,50}$/.test(sanitizedName)) {
      newErrors.name = "Name must be 2-50 characters and contain only letters and spaces";
    }

    // Email validation: standard email format, max 100 characters
    const sanitizedEmail = DOMPurify.sanitize(formData.email);
    if (!sanitizedEmail) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      newErrors.email = "Invalid email format";
    } else if (sanitizedEmail.length > 100) {
      newErrors.email = "Email must be less than 100 characters";
    }

    // Username validation: 3-20 characters, alphanumeric and underscores
    const sanitizedUsername = DOMPurify.sanitize(formData.username);
    if (!sanitizedUsername) {
      newErrors.username = "Username is required";
    } else if (!/^[A-Za-z0-9_]{3,20}$/.test(sanitizedUsername)) {
      newErrors.username = "Username must be 3-20 characters and contain only letters, numbers, or underscores";
    }

    // Password validation: 8-50 characters, at least one capital letter, one digit, no special characters
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,50}$/.test(formData.password)) {
      newErrors.password = "Password must be 8-50 characters, contain at least one capital letter, one digit, and only letters and numbers";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    
    // Clear error for field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const sanitizedData = {
        name: DOMPurify.sanitize(formData.name),
        username: DOMPurify.sanitize(formData.username),
        email: DOMPurify.sanitize(formData.email),
        password: formData.password, // Password is validated, not sanitized
        isAuthor: formData.isAuthor,
      };

      await axios.post("http://localhost:5000/auth/register", sanitizedData);

      navigate("/login");
    } catch (error) {
      // Log detailed error for debugging
      console.error("Registration Error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack,
        formData: {
          email: sanitizedData.email,
          username: sanitizedData.username,
          name: sanitizedData.name,
          isAuthor: sanitizedData.isAuthor,
        },
      });

      // User-friendly error message
      const status = error.response?.status;
      let message = "Something went wrong. Please try again.";
      if (status === 429) {
        message = "Too many requests. Please try again later.";
      } else if (status === 400) {
        message = error.response.data.message || "Invalid registration details.";
      } else if (status === 401) {
        message = "Session expired, please log in again.";
      } else if (!error.response) {
        message = "Unable to connect to the server. Please check your network.";
      }

      setErrors({
        ...errors,
        server: message,
      });
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="app-name">Chaptr</h1>
        <h2>Create an account</h2>
        <p>Enter your information to create an account</p>

        {errors.server && <div className="error-text">{errors.server}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>

          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="john_doe"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? "input-error" : ""}
            />
            {errors.username && <div className="error-text">{errors.username}</div>}
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="m@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <div className="error-text">{errors.password}</div>}
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
            />
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>

          <div className="input-group">
            <label>
              <input
                type="checkbox"
                name="isAuthor"
                checked={formData.isAuthor}
                onChange={handleChange}
              />
              Register as an author
            </label>
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