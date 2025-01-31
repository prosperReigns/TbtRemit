import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/logo-1.jpg'
import './Landing.css';
import Carousel from '../components/carousel';

const Landing = () => {
  return (
    <div style={bodyContainerStyle}>
      <header style={headerStyle}>
        <nav style={navStyle}>
            <div style={logoStyle}>
                <img src={logo} style={{ borderRadius: '50%' }} alt="logo"/>
            </div>
            <div>
                <Link style={linkStyle} to="/register">Register</Link>
                <Link style={linkStyle} to="/login">Login</Link>
            </div>
        </nav>
        
            <Carousel />
        </header>

        <h1>Landing</h1>
    </div>
  );
};

const bodyContainerStyle = {
  position: "relative",
};

const headerStyle = {
  position: 'absolute',
  top: '0',
  minHeight: '100vh',
  width: '100%',
  overflow: 'hidden',
};

const navStyle = {
  width: '100%',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'transparent',
  zIndex: 3,
  position: 'relative',
  padding: '0 30px',
};

const logoStyle = {
  width: '75px',
  height: '75px',
  objectFit: 'cover',
  borderRadius: '50%',
};

const linkStyle = {
  marginRight: '15px',
  padding: '7px',
};

export default Landing;
