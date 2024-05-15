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
        if (res.data.message){
          console.log(res.data.message)
          setApplicants([]);
        } else {
          setApplicants(membershipApplicants);
        }
      } catch (error) {
        console.error('Failed to fetch membership applicants:', error);
        setApplicants([]);
      }
    };

    fetchApplicants();
  }, []);

  const handleVote = async (joinerUid, joinerBid) => {
    const voterUid = localStorage.getItem('uid');
    if (!voterUid) {
      console.error('No voter UID found in localStorage');
      return;
    }

    try {
      const res = await axios.post('http://localhost:4000/submitMembershipVote', {
        voter: voterUid,
        joiner: joinerUid,
        block: joinerBid
      });
      setApplicants(currentApplicants => currentApplicants.filter(applicant => applicant.uid !== joinerUid));
      console.log('Vote submitted successfully:', res.data);
      // Optionally, refresh the list or show feedback
    } catch (error) {
      console.error('Failed to submit vote:', error.response ? error.response.data : error);
    }
  };

  return (
    <div className="friends-list">
      <h2>Membership Voting - working w/button + updating membership if needed</h2>
      <ul>
        {applicants.map(applicant => (
          <li key={applicant.uid}>
            <span>{applicant.username} - {applicant.b_name} - {applicant.n_name} --- </span>
            <button className="accept-button" onClick={() => handleVote(applicant.uid, applicant.bid)}>Accept</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { MembershipVoting };
