import React, { useState } from "react";
import { sendTransactionData } from "../api";
import "./DataForm.css";

const AirtimeForm = () => {
  const [formData, setFormData] = useState({
    mobileNumber: "",
    network: "",
    amount: "",
    dialCode: "+234",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBoxClick = (amount) => {
    setFormData({ ...formData, amount });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.amount) {
        alert("Please select an amount.");
        return;
      }
  
      // Concatenate the selected dial code and mobile number
      const fullPhoneNumber = formData.dialCode + formData.mobileNumber;
      const updatedFormData = { ...formData, mobileNumber: fullPhoneNumber };
  
      // Send data with concatenated phone number
      const result = await sendTransactionData("buy-airtime", updatedFormData);
      alert(`Airtime Purchase Successful: ${JSON.stringify(result)}`);
    } catch (error) {
      // Check if the error is due to token expiry or invalid token
      if (error.response && error.response.status === 401) {
        // Token expired or invalid, log the user out
        localStorage.removeItem("authToken");  // Clear the expired token
        alert("Session expired. Please log in again.");
        window.location.href = "/login";  // Redirect to login page
      } else {
        alert("Airtime Purchase Failed");
      }
    }
  };
  

  return (
    <div className="main-container">
      <h2>Airtime Purchase</h2>
      <form onSubmit={handleSubmit}>
        <div className="phone-container">
          <select
            name="dialCode"
            className="input-field"
            value={formData.dialCode}
            onChange={handleChange}
          >
            <option value="+234">+234 (Nigeria)</option>
            <option value="+1">+1 (USA)</option>
            <option value="+44">+44 (UK)</option>
            {/* Add more countries here */}
          </select>
          <input
            type="text"
            className="input-field"
            name="mobileNumber"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            onChange={handleChange}
          />
        </div>
        <input
          type="text"
          className="input-field"
          name="network"
          placeholder="Network"
          value={formData.network}
          onChange={handleChange}
        />
        <div className="grid-container">
          {["100", "200", "500", "1000", "2000"].map((amount) => (
            <div
              key={amount}
              className={`box ${formData.amount === amount ? "selected" : ""}`}
              onClick={() => handleBoxClick(amount)}
            >
              {amount}
            </div>
          ))}
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AirtimeForm;
