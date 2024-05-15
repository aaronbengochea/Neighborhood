import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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

  const [friends, setFriends] = useState([]);
  const [neighbors, setNeighbors] = useState([]);
  const [block, setBlock] = useState([]);
  const [neighborhood, setNeighborhood] = useState([]);


  useEffect(() => {
    const fetchFriends = async () => {
      if (formData.receiverType === 'friend') {
        try {
          const uid = localStorage.getItem('uid');
          const res = await axios.get(`http://localhost:4000/friendsListThreadFetch/${uid}`);
          const friendsData = res.data && res.data.threads ? res.data.threads : [];
          if (res.data.message) {
            console.log(res.data.message);
            setFriends([]);
          } else {
            setFriends(friendsData); 
          }
        } catch (error) {
          console.error('Failed to fetch friends:', error);
          setFriends([]);
        }
      }
    };
  
    fetchFriends();
  }, [formData.receiverType]);

  useEffect(() => {
    const fetchNeighbors = async () => {
      if (formData.receiverType === 'neighbor') {
        try {
          const uid = localStorage.getItem('uid');
          const res = await axios.get(`http://localhost:4000/neighborsListThreadFetch/${uid}`);
          const neighborsData = res.data && res.data.threads ? res.data.threads : [];
          if (res.data.message) {
            console.log(res.data.message);
            setNeighbors([]);
          } else {
            setNeighbors(neighborsData); 
          }
        } catch (error) {
          console.error('Failed to fetch neighbors:', error);
          setNeighbors([]);
        }
      }
    };
  
    fetchNeighbors();
  }, [formData.receiverType]);

  useEffect(() => {
    const fetchBlock = async () => {
      if (formData.receiverType === 'block') {
        try {
          const uid = localStorage.getItem('uid');
          const res = await axios.get(`http://localhost:4000/blockFetch/${uid}`);
          const blockData = res.data && res.data.threads ? res.data.threads : [];
          if (res.data.message) {
            console.log(res.data.message);
            setBlock([]);
          } else {
            setBlock(blockData); 
          }
        } catch (error) {
          console.error('Failed to fetch neighbors:', error);
          setBlock([]);
        }
      }
    };
  
    fetchBlock();
  }, [formData.receiverType]);

  useEffect(() => {
    const fetchNeighborhood = async () => {
      if (formData.receiverType === 'neighborhood') {
        try {
          const uid = localStorage.getItem('uid');
          const res = await axios.get(`http://localhost:4000/neighborhoodFetch/${uid}`);
          const neighborhoodData = res.data && res.data.threads ? res.data.threads : [];
          if (res.data.message) {
            console.log(res.data.message);
            setNeighborhood([]);
          } else {
            setNeighborhood(neighborhoodData); 
          }
        } catch (error) {
          console.error('Failed to fetch neighbors:', error);
          setNeighborhood([]);
        }
      }
    };
  
    fetchNeighborhood();
  }, [formData.receiverType]);

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
    <Header />
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
        {['friend', 'neighbor', 'block'].includes(formData.receiverType) && (
          <div className="form-field">
            <label>Receiver:</label>
            <select name="receiver" value={formData.receiver} onChange={handleChange} required>
              <option value="">Select a {formData.receiverType}</option>
              {(formData.receiverType === 'friend' ? friends :
               formData.receiverType === 'neighbor' ? neighbors :
               formData.receiverType === 'block' ? block : []).map(contact => (
                <option key={contact.uid || contact.bid} value={contact.uid || contact.bid}>
                  {contact.username || contact.b_name}
                </option>
              ))}
            </select>
          </div>
        )}
        {formData.receiverType === 'neighborhood' && (
          <div className="form-field">
            <label>Receiver:</label>
            <select name="receiver" value={formData.receiver} onChange={handleChange} required>
              <option value="">Select a neighborhood</option>
              {neighborhood.map(neighborhood => (
                <option key={neighborhood.nid} value={neighborhood.nid}>
                  {neighborhood.n_name}
                </option>
              ))}
            </select>
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
        <button className={`filter-button all`} type="submit">Submit</button>
      </form>
    </div>
  </div>
);
}

export {CreateThread}