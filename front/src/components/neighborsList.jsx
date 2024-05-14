import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comp.css';

function NeighborsList({reloadTrigger}) {
  const [neighbors, setNeighbors] = useState([]);

  useEffect(() => {
    const fetchNeighbors = async () => {
      const uid = localStorage.getItem('uid');
      if (!uid) return

      try {
        const res = await axios.get(`http://localhost:4000/neighborsList/${uid}`);
        const neighborsData = res.data && res.data.threads ? res.data.threads : [];
        if (res.data.message){
          console.log(res.data.message)
          setNeighbors([]);
        } else {
          setNeighbors(neighborsData);
        }
      } catch (error) {
        console.error('Failed to fetch neighbors:', error);
        setNeighbors([]);
      }
    };

    fetchNeighbors();
  }, [reloadTrigger]);

  return (
    <div className="neighbors-list">
      <h2>Neighbors List - State updated w/ change</h2>
      <ul>
        {neighbors.map(neighbor => (
          <li key={neighbor.username}> {neighbor.username} ----- {neighbor.b_name}</li>
        ))}
      </ul>
    </div>
  );
}

export { NeighborsList };
