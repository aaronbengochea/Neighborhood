import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comp.css';

function PendingFriendRequests({reloadTrigger}) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        console.error('No UID found in localStorage');
        return;
      }

      try {
        const res = await axios.get(`http://localhost:4000/friendRequestsSentPending/${uid}`);
        const friendRequestsData = res.data && res.data.threads ? res.data.threads : [];
        setRequests(friendRequestsData);
      } catch (error) {
        console.error('Failed to fetch pending friend requests:', error);
        setRequests([]);
      }
    };

    fetchPendingRequests();
  }, [reloadTrigger]);

  return (
    <div className="pending-friends">
      <h2>Pending Friend Requests</h2>
      <ul>
        {requests.map(request => (
          <li key={request.username}>
            <span>{request.username} ----- ({request.request_time})</span>
            <button className="revoke-button">Revoke</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { PendingFriendRequests };