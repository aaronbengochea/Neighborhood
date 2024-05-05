import React, {useState} from 'react';
import { FriendsList } from './friendsList';
import { NeighborsList } from './neighborsList';
import  {AcceptFriendRequests} from './friendRequestReceived'
import { PendingFriendRequests } from './friendRequestSent'
import { MembershipVoting } from './membershipVoting'
import { FindNeighbors } from './addNeighbors'
import { Header } from './header';
import './comp.css';

function Home() {

  const [reloadNeighbors, setReloadNeighbors] = useState(false);

  const handleNeighborAdded = () => {
    setReloadNeighbors(prev => !prev); // Toggle the state to trigger reload
  };

  return (
    <div>
      <Header />
      <h1>Home</h1>
      <div className="list-container">
        <FriendsList />
        <NeighborsList reloadTrigger={reloadNeighbors}/>
        <AcceptFriendRequests/>
        <PendingFriendRequests/>
        <MembershipVoting/>
        <FindNeighbors onNeighborAdded={handleNeighborAdded}/>
      </div>
    </div>
  );
}

export { Home };

