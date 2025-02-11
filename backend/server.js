require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
    origin: process.env.CLIENT_URL,  
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  };
  app.use(cors(corsOptions));
  

// Middleware
app.use(express.json());
app.use(cookieParser());
 

// Serve static files
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
const availabilityRoutes = require("./routes/availabilityRoutes");

// Use Routes
app.use('/api/gallery', galleryRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use("/api/email", emailRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/availability', availabilityRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
