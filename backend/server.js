require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Import Routes
const galleryRoutes = require('./routes/galleryRoutes');
const testimonialsRoutes = require('./routes/testimonialsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require("./routes/userRoutes");
const emailRoutes = require("./routes/emailRoutes");
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require("./routes/adminRoutes");
const Availability = require("./routes/availabilityRoutes");

// Use Routes
app.use('/api/gallery', galleryRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/email", emailRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/availability', Availability);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
