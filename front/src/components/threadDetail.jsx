import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ThreadDetail({ threadId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/messages/${threadId}`); // Adjust with your actual endpoint
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
  }, [threadId]);

  return (
    <div>
      <h1>Messages in Thread</h1>
      <ul>
        {messages.map(message => (
          <li key={message.mid}>
            {message.body}
            <br />
            <small>{new Date(message.created).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export {ThreadDetail};
