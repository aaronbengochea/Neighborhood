import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comp.css';

function FindFriends({ onFriendRequestSent }) {
  const [potentialFriends, setPotentialFriends] = useState([]);

  useEffect(() => {
    const fetchPotentialFriends = async () => {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        console.error('No UID found in localStorage');
        return;
      }

      try {
        const res = await axios.get(`http://localhost:4000/findFriends/${uid}`);
        const friendsData = res.data && res.data.threads ? res.data.threads : [];
        if (res.data.message){
          console.log(res.data.message)
          setPotentialFriends([]);
        } else {
          setPotentialFriends(friendsData);
        }
        
      } catch (error) {
        console.error('Failed to fetch potential friends:', error);
        setPotentialFriends([]);
      }
    };

    fetchPotentialFriends();
  }, []);

  const sendFriendRequest = async (friendUid) => {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('No UID found in localStorage');
      return;
    }

    try {
      const res = await axios.post('http://localhost:4000/sendFriendRequest', {
        uid,
        friendUid
      });
      console.log('Friend request sent:', res.data);
      onFriendRequestSent(); // Update any parent component or hook
      setPotentialFriends(potentialFriends.filter(f => f.uid !== friendUid)); // Remove from list
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  return (
    <div className="friends-list">
      <h2>Find Friends</h2>
      <ul>
        {potentialFriends.map(friend => (
          <li key={friend.uid}>
            <span>{friend.username} ----- </span>
            <button className="add-button" onClick={() => sendFriendRequest(friend.uid)}>Send Friend Request</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { FindFriends };