import React, { useEffect, useState } from 'react';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    fetch('http://localhost:5000/api/testimonials')
      .then(response => response.json())
      .then(data => {
        setTestimonials(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching testimonials:', error);
        setError('Failed to load testimonials');
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center">Testimonials</h2>

      {loading && <p className="text-center">Loading testimonials...</p>}

      {error && <p className="text-danger text-center">{error}</p>}

      {!loading && testimonials.length === 0 && !error && (
        <p className="text-center text-muted">No testimonials available.</p>
      )}

      <div className="row">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="col-md-4 mb-4">
            <div className="card p-3 shadow">
              <p className="text-muted">"{testimonial.message}"</p>
              <h5 className="text-end">- {testimonial.name}</h5>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
