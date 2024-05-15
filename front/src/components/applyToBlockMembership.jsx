import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comp.css';

function FindEligibleBlockForMembership({ onEligibleBlockApplied }) {
  const [eligibleBlocks, setEligibleBlocks] = useState([]);

  useEffect(() => {
    const fetchEligibleBlocks = async () => {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        console.error('No UID found in localStorage');
        return;
      }

      try {
        const res = await axios.get(`http://localhost:4000/findEligibleBlockForMembership/${uid}`);
        const blockData = res.data && res.data.threads ? res.data.threads : [];
        if (res.data.message){
            console.log(res.data.message)
            setEligibleBlocks([]);
        } else {
            setEligibleBlocks(blockData);
        }
        
      } catch (error) {
        console.error('Failed to fetch blocks:', error);
        setEligibleBlocks([]);
      }
    };

    fetchEligibleBlocks();
  }, []);

  const applyBlockMembership = async (bid) => {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('No UID found in localStorage');
      return;
    }

    try {
      const res = await axios.post('http://localhost:4000/applyForBlockMembership', {
        uid,
        bid
      });
      console.log('Block followed successfully:', res.data);
      onEligibleBlockApplied();
      setEligibleBlocks(currentBlocks => currentBlocks.filter(block => block.bid !== bid));
    } catch (error) {
      console.error('Failed to follow block:', error);
    }
  };

  return (
    <div className="friends-list">
      <h2>Apply for Block Membership - working w/ button</h2>
      <ul>
        {eligibleBlocks.map(block => (
          <li key={block.bid}>
            <span>{block.b_name} in {block.n_name} ----- </span>
            <button className="follow-button" onClick={() => applyBlockMembership(block.bid)}>Apply</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { FindEligibleBlockForMembership };