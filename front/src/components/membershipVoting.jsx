import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './comp.css';

function MembershipVoting() {
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    const fetchApplicants = async () => {
    const uid = localStorage.getItem('uid');
    if (!uid) {
        console.error('No UID found in localStorage');
        return;
      }

    try {
        const res = await axios.get(`http://localhost:4000/membershipSeekers/${uid}`);
        const membershipApplicants = res.data && res.data.threads ? res.data.threads : [];
        setApplicants(membershipApplicants);
    } catch (error) {
        console.error('Failed to fetch membership applicants:', error);
        setApplicants([]);
    }
    };

    fetchApplicants();
  }, []);



  return (
    <div className="membership-voting">
      <h2>Membership Voting</h2>
      <ul>
        {applicants.map(applicant => (
          <li key={applicant.uid}>
            <span>{applicant.username} ({applicant.b_name})</span>
            <button className="accept-button">Accept</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { MembershipVoting };
