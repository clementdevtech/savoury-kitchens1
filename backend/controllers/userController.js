const { pool } = require('../db');
require("dotenv").config();



// Ensure this function exists
const getAllUsers = async (req, res) => {
    try {
      const users = await pool.query("SELECT id, email, username FROM users");
      res.json(users.rows);
    } catch (err) {
      res.status(500).json({ message: "Error retrieving users" });
    }
  };

  module.exports = { getAllUsers };