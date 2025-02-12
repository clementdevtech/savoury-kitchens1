import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Button, Table, Form, Spinner, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/Admin.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/admin";

const AdminPage = () => {
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState("");
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 
 // Fetch images
 const fetchImages = useCallback(async () => {
  try {
    const res = await axios.get(`${API_URL}/gallery/getimages`);
    setImages(res.data);
  } catch (err) {
    console.error("Error fetching images:", err.message);
  }
}, []);

useEffect(() => {
  fetchImages();
}, [fetchImages]);

// Handle image upload
const onDrop = async (acceptedFiles) => {
  if (!category) {
    alert("Please select a category before uploading.");
    return;
  }

  const formData = new FormData();
  formData.append("image", acceptedFiles[0]);
  formData.append("category", category);

  try {
    await axios.post(`${API_URL}/gallery`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    fetchImages(); 
    alert("✅ Image uploaded successfully!");
  } catch (err) {
    console.error("Error uploading image:", err.message);
    setError("Failed to upload image.");
  }
};

// Handle image deletion
const handleDeleteImage = async (id) => {
  try {
    await axios.delete(`${API_URL}/gallery/${id}`);
    fetchImages(); // Refresh images after deletion
    alert("✅ Image deleted successfully!");
  } catch (err) {
    console.error("Error deleting image:", err.message);
    setError("Failed to delete image.");
  }
};

// Dropzone for Drag-and-Drop
const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/gettestimonials`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err.message);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings`);
      setBookings(res.data);
    } catch (err) {
      console.error("Error fetching bookings:", err.message);
    }
  }, []);

  const fetchAvailability = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/dates`);
      setDates(res.data);
    } catch (err) {
      console.error("Error fetching availability:", err.message);
    }
  }, []);

  // ✅ Fetch all data once when the component mounts
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([fetchImages(), fetchReviews(), fetchBookings(), fetchAvailability()]);
    } catch (err) {
      console.error("Error fetching data:", err.message);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fetchImages, fetchReviews, fetchBookings, fetchAvailability]);

  // ✅ Ensures `fetchData` runs only once when component mounts
  useEffect(() => {
    fetchData();
  }, [fetchData]);



  // ✅ Handle booking response (approve/reject)
  const handleRespondBooking = async (id, response) => {
    try {
      await axios.put(`${API_URL}/bookings/${id}`, { status: response });
      fetchBookings();
    } catch (err) {
      console.error("Error responding to booking:", err.message);
    }
  };

  // ✅ Handle availability updates
  const handleUpdateAvailability = async () => {
    try {
      await axios.put(`${API_URL}/dates`, dates);
      alert("✅ Availability updated successfully!");
    } catch (err) {
      console.error("Error updating availability:", err.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Admin Panel</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      )}

 {/* Image Upload Section */}
 <h3>Upload New Image</h3>
      <Form.Group>
        <Form.Label>Select Category</Form.Label>
        <Form.Control
          as="select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">-- Select Category --</option>
          <option value="Events">Events</option>
          <option value="Menu/Food">Menu/Food</option>
          <option value="Decorations">Decorations </option>
        </Form.Control>
      </Form.Group>

      <div
        {...getRootProps()}
        className={`dropzone mt-3 p-3 text-center ${isDragActive ? "active" : ""}`}
        style={{ border: "2px dashed #ccc", cursor: "pointer" }}
      >
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop the image here...</p> : <p>Drag & drop an image or click to browse</p>}
      </div>

      {/* Display Uploaded Images */}
      <h3 className="mt-4">Gallery Images</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Image</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {images.map((img) => (
            <tr key={img.id}>
              <td>
                <img src={require(`../assets/images/${img.filename}`)} alt="" width="100" />
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


      {/* Manage Reviews Section */}
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
                <Button variant="primary" className="me-2">
                  Approve
                </Button>
                <Button variant="warning">Reject</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Manage Bookings Section */}
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
                <Button
                  variant="success"
                  className="me-2"
                  onClick={() => handleRespondBooking(booking.id, "Approved")}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleRespondBooking(booking.id, "Rejected")}
                >
                  Reject
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Update Availability Section */}
      <h3>Update Availability</h3>
      <Form>
        {Object.keys(dates).map((day) => (
          <Form.Check
            type="checkbox"
            key={day}
            label={day.charAt(0).toUpperCase() + day.slice(1)}
            checked={dates[day]}
            onChange={() => setDates((prev) => ({ ...prev, [day]: !prev[day] }))}
          />
        ))}
      </Form>
      <Button className="mt-3" onClick={handleUpdateAvailability}>
        Update Availability
      </Button>
    </div>
  );
};

export default AdminPage;
