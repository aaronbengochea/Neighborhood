import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { FriendsList } from './friendsList';
import { NeighborsList } from './neighborsList';
import  {AcceptFriendRequests} from './friendRequestReceived'
import { PendingFriendRequests } from './friendRequestSent'
import { MembershipVoting } from './membershipVoting'
import { FindNeighbors } from './addNeighbors'
import { FindFriends } from './addFriends'
import { FollowBlocks } from './followBlocks'
import { FollowedBlocks } from './followedBlocks'
import { FindEligibleBlockForMembership } from './applyToBlockMembership'
import { JoinedBlocksPending } from './applyToBlockMembershipPending'
import { Header } from './header';
import './comp.css';

function Home() {
  const navigate = useNavigate();
  const [reloadNeighbors, setReloadNeighbors] = useState(false);
  const [reloadFriends, setReloadFriends] = useState(false);
  const [reloadPendingFriends, setReloadPendingFriends] = useState(false);
  const [reloadBlockFollowed, setReloadBlockFollowed] = useState(false);
  const [reloadEligibleBlockApplied, setReloadEligibleBlockApplied] = useState(false);
  
  const handleNeighborAdded = () => {
    setReloadNeighbors(prev => !prev); // Toggle the state to trigger reload
  };

  const handleFriendAccepted = () => {
    setReloadFriends(prev => !prev); // Toggle the state to trigger reload
  };

  const handleFriendRequestSent = () => {
    setReloadPendingFriends(prev => !prev); // Toggle the state to trigger reload
  };

  const handleBlockFollowed = () => {
    setReloadBlockFollowed(prev => !prev); // Toggle the state to trigger reload
  };

  const handleEligibleBlockApplied = () => {
    setReloadEligibleBlockApplied(prev => !prev); // Toggle the state to trigger reload
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
        <FollowedBlocks reloadTrigger={reloadBlockFollowed}/>
        
        <FollowBlocks onBlockFollowed={handleBlockFollowed}/>
        <AcceptFriendRequests onFriendAccepted={handleFriendAccepted}/>
        <PendingFriendRequests reloadTrigger={reloadPendingFriends}/>
        <JoinedBlocksPending reloadTrigger={reloadEligibleBlockApplied}/>
        <FindEligibleBlockForMembership onEligibleBlockApplied={handleEligibleBlockApplied}/>
        
        <MembershipVoting/>
        <FindNeighbors onNeighborAdded={handleNeighborAdded}/>
        <FindFriends onFriendRequestSent={handleFriendRequestSent}/>
      </div>
    </div>
  );
}

export { Home };

