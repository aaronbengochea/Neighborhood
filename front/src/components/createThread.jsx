import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from './header';
import './comp.css';

function CreateThread() {
  const [formData, setFormData] = useState({
    uid: localStorage.getItem('uid'),
    receiverType: '',
    receiver: '',
    subject: '',
    body: ''
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Set default receiver type based on the previous feed
  useEffect(() => {
    if (location.state && location.state.defaultReceiverType) {
      setFormData({...formData, receiverType: location.state.defaultReceiverType});
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:4000/createThread', formData);

      switch (formData.receiverType) {
        case 'neighborhood':
          navigate('/neighborhoodFeed');
          break;
        case 'block':
          navigate('/blockFeed');
          break;
        case 'friend':
          navigate('/friendsFeed');
          break;
        default:
          navigate('/neighborsFeed'); 
          break;
      }
    } catch (error) {
      console.error('Failed to create thread:', error);
    }
  };

  return (
    <div>
        <Header/>
    
    <div className="form-container">
      <h1>Create Thread</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Receiver Type:</label>
          <select name="receiverType" value={formData.receiverType} onChange={handleChange} required>
            <option value="">Select Receiver Type</option>
            <option value="neighbor">Neighbor</option>
            <option value="friend">Friend</option>
            <option value="block">Block</option>
            <option value="neighborhood">Neighborhood</option>
          </select>
        </div>
        {formData.receiverType !== 'neighborhood' && formData.receiverType !== 'block' && (
          <div className="form-field">
            <label>Receiver:</label>
            <input type="text" name="receiver" value={formData.receiver} onChange={handleChange} required />
          </div>
        )}
        <div className="form-field">
          <label>Subject:</label>
          <input type="text" name="subject" value={formData.subject} onChange={handleChange} maxLength="50" required />
        </div>
        <div className="form-field">
          <label>Body:</label>
          <textarea name="body" value={formData.body} onChange={handleChange} maxLength="255" rows="10" required />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
    </div>
  );
}

export {CreateThread}