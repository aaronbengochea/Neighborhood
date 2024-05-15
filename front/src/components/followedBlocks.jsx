import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comp.css';

function FollowedBlocks({reloadTrigger}) {
  const [followedBlocks, setFollowedBlocks] = useState([]);

  useEffect(() => {
    const fetchFollowedBlocks = async () => {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        console.error('No UID found in localStorage');
        return;
      }

      try {
        const res = await axios.get(`http://localhost:4000/findFollowedBlocksFetch/${uid}`);
        const blockData = res.data && res.data.threads ? res.data.threads : [];
        if (res.data.message){
          console.log(res.data.message)
          setFollowedBlocks([]);
        } else {
          setFollowedBlocks(blockData);
        }
       
      } catch (error) {
        console.error('Failed to fetch followed blocks:', error);
        setFollowedBlocks([]);
      }
    };

    fetchFollowedBlocks();
  }, [reloadTrigger]);

  return (
    <div className="friends-list">
      <h2>Followed Blocks - State updated w/ change</h2>
      <ul>
        {followedBlocks.map(block => (
          <li key={block.bid}>
            <span>{block.b_name} - {block.n_name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { FollowedBlocks };