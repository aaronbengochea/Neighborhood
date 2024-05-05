import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comp.css';

function AcceptFriendRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        console.error('No UID found in localStorage');
        return;
      }

      try {
        const res = await axios.get(`http://localhost:4000/friendRequestsRecievedPending/${uid}`);
        const friendRequestsData = res.data && res.data.threads ? res.data.threads : [];
        setRequests(friendRequestsData);
      } catch (error) {
        console.error('Failed to fetch friend requests:', error);
        setRequests([]);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="accept-friends">
      <h2>Received Friend Requests</h2>
      <ul>
        {requests.map(request => (
          <li key={request.username}>
            <span>{request.username} ----- {request.b_name} ({request.request_time})</span>
            <button className="accept-button">Accept</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { AcceptFriendRequests };