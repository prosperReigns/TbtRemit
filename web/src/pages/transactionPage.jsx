import React from "react";
import { useParams } from "react-router-dom";
import TransferForm from "../components/TransferForm"
import AirtimeForm from "../components/AirtimeForm";
import DataForm from "../components/DataForm";
import CableForm from "../components/CableForm";
import UtilityForm from "../components/UtilityForm";
import "./transactionPage.css";

const TransactionPage = () => {
  const { type } = useParams();

  const renderTransactionForm = () => {
    switch (type) {
      case "transfer":
        return <TransferForm />;
      case "airtime":
        return <AirtimeForm />;
      case "data":
        return <DataForm />;
      case "cable":
        return <CableForm />;
      case "utility":
        return <UtilityForm />;
      default:
        return <p>Invalid Transaction Type</p>;
    }
  };

  return <div className="transaction-page">{renderTransactionForm()}</div>;
};

export default TransactionPage;
