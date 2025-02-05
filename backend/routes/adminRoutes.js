const express = require("express");
const { addImage, deleteImage, getImages } = require("../controllers/galleryController");
const testimonialsController = require("../controllers/reviewController");
const { getBookings, respondToBooking } = require("../controllers/bookingController");
const { updateAvailability, getAvailability } = require("../controllers/availabilityController");

const router = express.Router();


router.post("/images", addImage);
router.get("/images", getImages);
router.delete("/images/:id", deleteImage);

// Review Management
router.get('/gettestimonials', testimonialsController.getTestimonials);

// Booking Management
router.get("/bookings", getBookings);
router.put("/bookings/:id", respondToBooking);

// Availability Management
router.get("/dates", getAvailability);
router.put("/dates", updateAvailability);

module.exports = router;
