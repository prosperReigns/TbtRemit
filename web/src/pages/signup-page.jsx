import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import './form.css';
import './landing.css';

const Register = () => {
    const [values, setValues] = useState({
        name: "",
        email: "",
        password: "",
        password2: "",
        bvn: "",
        phoneNumber: "",
    });

    const [countryCode, setCountryCode] = useState("+234");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setValues({
            ...values,
            [e.target.id]: e.target.value,
        });
    };

    const handleCountryCodeChange = (e) => {
        setCountryCode(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (values.password !== values.password2) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                name: values.name,
                email: values.email,
                password: values.password,
                bvn: values.bvn,
                phoneNumber: `${countryCode}${values.phoneNumber}`,
            };
            console.log("Payload being sent:", payload);

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, payload);

            if (response.status === 200) {
                const token = response.data.token;
                localStorage.setItem("x-registration-token", token);
                navigate("/validate-otp");
            }
        } catch (err) {
            console.error("Error during registration:", err);
            setError("An error occurred. Please try again.");
        }finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-wrapper">
            <form onSubmit={handleSubmit} className="form-container">
                <h1 className="heading">Sign up</h1>
                {['name', 'email', 'password', 'password2', 'bvn'].map((field) => (
                    <div key={field} className="form-control">
                        <input
                            type={field.includes("password") ? "password" : field === "email" ? "email" : "text"}
                            id={field}
                            onChange={handleChange}
                            value={values[field]}
                            placeholder=" "
                            className="input-control"
                        />
                        <label
                            htmlFor={field}
                            className="label-control"
                        >
                            {field === "password2" ? "Confirm Password" : field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                    </div>
                ))}

                <div className="form-control">
                    <div className="phone-input">
                        <select
                            value={countryCode}
                            onChange={handleCountryCodeChange}
                            className="input-control country-code-dropdown"
                        >
                            <option value="+234">+234 (Nigeria)</option>
                            <option value="+1">+1 (USA)</option>
                            <option value="+44">+44 (UK)</option>
                            <option value="+91">+91 (India)</option>
                        </select>
                        <input
                            type="text"
                            id="phoneNumber"
                            onChange={handleChange}
                            value={values.phoneNumber}
                            placeholder="Phone Number"
                            className="input-control"
                        />
                    </div>
                </div>

                {error && <p className="error">{error}</p>}
                <button type="submit" 
                className="button"
                disabled={isLoading} 
                style={isLoading ? { backgroundColor: "#ccc", cursor: "not-allowed" } : {}}
                >{isLoading ? "Loading..." : "Register"}</button>
                <p className="altenative">Already have an Account? <Link to='/login' className="link-style">Login</Link></p>
            </form>
        </div>
    );
};

export default Register;
