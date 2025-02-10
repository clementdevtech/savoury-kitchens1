const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {pool, db} = require("../db");
//const rateLimit = require('express-rate-limit');
const { sendVerificationEmail, sendPasswordRecoveryEmail } = require("./emailController");
require("dotenv").config();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role }, 
        process.env.JWT_SECRET,
    { expiresIn: "7d" } 
  );
};

const register = async (req, res) => {
  const { email, name, password } = req.body;

  try {
    // Check if email or username exists
    const existingUser = await db("users")
      .where("email", email)
      .orWhere("username", name)
      .first();

    if (existingUser) {
      return res.status(400).json({
        message: "Email or Username already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user (set verified to false initially)
    await db("users").insert({
      email,
      username: name,
      password: hashedPassword,
      verified: false,
    });

    return res.status(201).json({
      message: "User registered successfully. Proceed to verification.",
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const check_user = async (req, res) => {
 
  try {
    const { email, name } = req.body;
    console.log("checking:", email, name);

    if (!email || !name) {
      return res.status(400).json({ message: "Email and username are required" });
    }

    // Query the database to check if email or username already exists
    const user = await db("users")
      .where("email", email)
      .orWhere("username", name)
      .first();

    if (user) {
      if (user.email === email && user.name === name) {
        return res.status(409).json({ message: "Email and Username already exist" });
      } else if (user.email === email) {
        return res.status(409).json({ message: "Email already exists" });
      } else {
        return res.status(409).json({ message: "Username already exists" });
      }
    }

    res.json({ exists: false });
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
/*
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: 'Too many login attempts from this IP, please try again later.',
});*/


//................Login route
const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("login:", email);
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }

  try {
      const user = await db('users')
        .where('email', email)
        .first();

      if (!user) {
        return res.status(404).json({ error: 'Email not found' });
      }

      const token1 = req.cookies.token;
      console.log("token1:", token1);
      if (token1) {
        return jwt.verify(token1, process.env.JWT_SECRET, (err, decodedUser) => {
          if (!err) {
            return res.status(200).json({ message: 'Already logged in', user: decodedUser });
          }
        });
      }

      /*if (!user.is_verified) {
        return res.status(403).json({
          error: 'Email not verified',
          action: 'showVerificationSection',
        });
      }*/

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      const { password: _, ...userWithoutPassword } = user;

      const token = jwt.sign(
        { ...userWithoutPassword, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        path: '/'
      });

      console.log("token1:", token1);


      res.status(200).json({ message: 'Login successful' });

  } catch (error) {
    console.error('Error in login:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const logout = (req, res) => {
  res.clearCookie("auth_token", { httpOnly: true, sameSite: "Strict", secure: process.env.NODE_ENV === "production" });
  res.json({ message: "Logged out successfully" });
};



const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const response = await sendPasswordRecoveryEmail(email);
    if (response.error) {
      return res.status(400).json({ message: response.error });
    }

    res.status(200).json(response);
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { register, check_user, login, logout, forgotPassword };
