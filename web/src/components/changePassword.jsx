import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./form.css";

const ChangePassword = () => {
  const [old_password, setOldPassword] = useState("");
  const [new_password, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!old_password || !new_password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (new_password !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    // Retrieve the token from localStorage or wherever it's stored
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("You are not logged in. Please log in to continue.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/dashboard/change-password`,
        {
          old_password,
          new_password,
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("Failed to change password. Please try again.");
    }
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit} className="form-container">
        <h1 className="heading">Change Password</h1>
        <div className="input-container">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            value={old_password}
            onChange={(e) => setOldPassword(e.target.value)}
            className="input-box"
          />
        </div>
        <div className="input-container">
          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            value={new_password}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-box"
          />
        </div>
        <div className="input-container">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-box"
          />
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit" className="button">Change Password</button>

        {success && <p className="success">Password changed successfully!</p>}
      </form>
    </div>
  );
};

export default ChangePassword;
