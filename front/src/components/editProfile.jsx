// EditUserProfile.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Header } from './header'
// import { useNavigate } from 'react-router-dom';

const GOOGLE_API_KEY = 'AIzaSyCiAc-8wst8vnD5B1XKumZYXYqfrpWyDCs';

const EditUserProfile = () => {
  const [formData, setFormData] = useState({
    addrs1: '',
    addrs2: '',
    city: '',
    state: '',
    zip: '',
    f_desc: '',
    f_photo: '',
  });
  
  const navigate = useNavigate();

  useEffect(() => {

    const fetchUserProfile = async () => {
        const uid = localStorage.getItem('uid');
        if (!uid) return;
        try {
            const url = `http://localhost:4000/getUserProfile/${uid}`; 
            const res = await axios.get(url);
            const userProfileData = res.data.threads[0];
            userProfileData.addrs2 = userProfileData.addrs2 || '';
            userProfileData.f_desc = userProfileData.f_desc || '';
            userProfileData.f_photo = userProfileData.f_photo || '';
            setFormData(userProfileData);
        } catch (err) {
            console.log('Error fetching user profile:', err.response ? err.response.data : err.message);
        }
    };

    fetchUserProfile();
  }, [])

  const geocodeAddress = async (address) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: address,
          key: GOOGLE_API_KEY,
        },
      });
      if (response.data.status === 'OK') {
        const location = response.data.results[0].geometry.location;
        return `(${location.lat}, ${location.lng})`;
      } else {
        throw new Error('Geocoding failed');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      throw err;
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(e.target.name, e.target.value)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const uid = localStorage.getItem('uid');
        if (!uid) return;

        const fullAddress = `${formData.addrs1}, ${formData.city}, ${formData.state}, ${formData.zip}`;
        const location = await geocodeAddress(fullAddress);

        const updatedData = { ...formData, location, uid};
        const url = 'http://localhost:4000/updateUserProfile';
        const res = await axios.post(url, updatedData);
        console.log(location)
        console.log('Profile updated successfully:', res.data);
        // Optionally, you can redirect the user to another page after successful update
        navigate('/home');
    } catch (err) {
      console.log('Error updating profile:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <div>
    <Header/>
    <div className="form-container">
      <h1>Edit User Profile</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>
            Address 1:
            <input type="text" name="addrs1" value={formData.addrs1} onChange={handleChange} required />
          </label>
          <label>
            Address 2:
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
            Zip:
            <input type="text" name="zip" value={formData.zip} onChange={handleChange} required />
          </label>
          <label>
            Description (max 120 characters):
            <input type="text" name="f_desc" maxLength="120" value={formData.f_desc} onChange={handleChange} />
          </label>
          <label>
            Picture URL:
            <input type="text" name="f_photo" value={formData.f_photo} onChange={handleChange} />
          </label>
        </div>
        <button type="submit" className='button'>Save</button>
      </form>
    </div>
    </div>
  );
};

export {EditUserProfile}