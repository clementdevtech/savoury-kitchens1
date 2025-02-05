import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Table, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/Admin.css";

const AdminPage = () => {
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [dates, setDates] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });

  useEffect(() => {
    fetchImages();
    fetchReviews();
    fetchBookings();
    fetchAvailability();
  }, []);

  const fetchImages = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/images");
    setImages(res.data);
  };

  const fetchReviews = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/reviews");
    setReviews(res.data);
  };

  const fetchBookings = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/bookings");
    setBookings(res.data);
  };

  const fetchAvailability = async () => {
    const res = await axios.get("http://localhost:5000/api/admin/dates");
    setDates(res.data);
  };

  const handleDeleteImage = async (id) => {
    await axios.delete(`http://localhost:5000/api/admin/images/${id}`);
    fetchImages();
  };

  const handleRespondBooking = async (id, response) => {
    await axios.put(`http://localhost:5000/api/admin/bookings/${id}`, { response });
    fetchBookings();
  };

  const handleUpdateAvailability = async () => {
    await axios.put("http://localhost:5000/api/admin/dates", dates);
  };

  return (
    <div className="container mt-5">
      <h2>Admin Panel</h2>

      <h3>Manage Images</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Image</th>
            <th>Category</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {images.map((img) => (
            <tr key={img.id}>
              <td>
                <img src={img.url} alt="" width="100" />
              </td>
              <td>{img.category}</td>
              <td>
                <Button variant="danger" onClick={() => handleDeleteImage(img.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h3>Sort & Respond to Reviews</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Review</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>{review.text}</td>
              <td>
                <Button variant="primary">Approve</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h3>Manage Bookings</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Booking</th>
            <th>Respond</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.details}</td>
              <td>
                <Button variant="success" onClick={() => handleRespondBooking(booking.id, "Approved")}>
                  Approve
                </Button>
                <Button variant="danger" onClick={() => handleRespondBooking(booking.id, "Rejected")}>
                  Reject
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h3>Update Availability</h3>
      <Form>
        {Object.keys(dates).map((day) => (
          <Form.Check
            type="checkbox"
            key={day}
            label={day.charAt(0).toUpperCase() + day.slice(1)}
            checked={dates[day]}
            onChange={() => setDates({ ...dates, [day]: !dates[day] })}
          />
        ))}
      </Form>
      <Button onClick={handleUpdateAvailability}>Update</Button>
    </div>
  );
};

export default AdminPage;
