import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comp.css';

function AcceptFriendRequests({onFriendAccepted}) {
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

    const acceptRequest = async (senderUid) => {
        const uid = localStorage.getItem('uid');
        try {
        const res = await axios.post('http://localhost:4000/acceptFriendRequest', {
            uid,
            senderUid
        });
        console.log(res.data.message);

        // Update the state to reflect the accepted request
        onFriendAccepted()
        setRequests(requests.filter(request => request.uid !== senderUid));
        } catch (error) {
        console.error('Failed to accept friend request:', error);
        }
    };

  return (
    <div className="accept-friends">
      <h2>Received Friend Requests - working w/ buttons</h2>
      <ul>
        {requests.map(request => (
          <li key={request.username}>
            <span>{request.username} ----- {request.b_name} ({request.request_time})</span>
            <button className="accept-button" onClick={() => acceptRequest(request.uid)}>Accept</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { AcceptFriendRequests };