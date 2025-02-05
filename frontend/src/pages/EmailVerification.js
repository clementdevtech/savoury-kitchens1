import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import { Button } from "react-bootstrap";

const EmailVerification = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setCode(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/verify-email", { code });
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Email Verification</h2>
      {error && <p className="text-danger">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Enter Verification Code:</label>
        <input type="text" name="code" onChange={handleChange} required />
        <p>Code expires in 10 minutes</p>
        <Button type="submit">Verify</Button>
      </form>
    </div>
  );
};

export default EmailVerification;
