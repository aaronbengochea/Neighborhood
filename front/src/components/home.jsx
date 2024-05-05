import React from 'react';
import { FriendsList } from './friendsList';
import { NeighborsList } from './neighborsList';
import  {AcceptFriendRequests} from './friendRequestReceived'
import { PendingFriendRequests } from './friendRequestSent'
import { MembershipVoting } from './membershipVoting'
import { Header } from './header';
import './comp.css';

function Home() {

  return (
    <div>
      <Header />
      <h1>Home</h1>
      <div className="list-container">
        <FriendsList />
        <NeighborsList />
        <AcceptFriendRequests/>
        <PendingFriendRequests/>
        <MembershipVoting/>
      </div>
    </div>
  );
}

export { Home };

