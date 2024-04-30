import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Signin, Register, Home, BlockFeed, NeighborhoodFeed, NeighborsFeed, FriendsFeed, CreateThread} from './components';
import { ThreadDetail } from './components/threadDetail';

function App() {
  return (
    <Router>
      <div>
        {/* Navigation Links or Navbar Component can go here */}
        <Routes>
          <Route exact path='/' element={<Signin/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/home' element={<Home/>}/>
          <Route path='/blockFeed' element={<BlockFeed/>}/>
          <Route path='/neighborhoodFeed' element={<NeighborhoodFeed/>}/>
          <Route path='/friendsFeed' element={<FriendsFeed/>}/>
          <Route path='/neighborsFeed' element={<NeighborsFeed/>}/>
          <Route path='/createThread' element={<CreateThread/>}/>
          <Route path="/threads/:tid" element={({ match }) => <ThreadDetail threadId={match.params.tid} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
