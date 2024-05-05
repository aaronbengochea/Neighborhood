import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comp.css';

function FindNeighbors({onNeighborAdded}) {
  const [potentialNeighbors, setPotentialNeighbors] = useState([]);

  useEffect(() => {
    const fetchPotentialNeighbors = async () => {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        console.error('No UID found in localStorage');
        return;
      }

      try {
        const res = await axios.get(`http://localhost:4000/findNeighbors/${uid}`);
        const neighborsData = res.data && res.data.threads ? res.data.threads : [];
        setPotentialNeighbors(neighborsData);
      } catch (error) {
        console.error('Failed to fetch potential neighbors:', error);
        setPotentialNeighbors([]);
      }
    };

    fetchPotentialNeighbors();
  }, []);


  const addNeighbor = async (neighborUid) => {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('No UID found in localStorage');
      return;
    }
    console.log(typeof uid, typeof neighborUid)
    try {
      const res = await axios.post('http://localhost:4000/addNeighborsToList', {
        uid,
        neighborUid
      });
      console.log(res.data.message);

      onNeighborAdded()
      setPotentialNeighbors(potentialNeighbors.filter(n => n.uid !== neighborUid));
    } catch (error) {
      console.error('Failed to add neighbor:', error);
    }
  };

  return (
    <div className="find-neighbors">
      <h2>Add Neighbors to Neighbor List - working w/ button</h2>
      <ul>
        {potentialNeighbors.map(neighbor => (
          <li key={neighbor.username}>
            <span>{neighbor.username} ----- {neighbor.b_name} ----- </span>
            <button className="add-button" onClick={() => addNeighbor(neighbor.uid)}>Add Neighbor</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { FindNeighbors };
