import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./form.css";

const ValidateOtp = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleOtpChange = (value, index) => {
    // Allow only numbers
    if (/^\d?$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);

      // Automatically focus the next input box
      if (value !== "" && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length < 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    // Retrieve the token from localStorage or wherever it's stored
    const token = localStorage.getItem("x-registration-token");
    if (!token) {
      setError("Registration token is missing. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/validate-otp`,
        { otp: enteredOtp },
        {
          headers: {
            "x-registration-token": token,
          },
        }
      );

      if (response.status === 201) {
        setSuccess(true);
        navigate("/login");
      }
    } catch (err) {
      setError("Invalid OTP or token. Please try again.");
    }finally {
      setIsLoading(false);
  }
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmitOtp} className="form-container">
        <h1 className="heading">Validate OTP</h1>
        <div className="otp-container">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              className="otp-box"
              maxLength="1"
            />
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" 
        className="button"
        disabled={isLoading}
        style={isLoading ? { backgroundColor: "#ccc", cursor: "not-allowed" } : {}}
        >{isLoading ? "Loading..." : "Validate Otp"}</button>
        {success && <p className="success">OTP validated successfully!</p>}
      </form>
    </div>
  );
};

export default ValidateOtp;
