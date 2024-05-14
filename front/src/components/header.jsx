import React from 'react';
import { NavLink } from 'react-router-dom';
import './comp.css'

function Header() {
  return (
    <nav>
      <NavLink to="/home">Home</NavLink>
      <NavLink to="/friendsFeed">Friends</NavLink>
      <NavLink to="/neighborsFeed">Neighbors</NavLink>
      <NavLink to="/blockFeed">Blocks</NavLink>
      <NavLink to="/neighborhoodFeed">Neighborhood</NavLink>
      <NavLink to="/followedBlocksFeed">Followed Blocks</NavLink>
    </nav>
  );
}

export {Header}