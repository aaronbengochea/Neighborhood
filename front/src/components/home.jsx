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
import { MembershipStatusList } from './membershipList'
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
      <div className='button-container'>
        <button className={`filter-button all`} onClick={handleEditProfileClick}>Edit User Profile</button>
      </div>
      <div className="list-container">
        <h2>Neighbors</h2>
        <NeighborsList reloadTrigger={reloadNeighbors}/>
        <FindNeighbors onNeighborAdded={handleNeighborAdded}/>
        <h2>Friends</h2>
        <FriendsList reloadTrigger={reloadFriends}/>
        <AcceptFriendRequests onFriendAccepted={handleFriendAccepted}/>
        <PendingFriendRequests reloadTrigger={reloadPendingFriends}/>
        <FindFriends onFriendRequestSent={handleFriendRequestSent}/>
        <h2>Follow Blocks</h2>
        <FollowedBlocks reloadTrigger={reloadBlockFollowed}/>
        <FollowBlocks onBlockFollowed={handleBlockFollowed}/>
        <h2>Block Membership Application + Voting</h2>
        <MembershipStatusList/>
        <JoinedBlocksPending reloadTrigger={reloadEligibleBlockApplied}/>
        <FindEligibleBlockForMembership onEligibleBlockApplied={handleEligibleBlockApplied}/>
        <MembershipVoting/>
        
      </div>
    </div>
  );
}

export { Home };

