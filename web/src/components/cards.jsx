import React from 'react';
import { Link } from 'react-router-dom';
import './cards.css';

const Cards = () => {
  return (
    <div>
    <div className="cards-container">
      <div className="card">
        <Link to="/transaction/transfer">
          <h4>Transfer</h4>
          <p>Send money to others.</p>
        </Link>
      </div>
      <div className="card">
        <Link to="/transaction/airtime">
          <h4>Airtime</h4>
          <p>Buy mobile airtime easily.</p>
        </Link>
      </div>
      <div className="card">
        <Link to="/transaction/data">
          <h4>Data</h4>
          <p>Purchase internet data plans.</p>
        </Link>
      </div>
      <div className="card">
        <Link to="/transaction/cable">
          <h4>Cable</h4>
          <p>Pay for cable TV subscriptions.</p>
        </Link>
      </div>
      <div className="card">
        <Link to="/transaction/utility">
          <h4>Utility</h4>
          <p>Settle your utility bills.</p>
        </Link>
      </div>
      <div className="card">
        <Link to="/transaction/currency">
          <h4>convert currency</h4>
          <p>Exchange your money at the best rate.</p>
        </Link>
      </div>
  </div>
  </div>
  );
};

export default Cards;
