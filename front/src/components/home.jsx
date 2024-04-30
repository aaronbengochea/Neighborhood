import React from 'react';
import { Header } from './header'

function Home() {
  const uid = localStorage.getItem('uid'); // Retrieve UID from localStorage

  return (
    
    <div>
        <Header />


      <h1>Welcome to the Home Page</h1>
      <p>Your User ID: {uid}</p>
    </div>
  );
}

export {Home}
