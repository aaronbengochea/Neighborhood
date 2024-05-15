import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comp.css';

function FriendsList({reloadTrigger}) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      const uid = localStorage.getItem('uid');
      if (!uid) return;

      try {
        const res = await axios.get(`http://localhost:4000/friendsList/${uid}`);
        let friendsData = res.data && res.data.threads ? res.data.threads : [];
        if (res.data.message){
          console.log(res.data.message)
          setFriends([]);
        } else {
          friendsData = friendsData.map(friend => ({
            ...friend,
            b_name: friend.b_name === null ? 'No Block' : friend.b_name
          }));
          setFriends(friendsData);
        }
      } catch (error) {
        console.error('Failed to fetch friends:', error);
        setFriends([]);
      }
    };

    fetchFriends();
  }, [reloadTrigger]);

  return (
    <div className="friends-list">
      <h2>Friends List</h2>
      <ul>
        {friends.map(friend => (
          <li key={friend.username}>{friend.username} ----- {friend.b_name}</li>
        ))}
      </ul>
    </div>
  );
}

export { FriendsList };
