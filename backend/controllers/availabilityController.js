const { pool } = require("../db");
require("dotenv").config();

// Get Availability 
const getAvailability = async (req, res) => {
  try {
    console.log('Fetching available dates for the next month...');

    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);

    //Insert the next 30 days if they don't already exist
    for (let i = 0; i < 30; i++) {
      let date = new Date();
      date.setDate(today.getDate() + i);
      let formattedDate = date.toISOString().split("T")[0];

      await pool.query(
        "INSERT INTO available_dates (date, booked) VALUES ($1, false) ON CONFLICT (date) DO NOTHING",
        [formattedDate]
      );
    }

    //Fetch the updated list of dates
    const availability = await pool.query(
      "SELECT date, booked FROM available_dates WHERE date BETWEEN $1 AND $2 ORDER BY date ASC",
      [today.toISOString().split("T")[0], nextMonth.toISOString().split("T")[0]]
    );

    res.json({ dates: availability.rows });
  } catch (err) {
    console.error('Error fetching availability:', err.message);
    res.status(500).json({ message: "Error fetching availability" });
  }
};


// Mark a Date as Booked
const bookDate = async (req, res) => {
  const { date } = req.body;

  try {
    const result = await pool.query(
      "UPDATE available_dates SET booked = true WHERE date = $1 RETURNING *",
      [date]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ message: "Date is not available or already booked" });
    }

    res.json({ message: "Date successfully booked!" });
  } catch (err) {
    console.error("Error booking date:", err.message);
    res.status(500).json({ message: "Error booking date" });
  }
};

// ✅ Admin Updates Available Dates
const updateAvailability = async (req, res) => {
  const { dates } = req.body;

  try {
    await pool.query("DELETE FROM available_dates");
    for (let date of dates) {
      await pool.query("INSERT INTO available_dates (date, booked) VALUES ($1, false)", [date]);
    }

    res.json({ message: "Availability updated successfully!" });
  } catch (err) {
    console.error("Error updating availability:", err.message);
    res.status(500).json({ message: "Error updating availability" });
  }
};

module.exports = { getAvailability, bookDate, updateAvailability };