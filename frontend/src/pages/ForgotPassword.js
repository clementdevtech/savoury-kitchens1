import React, { useState, useEffect } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/css/ForgotPassword.css";

const API_URL = process.env.REACT_APP_API_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (countdown > 0) return; 
    try {
      const res = await axios.post(`${API_URL}/forgot-password`, { email });
      setMessage(res.data.message);
      setCountdown(3600); 
    } catch (err) {
      setMessage(err.response?.data?.message || "Error sending recovery email");
    }
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="recover-container">
      <h2>Forgot Password</h2>
      {message && <p className="text-info">{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <button type="submit" disabled={countdown > 0}>
          {countdown > 0 ? `Resend in ${Math.floor(countdown / 60)}m ${countdown % 60}s` : "Send Recovery Code"}
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
