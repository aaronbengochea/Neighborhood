import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comp.css';

function JoinedBlocksPending({reloadTrigger}) {
  const [joinedBlocks, setJoinedBlocks] = useState([]);

  useEffect(() => {
    const fetchJoinedBlocksPending = async () => {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        console.error('No UID found in localStorage');
        return;
      }

      try {
        const res = await axios.get(`http://localhost:4000/findJoinedBlocksPendingFetch/${uid}`);
        const joinedBlocksPendingData = res.data && res.data.threads ? res.data.threads : [];
        if (res.data.message){
            console.log(res.data.message)
            setJoinedBlocks([]);
        } else {
            setJoinedBlocks(joinedBlocksPendingData);
        }
        
      } catch (error) {
        console.error('Failed to fetch followed blocks:', error);
        setJoinedBlocks([]);
      }
    };

    fetchJoinedBlocksPending();
  }, [reloadTrigger]);

  return (
    <div className="friends-list">
      <h2>Block Membership Pending Application</h2>
      <ul>
        {joinedBlocks.map(block => (
          <li key={block.bid}>
            <span>{block.b_name} - {block.n_name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { JoinedBlocksPending };