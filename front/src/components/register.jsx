import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GOOGLE_API_KEY = 'AIzaSyCiAc-8wst8vnD5B1XKumZYXYqfrpWyDCs';

function Register() {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    addrs1: '',
    addrs2: '',
    city: '',
    state: '',
    zip: '',
    username: '',
    pass: '',
    email: '',
    location: null,
  });

  const navigate = useNavigate();

  const transformData = (data) => {
    const transformedData = {};
    Object.keys(data).forEach(key => {
      transformedData[key] = data[key] === '' ? null : data[key];
    });
    return transformedData;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const geocodeAddress = async (address) => {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address,
        key: GOOGLE_API_KEY,
      },
    });

    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      return `(${location.lng}, ${location.lat})`;  // Point format: "(x, y)"
    } else {
      throw new Error('Geocoding failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const address = `${formData.addrs1}, ${formData.city}, ${formData.state} ${formData.zip}`;
    try {
      const location = await geocodeAddress(address);
      const transformedFormData = transformData({ ...formData, location });

      const url = 'http://localhost:4000/userSignup';
      const res = await axios.post(url, transformedFormData);
      console.log('Registration successful:', res.data);
      localStorage.setItem('uid', res.data.uid);
      navigate('/home');
    } catch (err) {
      console.log('Error during registration:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <div className="form-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>
            First Name:
            <input type="text" name="fname" value={formData.fname} onChange={handleChange} required />
          </label>
          <label>
            Last Name:
            <input type="text" name="lname" value={formData.lname} onChange={handleChange} required />
          </label>
          <label>
            Email:
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
          <label>
            Address Line 1:
            <input type="text" name="addrs1" value={formData.addrs1} onChange={handleChange} required />
          </label>
          <label>
            Address Line 2:
            <input type="text" name="addrs2" value={formData.addrs2} onChange={handleChange} />
          </label>
          <label>
            City:
            <input type="text" name="city" value={formData.city} onChange={handleChange} required />
          </label>
          <label>
            State:
            <input type="text" name="state" value={formData.state} onChange={handleChange} required />
          </label>
          <label>
            ZIP Code:
            <input type="text" name="zip" value={formData.zip} onChange={handleChange} required />
          </label>
          <label>
            Username:
            <input type="text" name="username" value={formData.username} onChange={handleChange} required />
          </label>
          <label>
            Password:
            <input type="password" name="pass" value={formData.pass} onChange={handleChange} required />
          </label>
        </div>
        <button type="submit" className='button'>Register</button>
      </form>
    </div>
  );
}

export { Register };
