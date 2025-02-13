import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Button, Table, Form, Spinner, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/Admin.css";

const API_URL = process.env.REACT_APP_API_URL;

const AdminPage = () => {
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState("");
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState({ id: null, text: "" });
  const [emailSubject, setEmailSubject] = useState("");
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 
 //....................images...............................................
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
    alert("Image uploaded successfully!");
  } catch (err) {
    console.error("Error uploading image:", err.message);
    setError("Failed to upload image.");
  }
};

// Handle image deletion
const handleDeleteImage = async (id) => {
  try {
    await axios.delete(`${API_URL}/gallery/${id}`);
    fetchImages(); 
    alert("Image deleted successfully!");
  } catch (err) {
    console.error("Error deleting image:", err.message);
    setError("Failed to delete image.");
  }
};

const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/testimonials/gettestimonials`);
      setReviews(res.data);
    } catch (err) {
      console.error("Error fetching reviews:", err.message);
    }
  }, []);

  //....................bookings...............................................
  const fetchBookings = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/bookings`);
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error("Error fetching bookings:", err.message);
    }
  }, []);
  
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  
  //Admin Responds to Booking (Approve/Reject + Message)
  const handleRespondBooking = async (id, status, email) => {
    try {
      await axios.put(`${API_URL}/bookings/${id}`, {
        status,
        email,
        message: message.text || "No message from admin.",
      });
  
      alert("Response sent successfully!");
      setMessage({ id: null, text: "" });
      fetchBookings();
    } catch (err) {
      console.error("Error responding to booking:", err.message);
    }
  };
  
  //Admin Sends Custom Email
  const handleSendAdminEmail = async (email) => {
    try {
      await axios.post(`${API_URL}/admin-email`, {
        email,
        subject: emailSubject,
        message: message.text,
      });
  
      alert("Email sent successfully!");
      setEmailSubject("");
      setMessage({ id: null, text: "" });
    } catch (err) {
      console.error("Error sending admin email:", err.message);
    }
  };
  
  
//...........................availability dates...............................
  const fetchAvailability = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/availability/dates`);
      console.log("Available Dates API Response:", res.data); 
  
      if (res.data.dates.length === 0) {
        const today = new Date();
        const next30Days = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(today.getDate() + i);
          return { date: date.toISOString().split("T")[0], booked: false };
        });
  
        setDates(next30Days);
      } else {
        setDates(res.data.dates);
      }
    } catch (err) {
      console.error("Error fetching availability:", err.message);
    }
  }, []);


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


  useEffect(() => {
    fetchData();
  }, [fetchData]);


  
  const toggleDateStatus = (index) => {
    setDates((prevDates) => {
      const newDates = [...prevDates];
      newDates[index].booked = !newDates[index].booked;
      return newDates;
    });
  };


  //Handle availability updates
  const saveAvailability = async () => {
    try {
      await axios.put(`${API_URL}/admin/dates`, { dates });
      alert("Availability updated successfully!");
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
              {img.filename ? (<img src={require(`../assets/images/${img.filename}`)} alt={img.category || "Gallery item"} width="100" />
              ) : (
                <span>No Image Available</span>
              )}
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
          <th>Name</th>
          <th>Email</th>
          <th>Date</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {bookings.map((booking) => (
          <tr key={booking.id}>
            <td>{booking.name}</td>
            <td>{booking.email}</td>
            <td>{new Date(booking.date).toLocaleDateString()}</td>
            <td>{booking.status}</td>
            <td>
              <Form.Control
                type="text"
                placeholder="Enter message..."
                value={message.id === booking.id ? message.text : ""}
                onChange={(e) => setMessage({ id: booking.id, text: e.target.value })}
              />
              <Button
                variant="success"
                className="mt-2"
                onClick={() => handleRespondBooking(booking.id, "Approved", booking.email)}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                className="mt-2"
                onClick={() => handleRespondBooking(booking.id, "Rejected", booking.email)}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                className="mt-2"
                onClick={() => handleSendAdminEmail(booking.email)}
              >
                Send Email
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>

      {/* Update Availability Section */}
      <h3>Manage Availability (Next 30 Days)</h3>
    <Table striped bordered hover className="mt-4">
      <thead>
        <tr>
          <th>Date</th>
          <th>Status</th>
          <th>Toggle</th>
        </tr>
      </thead>
      <tbody>
        {dates.map((dateObj, index) => (
          <tr key={index}>
            <td>{new Date(dateObj.date).toLocaleDateString()}</td>
            <td>{dateObj.booked ? "❌ Booked" : "✅ Available"}</td>
            <td>
              <Button
                variant={dateObj.booked ? "danger" : "success"}
                onClick={() => toggleDateStatus(index)}
              >
                {dateObj.booked ? "Mark Available" : "Mark Booked"}
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>

    <Button className="mt-3" onClick={saveAvailability}>
      Save Changes
    </Button>
    </div>
  );
};

export default AdminPage;
