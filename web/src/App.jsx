import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import Home from "./pages/home";
import Login from "./pages/login-page";
import Register from "./pages/signup-page";
import ValidateOtp from "./pages/validateOtp";
import TransactionPage from './pages/transactionPage';
import'./common.css';

const App = () => {
  return (
	<div>
	  <Routes>
		<Route path="/" element={<Landing />} />
		<Route path="home" element={<Home />} />
		<Route path="register" element={<Register />} />
		<Route path="login" element={<Login />} />
		<Route path="validate-otp" element={<ValidateOtp />} />
		<Route path="/transaction/:type" element={<TransactionPage />} />
		<Route path="*" element={<h1>Page not found</h1>} />
	  </Routes>
	</div>
  );
}

export default App;