import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/css/Booking.css';

const API_URL = process.env.REACT_APP_API_URL;

const BookingPage = () => {
  const [availableDates, setAvailableDates] = useState([]);
  const [openDays, setOpenDays] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    numberOfGuests: 1,
  });

  useEffect(() => {
    // Fetch available dates and open days from backend
    axios.get(`${API_URL}/available-dates`)
      .then((response) => {
        setAvailableDates(response.data.dates);
        setOpenDays(response.data.openDays);
      })
      .catch((error) => {
        console.error('Error fetching available dates!', error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_URL}/bookings`, formData)
      .then(() => {
        alert('Booking successful!');
        setFormData({
          name: '',
          email: '',
          date: '',
          numberOfGuests: 1,
        });
      })
      .catch((error) => {
        console.error('Error creating booking!', error);
        alert('Error creating booking. Please try again.');
      });
  };

  return (
    <div className="booking-container">
      <div className="booking-card">
        <h2 className="text-center">Catering Booking</h2>

        <h5 className="text-center">Open Days</h5>
        <ul className="open-days-list">
          {openDays.map((day, index) => (
            <li key={index}>{day}</li>
          ))}
        </ul>

        <form onSubmit={handleSubmit} className="booking-form">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="date">Select Date:</label>
          <select id="date" name="date" value={formData.date} onChange={handleChange} required>
            <option value="">Select a date</option>
            {availableDates.map((date) => (
              <option key={date.id} value={date.date}>
                {date.date}
              </option>
            ))}
          </select>

          <label htmlFor="numberOfGuests">Number of Guests:</label>
          <input
            type="number"
            id="numberOfGuests"
            name="numberOfGuests"
            value={formData.numberOfGuests}
            onChange={handleChange}
            required
            min="1"
          />

          <button type="submit">Book Now</button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
