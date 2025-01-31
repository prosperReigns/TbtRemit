import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import Cards from "../components/cards";

const Home = () => {
  const username = "John Doe";
  const balance = 2500.5; 

  return (
    <div className="home">
      {/* Header Section */}
      <header className="header">
        <div className="user-info">
          <h2>Welcome, {username}!</h2>
          <p>Balance: ₦{balance.toFixed(2)}</p>
        </div>
      </header>

      {/* Cards Section */}
      <section className="transaction-links">
        <h3>Make a Transaction</h3>
        <Cards />
      </section>
    </div>
  );
};

export default Home;
