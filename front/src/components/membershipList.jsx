import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comp.css';

function MembershipStatusList() {
  const [memberships, setMemberships] = useState([]);

  useEffect(() => {
    const fetchMemberships = async () => {
      const uid = localStorage.getItem('uid');
      if (!uid) return;

      try {
        const res = await axios.get(`http://localhost:4000/membershipStatus/${uid}`);
        const membershipsData = res.data && res.data.threads ? res.data.threads : [];
        if (res.data.message) {
          console.log(res.data.message);
          setMemberships([]);
        } else {
          setMemberships(membershipsData);
        }
      } catch (error) {
        console.error('Failed to fetch memberships:', error);
        setMemberships([]);
      }
    };

    fetchMemberships();
  }, []);

  return (
    <div className="friends-list">
      <h2>Membership Status</h2>
      <ul>
        {memberships.map(membership => (
          <li key={membership.bid}>Block: {membership.b_name} ----- Neighborhood: {membership.n_name}</li>
        ))}
      </ul>
    </div>
  );
}

export { MembershipStatusList };