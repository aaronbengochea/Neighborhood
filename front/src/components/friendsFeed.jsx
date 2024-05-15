import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Header } from './header';
import './comp.css';

function FriendsFeed() {
  const [threads, setThreads] = useState([]);
  const [filteredThreads, setFilteredThreads] = useState([]);
  const [showCreated, setShowCreated] = useState(false); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const uid = localStorage.getItem('uid');
    if (!uid) return;

    const endpoint = showCreated ? `createdFriends/${uid}` : `receivedFriends/${uid}`;

    const fetchThreads = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/friendsFeedThreads/${endpoint}`);
        if (res.data.message) {
          console.log(res.data.message);
          setThreads([]);
          setFilteredThreads([]);
        } else {
          setThreads(res.data.threads);
          setFilteredThreads(res.data.threads); // Initialize filteredThreads with fetched data
        }
      } catch (error) {
        console.error('Failed to fetch threads:', error.response.data);
        setThreads([]);
        setFilteredThreads([]);
      }
    };

    fetchThreads();
  }, [showCreated]);

  // Filter threads based on the search query
  useEffect(() => {
    const filterThreads = () => {
      let filtered = threads;

      if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(thread =>
          thread.username.toLowerCase().includes(lowercasedQuery) ||
          thread.body.toLowerCase().includes(lowercasedQuery)
        );
      }

      const now = new Date();
      if (filter === 'week') {
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(thread => new Date(thread.created) >= oneWeekAgo);
      } else if (filter === 'month') {
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter(thread => new Date(thread.created) >= oneMonthAgo);
      }

      setFilteredThreads(filtered);
    };

    filterThreads();
  }, [searchQuery, filter, threads]);

  return (
    <div>
      <Header />
      <h1>Friends Feed</h1>
      <div className='button-container'>
        <button className={`toggle-button ${showCreated ? 'toggle-on' : 'toggle-off'}`} onClick={() => setShowCreated(!showCreated)}>
          {showCreated ? 'View Received' : 'View Created'}
        </button>
        <button className="create-thread-button" onClick={() => navigate('/createThread', { state: { defaultReceiverType: 'friend' } })}>
          Create Thread
        </button>
      </div>
      <div className='button-container'> 
      <input
          type="text"
          placeholder="Search by username or thread body..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />
        <button className={`filter-button ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
        <button className={`filter-button ${filter === 'week' ? 'active' : ''}`} onClick={() => setFilter('week')}>Past Week</button>
        <button className={`filter-button ${filter === 'month' ? 'active' : ''}`} onClick={() => setFilter('month')}>Past Month</button>
      </div>
      <div className="thread-list">
        {filteredThreads.map(thread => (
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

export { FriendsFeed };
