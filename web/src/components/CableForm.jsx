import React, { useState } from "react";
import { sendTransactionData } from "../api";
import './DataForm.css';

const CableForm = () => {
  const [provider, setProvider] = useState("");
  const [smartcardNumber, setSmartcardNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      const data = { provider, smartcardNumber, amount };
      const result = await sendTransactionData("cable", data);
      alert(`Cable subscription successful: ${JSON.stringify(result)}`);
      setProvider("");
      setSmartcardNumber("");
      setAmount("");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("authToken");
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
      } else {
        setError("Failed to process cable subscription. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="main-container">
      <h2>Cable Subscription</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-field"
          placeholder="Cable Provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        />
        <input
          type="text"
          className="input-field"
          placeholder="Smartcard Number"
          value={smartcardNumber}
          onChange={(e) => setSmartcardNumber(e.target.value)}
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

export default CableForm;
