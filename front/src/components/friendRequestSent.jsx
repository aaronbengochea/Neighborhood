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
        if (res.data.message){
          console.log(res.data.message)
          setRequests([]);
        } else {
          setRequests(friendRequestsData);
        }
        
      } catch (error) {
        console.error('Failed to fetch pending friend requests:', error);
        setRequests([]);
      }
    };

    fetchPendingRequests();
  }, [reloadTrigger]);

  return (
    <div className="friends-list">
      <h2>Friend Request Sent</h2>
      <ul>
        {requests.map(request => (
          <li key={request.username}>
            <span>{request.username} ----- {new Date(request.request_time).toLocaleString()}</span>
            
            {/*<button className="revoke-button">Revoke</button>*/}
            
          </li>
        ))}
      </ul>
    </div>
  );
}

export { PendingFriendRequests };