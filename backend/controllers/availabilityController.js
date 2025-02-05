const { Pool } = require("../db");
require("dotenv").config();

// Get Availability
const getAvailability = async (req, res) => {
  try {
    const availability = await pool.query("SELECT * FROM availability");
    res.json(availability.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching availability" });
  }
};

// Update Availability
const updateAvailability = async (req, res) => {
  const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = req.body;
  try {
    await pool.query(
      "UPDATE availability SET monday=$1, tuesday=$2, wednesday=$3, thursday=$4, friday=$5, saturday=$6, sunday=$7",
      [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
    );
    res.json({ message: "Availability updated!" });
  } catch (err) {
    res.status(500).json({ message: "Error updating availability" });
  }
};

module.exports = { getAvailability, updateAvailability };
