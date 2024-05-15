import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Header } from './header';

function ThreadDetail() {
  const { tid } = useParams();
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/thread/${tid}`);
        const thread = res.data && res.data.threads ? res.data.threads : [];
        if (res.data.message){
          console.log(res.data.message)
          setThread([]);
        } else {
          setThread(thread[0]);
          console.log(thread[0])
        }
      } catch (error) {
        console.error('Failed to fetch thread:', error);
      }
    };

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/threadMessages/${tid}`);
        const messages = res.data && res.data.threads ? res.data.threads : [];
        if (res.data.message){
          console.log(res.data.message)
          setMessages([]);
        } else {
          setMessages(messages);
        }
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchThread();
    fetchMessages();
  }, [tid]);

  const handleNewMessageChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleNewMessageSubmit = async (e) => {
    e.preventDefault();
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('No UID found in localStorage');
      return;
    }
    if (newMessage.trim() === '') {
      console.error('Message is empty');
      return;
    }

    try {
      await axios.post(`http://localhost:4000/postMessage/${tid}`, {
        uid,
        body: newMessage,
      });
      setNewMessage('');
      // Fetch the updated messages after posting a new one
      const res = await axios.get(`http://localhost:4000/threadMessages/${tid}`);
      const messages = res.data && res.data.threads ? res.data.threads : [];
      if (res.data.message){
        console.log(res.data.message)
        setMessages([]);
      } else {
        setMessages(messages);
      }
    } catch (error) {
      console.error('Failed to post new message:', error);
    }
  };





  return (
    <div>
      <Header />
      <div className="thread-detail">
        {thread ? (
          <><h1>Thread + Messages</h1>
          <div className="thread-card">
            <h2>{thread.subject} - <small>{`Posted by ${thread.username}`}</small></h2>
            
            <p className="thread-body">Subject: {thread.subject}</p>
            <p className="thread-date">Created at: {new Date(thread.created).toLocaleString()}</p>
            <p className='thread-date'>Sent to: {thread.receivertype}</p>
          
          </div>
          <h2>Messages</h2>
            <div className="thread-card">
              
              {messages.map(message => (
                <div key={message.mid} className="message">
                  <p className='thread-body'>{message.body}</p>
                  <p className='thread-date'>Posted by: {message.username}</p>
                  <p className='thread-date'>Created at: {new Date(message.created).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <form className='form-field' onSubmit={handleNewMessageSubmit}>
              <textarea
                value={newMessage}
                onChange={handleNewMessageChange}
                rows="4"
                required
              />
              <button type="submit">Post Message</button>
            </form>
          </>
        ) : (
          <p>Loading thread...</p>
        )}
      </div>
    </div>
  );
}

export { ThreadDetail };
