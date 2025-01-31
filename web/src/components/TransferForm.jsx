import React, { useState, useEffect } from "react";
import Modal from "../components/Modal";
import "./Modal.css";
import './DataForm.css';
import { sendTransactionData } from "../api";


const TransferForm = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [transactionPin, setTransactionPin] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch the bank list from the backend
  const fetchBankList = async (bankName = "") => {
    try {
        const response = await sendTransactionData("bank-list", {
            bank_name: bankName, 
          });
          
          if (response.status === 200) {
            const { bankCode, accountName } = response.data;
            setBankCode(bankCode);
            setAccountName(accountName); 
          } else {
            console.log("Bank not found");
          }
        } catch (error) {
          console.error("Failed to fetch bank list:", error.message);
        }
  };

  // Perform the name enquiry
  const handleNameEnquiry = async () => {
    if (!accountNumber || !bankCode) return;
    setLoading(true);
    try {
      const response = await sendTransactionData("name-enquiry", {
        accountNumber,
        bankCode,
      });

      if (response.status === 200){
        setSessionId(response.data.sessionId);
        setAccountName(response.data.accountName);
      }
    } catch (error) {
      console.error("Failed to perform name enquiry:", error.message);
      setAccountName("Error fetching account name");
    } finally {
      setLoading(false);
    }
  };

  // Handle the final transfer request
  const handleTransfer = async () => {
    setLoading(true);
    try {
        const res = await sendTransactionData("transfer", {
            sessionId,
            bankCode,
            accountNumber,
            amount,
            narration,
            transactionPin,
          });
        if (res.status === 200) {
            alert("Transfer successful");
            setIsPinModalOpen(false);
        }
    } catch (error) {
      console.error("Transfer failed:", error.message);
      alert("Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load the bank list when the component mounts
  useEffect(() => {
    fetchBankList();
  }, []);

  return (
    <div className="main-container">
      <form>
        <div>
          <label htmlFor="bankCode">Select Bank</label>
          <select
            id="bankCode"
            value={bankCode}
            onChange={(e) => {
                const selectedBankCode = e.target.value;
                setBankCode(selectedBankCode);
                const selectedBankName = e.target.options[e.target.selectedIndex].text;
                fetchBankList(selectedBankName);
                handleNameEnquiry(); 
            }}
            className="input-field"
          >
            <option value="">Choose a bank</option>
            {banks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="accountNumber">Account Number</label>
          <input
            id="accountNumber"
            value={accountNumber}
            onChange={(e) => {
              setAccountNumber(e.target.value);
              handleNameEnquiry(); 
            }}
            placeholder="Enter account number"
            className="input-field"
          />
        </div>
        {accountName && (
          <div className="box">
            <label>Account Name:</label>
            <p>{accountName}</p>
          </div>
        )}
        <div>
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="narration">Narration</label>
          <input
            id="narration"
            value={narration}
            onChange={(e) => setNarration(e.target.value)}
            placeholder="Enter narration"
            className="input-field"
          />
        </div>
        <button
          type="button"
          onClick={() => setIsDetailsModalOpen(true)}
          className="btn btn-primary"
        >
          Transfer
        </button>
      </form>

      {/* Confirmation Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)}>
        <h2 className="text-lg font-bold">Confirm Transfer</h2>
        <div className="space-y-4">
          <p>Account Name: {accountName}</p>
          <p>Bank: {banks.find((b) => b.code === bankCode)?.name}</p>
          <p>Account Number: {accountNumber}</p>
          <p>Amount: {amount}</p>
          <p>Narration: {narration}</p>
        </div>
        <div className="modal-actions">
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="button button-primary"
          >
            Confirm
          </button>
        </div>
      </Modal>

      {/* Transaction PIN Modal */}
      <Modal isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)}>
        <h2 className="text-lg font-bold">Enter Transaction PIN</h2>
        <input
          type="password"
          value={transactionPin}
          onChange={(e) => setTransactionPin(e.target.value)}
          placeholder="Enter your transaction PIN"
          className="input-field"
        />
        <div className="modal-actions">
          <button
            onClick={handleTransfer}
            disabled={loading}
            className="button button-primary"
          >
            {loading ? "Processing..." : "Submit"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default TransferForm;

























// import React, { useState } from "react";
// import { sendTransactionData } from "../api";
// import "./DataForm.css";

// const TransferForm = () => {
//   const [formData, setFormData] = useState({
//     bank: "",
//     accountNumber: "",
//     amount: "",
//     narrative: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const result = await sendTransactionData("transfer", formData);
//       alert(`Transfer Successful: ${JSON.stringify(result)}`);
//     } catch (error) {
//       if (error.response && error.response.status === 401) {
//         localStorage.removeItem("authToken");
//         alert("Session expired. Please log in again.");
//         window.location.href = "/login";
//       } else {
//         alert("Transfer Failed");
//       }
//     }
//   };
  
//   return (
//     <div className="main-container">
//       <h2>Transfer</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           className="input-field"
//           name="bank"
//           placeholder="Bank"
//           value={formData.bank}
//           onChange={handleChange}
//         />
//         <input
//           type="text"
//           className="input-field"
//           name="accountNumber"
//           placeholder="Account Number"
//           value={formData.accountNumber}
//           onChange={handleChange}
//         />
//         <input
//           type="text"
//           className="input-field"
//           name="amount"
//           placeholder="Amount"
//           value={formData.amount}
//           onChange={handleChange}
//         />
//         <input
//           type="text"
//           className="input-field"
//           name="narrative"
//           placeholder="Narrative"
//           value={formData.narrative}
//           onChange={handleChange}
//         />
//         <button type="submit">Submit</button>
//       </form>
//     </div>
//   );
// };

// export default TransferForm;
