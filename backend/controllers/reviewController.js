// controllers/testimonialsController.js
const { pool } = require('../db');


const getTestimonials = async (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = 3; 

  try {
    const query = `
      SELECT testimonials.id, testimonials.message, testimonials.created_at, users.username
      FROM testimonials
      JOIN users ON testimonials.user_id = users.id
      ORDER BY testimonials.created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const values = [limit, offset];

    const result = await pool.query(query, values);
    const testimonials = result.rows;

    res.status(200).json(testimonials);
  } catch (err) {
    console.error('Error fetching testimonials:', err.message);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};


const addTestimonial = async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'User ID and message are required' });
  }

  try {
    const query = `
      INSERT INTO testimonials (user_id, message) 
      VALUES ($1, $2) 
      RETURNING id, user_id, message, created_at;
    `;
    const values = [userId, message];

    const result = await pool.query(query, values);
    const newTestimonial = result.rows[0];

    res.status(201).json(newTestimonial);
  } catch (err) {
    console.error('Error saving testimonial:', err);
    res.status(500).json({ error: 'Failed to save testimonial' });
  }
};

module.exports = { getTestimonials, addTestimonial };

