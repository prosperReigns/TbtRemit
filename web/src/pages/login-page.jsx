import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import './form.css';
import './landing.css';

const Login = () => {
    const [values, setValues] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setValues({
            ...values,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            // Send login data to backend
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, {
                email: values.email,
                password: values.password,
            });

            if (response.status === 200) {
                // Store the token and user role in localStorage
                localStorage.setItem('authToken', response.data.token);
                //TODO: localStorage.setItem('userRole', response.data.role); 

                // Navigate based on user role
                if (response.data.role === 'admin') {
                    navigate("/admin");  // Redirect to admin page
                } else {
                    navigate("/home");  // Redirect to home page for non-admin users
                }
            }
        } catch (err) {
            console.error("Error during login:", err);
            setError("Invalid credentials. Please try again.");
        }finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="form-container">
                <h1 className="heading">Login</h1>
                <div className="form-control">
                    <input
                        type="email"
                        id="email"
                        onChange={handleChange}
                        value={values.email}
                        placeholder=" "
                        className="input-control"
                    />
                    <label htmlFor="email" className="label-control">Email</label>
                </div>
                <div className="form-control">
                    <input
                        type="password"
                        id="password"
                        onChange={handleChange}
                        value={values.password}
                        placeholder=" "
                        className="input-control"
                    />
                    <label htmlFor="password" className="label-control">Password</label>
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit" 
                className="button"
                disabled={isLoading} 
                style={isLoading ? { backgroundColor: "#ccc", cursor: "not-allowed" } : {}}
                >{isLoading ? "Loading..." : "Login"}</button>
                <p className="altenative">Don't have an account? <Link to='/register' className="link-style">Sign up</Link></p>
            </form>
        </div>
    );
};

export default Login;
