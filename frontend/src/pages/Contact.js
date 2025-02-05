import React, { useEffect, useState } from 'react';

const Contact = () => {
  const [contact, setContact] = useState({ email: '', phone: '', address: '' });

  useEffect(() => {
    fetch('http://localhost:5000/api/contact')
      .then(response => response.json())
      .then(data => setContact(data))
      .catch(error => console.error('Error fetching contact:', error));
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center">Contact Us</h2>
      <p><strong>Email:</strong> {contact.email}</p>
      <p><strong>Phone:</strong> {contact.phone}</p>
      <p><strong>Address:</strong> {contact.address}</p>
    </div>
  );
};

export default Contact;
