const express = require("express");
const reviewController = require("../controllers/reviewController");

const router = express.Router();

// Debugging log
console.log("Review Controller:", reviewController);


if (!reviewController.getReviews) {
  console.error("❌ Error: getReviews function is undefined in reviewController.js");
}

router.get("/", reviewController.getReviews); // Ensure this function is correctly defined

module.exports = router;
