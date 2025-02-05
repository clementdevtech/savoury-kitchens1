const express = require("express");
const { addImage, getImages, deleteImage } = require("../controllers/galleryController");
const router = express.Router();

// Route to Add an Image
router.post("/", addImage);

// Route to Get All Images
router.get("/", getImages);

// Route to Delete an Image
router.delete("/:id", deleteImage);

module.exports = router;
