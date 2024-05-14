import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Header } from './header'
import './comp.css'

function FollowedBlocksFeed() {
  const [threads, setThreads] = useState([])

  useEffect(() => {
    const uid = localStorage.getItem('uid')
    if (!uid) return

    const fetchThreads = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/followedBlocksFeedThreads/receivedFollowedBlocks/${uid}`) // Adjusted endpoint
        if (res.data.message){
            console.log(res.data.message)
            setThreads([])
          } else {
            setThreads(res.data.threads);
          }
      } catch (error) {
        console.error('Failed to fetch threads:', error.response.data)
        setThreads([])
      }
    }

    fetchThreads()
  }, []) // Dependency on showCreated to refetch when toggled

  return (
    <div>
      <Header />
      <h1>Followed Blocks Feed</h1>
      <div className="thread-list">
        {threads.map(thread => (
          <div key={thread.tid} className="thread-card">
            <h2>{thread.subject} - <small>{`Posted by ${thread.username}, Block: ${thread.b_name}, Neighborhood: ${thread.n_name}`}</small></h2>
            <p className="thread-body">{thread.body}</p>
            <p className="thread-date">Created at: {new Date(thread.created).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export { FollowedBlocksFeed }
