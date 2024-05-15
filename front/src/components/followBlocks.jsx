import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comp.css';

function FollowBlocks({ onBlockFollowed }) {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    const fetchBlocks = async () => {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        console.error('No UID found in localStorage');
        return;
      }

      try {
        const res = await axios.get(`http://localhost:4000/findBlocksToFollowFetch/${uid}`);
        const blockData = res.data && res.data.threads ? res.data.threads : [];
        if (res.data.message){
          console.log(res.data.message)
          setBlocks([]);
        } else {
          setBlocks(blockData);
        }
      } catch (error) {
        console.error('Failed to fetch blocks:', error);
        setBlocks([]);
      }
    };

    fetchBlocks();
  }, []);

  const followBlock = async (bid) => {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('No UID found in localStorage');
      return;
    }

    try {
      const res = await axios.post('http://localhost:4000/followBlock', {
        uid,
        bid
      });
      console.log('Block followed successfully:', res.data);
      onBlockFollowed();
      setBlocks(currentBlocks => currentBlocks.filter(block => block.bid !== bid));
    } catch (error) {
      console.error('Failed to follow block:', error);
    }
  };

  return (
    <div className="friends-list">
      <h2>Follow Blocks</h2>
      <ul>
        {blocks.map(block => (
          <li key={block.bid}>
            <span>{block.b_name} - {block.n_name} --- </span>
            <button className="follow-button" onClick={() => followBlock(block.bid)}>Follow</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { FollowBlocks };
