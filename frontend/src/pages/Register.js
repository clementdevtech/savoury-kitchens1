import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/Register.css";

import { ProgressBar, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Register = () => {
  const [user, setUser] = useState({ email: "", name: "", password: "", confirmPassword: "", code: "" });
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [attempts, setAttempts] = useState(5);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: "" }); // Clear error on input change
  };

  const validateStep = () => {
    let errors = {};

    if (step === 1) {
      if (!user.email.match(/^\S+@\S+\.\S+$/)) errors.email = "Invalid email format";
      if (user.name.trim().length < 3) errors.name = "Username must be at least 3 characters";
    }

    if (step === 2) {
      if (user.password.length < 6) errors.password = "Password must be at least 6 characters";
      if (user.password !== user.confirmPassword) errors.confirmPassword = "Passwords do not match";
    }

    if (step === 3) {
      if (!user.code.match(/^\d{6}$/)) errors.code = "Verification code must be 6 digits";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Proceed only if no errors
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => setStep(step - 1);
  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateStep()) {
      try {
        const res = await axios.post("http://localhost:5000/api/register", user);
        alert(res.data.message);
        navigate("/email-verification");
      } catch (err) {
        setError(err.response?.data?.message || "Registration failed");
      }
    }
  };

  return (
    <div className="register-container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2>Register</h2>
          <ProgressBar now={(step / 3) * 100} className="mb-3" />
          {error && <p className="text-danger">{error}</p>}
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div>
                <div className="mb-3">
                  <label>Email:</label>
                  <input type="email" name="email" className="form-control" onChange={handleChange} required />
                  {formErrors.email && <p className="text-danger">{formErrors.email}</p>}
                </div>
                <div className="mb-3">
                  <label>Username:</label>
                  <input type="text" name="name" className="form-control" onChange={handleChange} required />
                  {formErrors.name && <p className="text-danger">{formErrors.name}</p>}
                </div>
                <Button onClick={nextStep} className="mt-3">Next</Button>
              </div>
            )}
            {step === 2 && (
              <div>
                <div className="mb-3">
                  <label>Password:</label>
                  <div className="input-group">
                    <input type={showPassword ? "text" : "password"} name="password" className="form-control" onChange={handleChange} required />
                    <span className="icon" onClick={togglePassword}>
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </span>
                  </div>
                  {formErrors.password && <p className="text-danger">{formErrors.password}</p>}
                </div>
                <div className="mb-3">
                  <label>Confirm Password:</label>
                  <div className="input-group">
                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="form-control" onChange={handleChange} required />
                    <span className="icon" onClick={toggleConfirmPassword}>
                      <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </span>
                  </div>
                  {formErrors.confirmPassword && <p className="text-danger">{formErrors.confirmPassword}</p>}
                </div>
                <div className="d-flex justify-content-between mt-3">
                  <Button onClick={prevStep}>Back</Button>
                  <Button onClick={nextStep}>Next</Button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div>
                <div className="mb-3">
                  <label>Enter Verification Code:</label>
                  <input type="text" name="code" className="form-control" onChange={handleChange} required />
                  {formErrors.code && <p className="text-danger">{formErrors.code}</p>}
                </div>
                <p>Code expires in 10 minutes</p>
                <p>Resend code in: {countdown} seconds</p>
                {attempts > 0 && countdown === 0 && (
                  <Button onClick={() => {
                    if (attempts > 0) {
                      setCountdown(60);
                      setAttempts(attempts - 1);
                    }
                  }}>
                    Resend Code ({attempts} attempts left)
                  </Button>
                )}
                <div className="d-flex justify-content-between mt-3">
                  <Button onClick={prevStep}>Back</Button>
                  <Button type="submit" className="btn btn-primary">Verify</Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
