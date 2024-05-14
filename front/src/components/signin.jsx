import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = 'http://localhost:4000/userSignin'; // Adjust this URL to where your server is hosted and the correct endpoint
    
    try {
      const res = await axios.post(url, formData);
      if (res.data.message){
        console.log(res.data.message)

      } else {
        console.log('Sign in successful:', res.data);
        localStorage.setItem('uid', res.data.uid)
        navigate('/home')
      }
      
      // Handle successful sign in, e.g., storing auth tokens, redirecting, etc.
    } catch (err) {
      console.error('Error during sign in:', err.response ? err.response.data : err);
      // Handle errors, such as displaying an error message to the user
    }
  };

  return (
    <div className="form-container">
      <h1>Sign In</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>
            Email:
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>
        </div>
        <div className="form-field">
          <label>
            Password:
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </label>
        </div>
        <button type="submit" className="button">Sign In</button>
      </form>
    </div>
  );
}

export {Signin}