import React, { useState } from "react";
import { sendTransactionData } from "../api";
import "./DataForm.css";

const DataForm = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const [network, setNetwork] = useState("");
  const [dataPlan, setDataPlan] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialCode, setDialCode] = useState("+234");

  const handlePlanSelect = (plan) => {
    setDataPlan(plan);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    if (!dataPlan) {
      setError("Please select a data plan.");
      setIsLoading(false);
      return;
    }
  
    try {
      // Concatenate the dial code and mobile number before sending it to the backend
      const fullMobileNumber = dialCode + mobileNumber;
      const data = { mobileNumber: fullMobileNumber, network, dataPlan };
      
      const result = await sendTransactionData("buy-data", data);
      alert(`Data purchase successful: ${JSON.stringify(result)}`);
      setMobileNumber("");
      setNetwork("");
      setDataPlan("");
    } catch (err) {
      // Check if the error is due to token expiry or invalid token
      if (err.response && err.response.status === 401) {
        // Token expired or invalid, log the user out
        localStorage.removeItem("authToken");  // Clear the expired token
        alert("Session expired. Please log in again.");
        window.location.href = "/login";  // Redirect to login page
      } else {
        setError("Failed to purchase data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="main-container">
      <h2>Data Purchase</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="phone-container">
          <select
            name="dialCode"
            className="input-field"
            value={dialCode}
            onChange={(e) => setDialCode(e.target.value)}
          >
            <option value="+234">+234 (Nigeria)</option>
            <option value="+1">+1 (USA)</option>
            <option value="+44">+44 (UK)</option>
          </select>
          <input
            type="text"
            className="input-field"
            placeholder="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
        </div>
        <input
          type="text"
          className="input-field"
          placeholder="Network"
          value={network}
          onChange={(e) => setNetwork(e.target.value)}
        />
        <div className="grid-container">
          {["500MB (7 Days)", "1GB (14 Days)", "1.5GB (30 Days)", "3GB (30 Days)", "5GB (30 Days)"].map((plan) => (
            <div
              key={plan}
              className={`box ${dataPlan === plan ? "selected" : ""}`}
              onClick={() => handlePlanSelect(plan)}
            >
              {plan}
            </div>
          ))}
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default DataForm;
