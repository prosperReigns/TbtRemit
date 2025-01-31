import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./form.css";

const SetPin = () => {
  const [pin, setPin] = useState(new Array(4).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handlePinChange = (value, index) => {
    // Allow only numbers
    if (/^\d?$/.test(value)) {
      const updatedPin = [...pin];
      updatedPin[index] = value;
      setPin(updatedPin);

      // Automatically focus the next input box
      if (value !== "" && index < pin.length - 1) {
        document.getElementById(`pin-${index + 1}`).focus();
      }
    }
  };

  const handleSubmitPin = async (e) => {
    e.preventDefault();
    const enteredPin = pin.join("");

    if (enteredPin.length < 4) {
      setError("Please enter a valid 4-digit PIN.");
      return;
    }


    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("You are not logged in. Please log in to continue.");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/dashboard/set-pin`,
        {transaction_pin: enteredPin },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        navigate("/home");
      }
    } catch (err) {
      setError("Failed to set PIN. Please try again.");
    }
  };

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmitPin} className="form-container">
        <h1 className="heading">Set PIN</h1>
        <div className="pin-container">
          {pin.map((digit, index) => (
            <input
              key={index}
              id={`pin-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handlePinChange(e.target.value, index)}
              className="pin-box"
              maxLength="1"
            />
          ))}
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="button">Set PIN</button>
        {success && <p className="success">PIN set successfully!</p>}
      </form>
    </div>
  );
};

export default SetPin;
