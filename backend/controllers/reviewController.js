const { pool } = require("../db");

// Get all reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await pool.query("SELECT * FROM testimonials ORDER BY created_at DESC");
    res.json(reviews.rows.length ? reviews.rows : []); // Ensure an array is always returned
  } catch (err) {
    res.status(500).json({ message: "Error fetching testimonials" });
  }
};


// Add a new review
const addReview = async (req, res) => {
  const { name, message } = req.body;
  try {
    await pool.query("INSERT INTO testimonials (name, message) VALUES ($1, $2)", [name, message]);
    res.json({ message: "Review added successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add review" });
  }
};

// Ensure correct export
module.exports = { getReviews, addReview };
