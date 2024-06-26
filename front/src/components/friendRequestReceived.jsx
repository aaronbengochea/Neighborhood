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
        if (res.data.message){
            console.log(res.data.message)
            setRequests([]);
        } else {
          setRequests(friendRequestsData);
        }
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
          await axios.post('http://localhost:4000/acceptFriendRequest', {
            uid,
            senderUid
        });

        // Update the state to reflect the accepted request
        onFriendAccepted()
        setRequests(requests.filter(request => request.uid !== senderUid));
        } catch (error) {
        console.error('Failed to accept friend request:', error);
        }
    };

  return (
    <div className="friends-list">
      <h2>Friend Requests Received</h2>
      <ul>
        {requests.map(request => (
          <li key={request.username}>
            <span>{request.username} - {request.b_name} --- {new Date(request.request_time).toLocaleString()} --- </span>
            <button className="accept-button" onClick={() => acceptRequest(request.uid)}>Accept</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { AcceptFriendRequests };