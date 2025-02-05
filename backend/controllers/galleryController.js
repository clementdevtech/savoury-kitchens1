const { pool } = require('../db'); // Ensure correct import

// Add Image with Category
const addImage = async (req, res) => {
    const { url, category } = req.body;
    try {
      await pool.query("INSERT INTO gallery (url, category) VALUES ($1, $2)", [url, category]);
      res.json({ message: "Image added successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Error adding image" });
    }
};

// Get All Images
const getImages = async (req, res) => {
   console.log("getImages");
    try {
      const images = await pool.query("SELECT * FROM gallery");
      res.json(images.rows);
    } catch (err) {
      res.status(500).json({ message: "Error fetching gallery" });
      console.log("Error in getting images:",err.message);
    }
};

// Delete Image
const deleteImage = async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query("DELETE FROM gallery WHERE id = $1", [id]);
      res.json({ message: "Image deleted successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Error deleting image" });
    }
};

// Export Functions
module.exports = { addImage, getImages, deleteImage };
