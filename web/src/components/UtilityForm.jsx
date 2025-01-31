import React, { useState } from "react";
import { sendTransactionData } from "../api";
import "./DataForm.css";

const UtilityForm = () => {
  const [utilityType, setUtilityType] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      const data = { utilityType, meterNumber, amount };
      const result = await sendTransactionData("utility", data);
      alert(`Utility bill payment successful: ${JSON.stringify(result)}`);
      setUtilityType("");
      setMeterNumber("");
      setAmount("");
    } catch (err) {
      // Check if the error is due to token expiry or invalid token
      if (err.response && err.response.status === 401) {
        // Token expired or invalid, log the user out
        localStorage.removeItem("authToken");  // Clear the expired token
        alert("Session expired. Please log in again.");
        window.location.href = "/login";  // Redirect to login page
      } else {
        setError("Failed to process utility payment. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="main-container">
      <h2>Utility Bill Payment</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Utility Type (e.g., Electricity)"
          value={utilityType}
          onChange={(e) => setUtilityType(e.target.value)}
        />
        <input
          type="text"
          className="input-field"
          placeholder="Meter Number"
          value={meterNumber}
          onChange={(e) => setMeterNumber(e.target.value)}
        />
        <input
          type="number"
          className="input-field"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default UtilityForm;
