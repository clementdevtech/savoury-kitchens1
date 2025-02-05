import React, { useEffect, useState } from 'react';
const API_URL = process.env.REACT_APP_API_URL;

const Gallery = () => {
  const [images, setImages] = useState({});
  
  useEffect(() => {
    fetch(`${API_URL}/gallery/getimages`)
      .then(response => response.json())
      .then(data => {
        const groupedImages = data.reduce((acc, image) => {
          if (!acc[image.category]) {
            acc[image.category] = [];
          }
          acc[image.category].push(image);
          return acc;
        }, {});
        setImages(groupedImages);
      })
      .catch(error => console.error('Error fetching gallery:', error));
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center">Gallery</h2>
      {Object.entries(images).map(([category, imgs]) => (
        <div key={category} className="mb-4">
          <h3 className="text-primary">{category}</h3>
          <div className="row">
            {imgs.map((img) => (
              <div key={img.id} className="col-md-4 mb-4">
                <img src={img.image_url} alt={`Gallery ${img.id}`} className="img-fluid rounded shadow" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Gallery;
