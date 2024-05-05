import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Header } from './header';
import './comp.css';

function NeighborsFeed() {
  const [threads, setThreads] = useState([]);
  const [showCreated, setShowCreated] = useState(false); // Toggle state
  const navigate = useNavigate();

  useEffect(() => {
    const uid = localStorage.getItem('uid');
    if (!uid) return;

    const endpoint = showCreated ? `createdNeighbors/${uid}` : `receivedNeighbors/${uid}`;

    const fetchThreads = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/neighborsFeedThreads/${endpoint}`);
        setThreads(res.data.threads);
      } catch (error) {
        console.error('Failed to fetch threads:', error.response ? error.response.data : error.message);
        setThreads([])
      }
    };

    fetchThreads();
  }, [showCreated]);

  return (
    <div>
      <Header />
      <h1>Neighbors Feed</h1>
      <div className='button-container'>
        <button className={`toggle-button ${showCreated ? 'toggle-on' : 'toggle-off'}`} onClick={() => setShowCreated(!showCreated)}>
          {showCreated ? 'View Received' : 'View Created'}
        </button>
        <button className="create-thread-button" onClick={() => navigate('/createThread', { state: { defaultReceiverType: 'neighbor' } })}>
          Create Thread
        </button>
      </div>
      <div className="thread-list">
        {threads.map(thread => (
          <div key={thread.tid} className="thread-card" onClick={() => navigate(`/threads/${thread.tid}`)}>
            <h2>{thread.subject} - <small>{showCreated ? `Sent to ${thread.username}` : `Posted by ${thread.username}`}</small></h2>
            <p className="thread-body">{thread.body}</p>
            <p className="thread-date">Created at: {new Date(thread.created).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export { NeighborsFeed };

