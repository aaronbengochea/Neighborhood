import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { FriendsList } from './friendsList';
import { NeighborsList } from './neighborsList';
import  {AcceptFriendRequests} from './friendRequestReceived'
import { PendingFriendRequests } from './friendRequestSent'
import { MembershipVoting } from './membershipVoting'
import { FindNeighbors } from './addNeighbors'
import { Header } from './header';
import './comp.css';

function Home() {
  const navigate = useNavigate();
  const [reloadNeighbors, setReloadNeighbors] = useState(false);
  const [reloadFriends, setReloadFriends] = useState(false);

  const handleNeighborAdded = () => {
    setReloadNeighbors(prev => !prev); // Toggle the state to trigger reload
  };

  const handleFriendAccepted = () => {
    setReloadFriends(prev => !prev); // Toggle the state to trigger reload
  };

  const handleEditProfileClick = () => {
    navigate('/editUserProfile');
  };

  return (
    <div>
      <Header />
      <h1>Home</h1>
      <div className="list-container">
      <button onClick={handleEditProfileClick}>Edit User Profile</button>
        <FriendsList reloadTrigger={reloadFriends}/>
        <NeighborsList reloadTrigger={reloadNeighbors}/>
        <AcceptFriendRequests onFriendAccepted={handleFriendAccepted}/>
        <PendingFriendRequests/>
        <MembershipVoting/>
        <FindNeighbors onNeighborAdded={handleNeighborAdded}/>
      </div>
    </div>
  );
}

export { Home };

